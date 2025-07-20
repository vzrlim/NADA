/**
 * Google Gemini API Integration for Natural Language Chat Assistant
 * Provides farmers with practical, step-by-step advice about water quality and farming
 * Enhanced with retry logic and robust error handling for production use
 */

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ChatContext {
  recent_analyses: any[];
  active_alerts: any[];
  location?: {
    latitude: number;
    longitude: number;
    region: string;
  };
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class GeminiChatAssistant {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private retryConfig: RetryConfig;

  constructor() {
    this.apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY') || '';
    this.model = 'gemini-1.5-flash'; // Updated to current model name
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    
    // Retry configuration for handling API overload
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffMultiplier: 2
    };
    
    if (!this.apiKey) {
      console.warn('⚠️ Google Gemini API key not configured - using fallback responses');
    } else {
      console.log(`✅ Gemini API initialized with model: ${this.model}`);
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    const jitter = Math.random() * 0.3 * delay; // Add up to 30% jitter
    return Math.min(delay + jitter, this.retryConfig.maxDelay);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(status: number, errorMessage: string): boolean {
    // Retry on server errors and rate limits
    if (status >= 500 && status < 600) return true; // 5xx server errors
    if (status === 429) return true; // Rate limit
    if (status === 503) return true; // Service unavailable / overloaded
    if (errorMessage.toLowerCase().includes('overloaded')) return true;
    if (errorMessage.toLowerCase().includes('rate limit')) return true;
    if (errorMessage.toLowerCase().includes('temporarily unavailable')) return true;
    return false;
  }

  /**
   * Make API call to Gemini with retry logic
   */
  private async makeGeminiRequest(requestBody: any, attempt: number = 0): Promise<Response> {
    try {
      console.log(`🤖 Calling Gemini API (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1})`);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody)
      });

      // If successful, return response
      if (response.ok) {
        console.log(`✅ Gemini API call successful on attempt ${attempt + 1}`);
        return response;
      }

      // Handle error responses
      const errorText = await response.text();
      console.log(`⚠️ Gemini API responded with ${response.status}: ${errorText}`);

      // Check if we should retry
      if (attempt < this.retryConfig.maxRetries && this.isRetryableError(response.status, errorText)) {
        const delay = this.calculateRetryDelay(attempt);
        console.log(`🔄 Retrying Gemini API call in ${delay.toFixed(0)}ms due to ${response.status} error`);
        
        await this.sleep(delay);
        return this.makeGeminiRequest(requestBody, attempt + 1);
      }

      // If not retryable or max retries reached, throw error
      const errorData = this.parseErrorResponse(errorText);
      throw new Error(`Gemini API ${response.status}: ${errorData.message || errorText}`);

    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error(`🌐 Network error on attempt ${attempt + 1}:`, error.message);
        
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateRetryDelay(attempt);
          console.log(`🔄 Retrying due to network error in ${delay.toFixed(0)}ms`);
          
          await this.sleep(delay);
          return this.makeGeminiRequest(requestBody, attempt + 1);
        }
      }
      
      throw error;
    }
  }

  /**
   * Parse error response from Gemini API
   */
  private parseErrorResponse(errorText: string): { message?: string; code?: number } {
    try {
      const errorData = JSON.parse(errorText);
      
      // Log structured error for debugging
      if (errorData.error) {
        console.error('📊 Gemini API structured error:', {
          code: errorData.error.code,
          message: errorData.error.message,
          status: errorData.error.status
        });
        
        return {
          message: errorData.error.message,
          code: errorData.error.code
        };
      }
      
      return { message: errorText };
    } catch (e) {
      console.error('📄 Gemini API raw error:', errorText);
      return { message: errorText };
    }
  }

  /**
   * Process farmer's natural language query with contextual water quality data
   */
  async processFarmerQuery(
    query: string, 
    context: ChatContext
  ): Promise<{ response: string; follow_up_questions?: string[] }> {
    try {
      if (!this.apiKey) {
        console.log('🔄 Gemini API key not available, using intelligent fallback response');
        return {
          response: this.getFallbackResponse(query, context),
          follow_up_questions: this.generateFollowUpQuestions(context)
        };
      }

      // Build contextual prompt for Gemini
      const contextualPrompt = this.buildContextualPrompt(query, context);
      
      const requestBody = {
        contents: [{
          parts: [{
            text: contextualPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 500,
          candidateCount: 1
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      // Make API call with retry logic
      const response = await this.makeGeminiRequest(requestBody);
      
      const data: GeminiResponse = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        console.error('❌ No text generated by Gemini API');
        return {
          response: this.getFallbackResponse(query, context),
          follow_up_questions: this.generateFollowUpQuestions(context)
        };
      }

      console.log(`✅ Gemini response generated successfully for query: "${query.substring(0, 30)}..."`);
      
      return {
        response: this.formatGeminiResponse(generatedText),
        follow_up_questions: this.generateFollowUpQuestions(context)
      };

    } catch (error) {
      console.error('❌ Gemini API integration error after all retries:', error.message);
      
      // Provide helpful error context to user
      let errorContext = "";
      if (error.message.includes('503') || error.message.includes('overloaded')) {
        errorContext = " (Google's AI is currently experiencing high demand)";
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorContext = " (API rate limit reached)";
      }
      
      return {
        response: this.getFallbackResponse(query, context, errorContext),
        follow_up_questions: this.generateFollowUpQuestions(context)
      };
    }
  }

  /**
   * Build contextual prompt for Gemini with NADA-specific context
   */
  private buildContextualPrompt(query: string, context: ChatContext): string {
    let prompt = `You are NADA (Natural Acoustic Diagnostics & Alerts), an AI assistant helping Malaysian rice paddy farmers understand water quality through frog call analysis.

CONTEXT:
You use bioacoustic monitoring (frog calls) to assess water quality. High frog activity (≥50 calls/min) indicates good water quality, moderate activity (30-49 calls/min) suggests caution, and low activity (<30 calls/min) indicates potential water quality issues.

`;

    // Add recent analysis context
    if (context.recent_analyses && context.recent_analyses.length > 0) {
      const latest = context.recent_analyses[0];
      prompt += `LATEST WATER QUALITY DATA:
- Frog call density: ${latest.frog_analysis?.call_density || 'N/A'} calls per minute
- Water quality status: ${latest.water_quality_assessment?.status || 'Unknown'}
- Species detected: ${latest.frog_analysis?.species_detected?.join(', ') || 'None'}
- Biodiversity score: ${latest.environmental_analysis?.biodiversity_score ? (latest.environmental_analysis.biodiversity_score * 100).toFixed(1) + '%' : 'N/A'}
- Ecosystem health: ${latest.environmental_analysis?.ecosystem_health || 'Unknown'}

`;
    }

    // Add active alerts context
    if (context.active_alerts && context.active_alerts.length > 0) {
      const unreadAlerts = context.active_alerts.filter((a: any) => !a.read);
      if (unreadAlerts.length > 0) {
        prompt += `ACTIVE ALERTS:
${unreadAlerts.map((a: any) => `- ${a.title}: ${a.message}`).join('\n')}

`;
      }
    }

    // Add location context
    if (context.location) {
      prompt += `LOCATION: ${context.location.region} (${context.location.latitude.toFixed(3)}, ${context.location.longitude.toFixed(3)})

`;
    }

    prompt += `FARMER'S QUESTION: "${query}"

INSTRUCTIONS:
1. Provide practical, actionable advice for Malaysian rice farmers
2. Use simple English, avoid technical jargon
3. Reference the specific data from their latest recordings when relevant
4. Include step-by-step recommendations when appropriate
5. Focus on water quality, frog populations, and sustainable farming practices
6. Keep responses concise (under 400 words)
7. If suggesting chemical testing or major changes, recommend consulting local agricultural extension officers

Please provide a helpful, farmer-friendly response:`;

    return prompt;
  }

  /**
   * Format Gemini's response for better readability
   */
  private formatGeminiResponse(response: string): string {
    // Clean up the response and ensure it's farmer-friendly
    let formatted = response
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up excessive line breaks
      .trim();

    // Ensure it starts with a friendly greeting if it doesn't already
    if (!formatted.toLowerCase().startsWith('hello') && 
        !formatted.toLowerCase().startsWith('hi') &&
        !formatted.toLowerCase().startsWith('good') &&
        !formatted.toLowerCase().includes('your')) {
      formatted = `Based on your latest recordings, ${formatted.charAt(0).toLowerCase() + formatted.slice(1)}`;
    }

    return formatted;
  }

  /**
   * Enhanced fallback response when Gemini API is unavailable
   */
  private getFallbackResponse(query: string, context: ChatContext, errorContext: string = ""): string {
    const lowerQuery = query.toLowerCase();

    // Water quality queries
    if (lowerQuery.includes('water quality') || lowerQuery.includes('paddy') || lowerQuery.includes('rice field')) {
      if (context.recent_analyses && context.recent_analyses.length > 0) {
        const latest = context.recent_analyses[0];
        const status = latest.water_quality_assessment?.status;
        const callDensity = latest.frog_analysis?.call_density;

        if (status === 'good') {
          return `Your water quality looks excellent! I detected ${callDensity} frog calls per minute, which indicates very healthy water conditions. The high frog activity shows your ecosystem is thriving. Continue your current farming practices - they're working well!`;
        } else if (status === 'warning') {
          return `Your water quality needs some attention. I detected ${callDensity} frog calls per minute, which is in the moderate range. Here's what I recommend: 1) Test your water pH levels, 2) Temporarily reduce chemical fertilizer use, 3) Check for runoff from nearby areas, 4) Monitor daily for the next week to track changes.`;
        } else {
          return `⚠️ Your water quality is concerning. I only detected ${callDensity} frog calls per minute, which is quite low. IMMEDIATE STEPS: 1) Stop adding any chemicals temporarily, 2) Test water pH and dissolved oxygen levels, 3) Look for contamination sources (runoff, waste), 4) Contact your local agricultural extension officer for professional water testing assistance.`;
        }
      }
      return "I don't have recent water quality data from your fields. Please record some audio from your rice paddies (preferably at dawn or dusk when frogs are most active) so I can help assess the situation and provide specific advice.";
    }

    // Frog-related queries
    if (lowerQuery.includes('frog') || lowerQuery.includes('call') || lowerQuery.includes('sound')) {
      if (context.recent_analyses && context.recent_analyses.length > 0) {
        const latest = context.recent_analyses[0];
        const species = latest.frog_analysis?.species_detected || [];
        
        if (species.length > 0) {
          return `Great news! In your latest recording, I identified ${species.length} different frog species including ${species[0]}. This diversity is a positive sign for your water quality. Different frog species have different tolerance levels for water conditions, so having multiple species suggests your water is supporting a healthy amphibian community, which is generally excellent for rice farming.`;
        } else {
          return `I didn't detect clear frog calls in your latest recording. This could mean several things: 1) You recorded during inactive hours (frogs are most active at dawn and dusk), 2) Frogs might be stressed due to water quality issues, 3) Seasonal variation in frog activity. I recommend recording again at dawn (5-7 AM) or dusk (6-8 PM) when frogs are most vocal.`;
        }
      }
      return "To help you understand what frog species are in your rice fields, please record audio during dawn (5-7 AM) or dusk (6-8 PM) when frogs are most active. I'll analyze their calls and tell you what they indicate about your water quality.";
    }

    // Improvement/action queries
    if (lowerQuery.includes('improve') || lowerQuery.includes('fix') || lowerQuery.includes('what should') || lowerQuery.includes('how to')) {
      if (context.recent_analyses && context.recent_analyses.length > 0) {
        const latest = context.recent_analyses[0];
        const status = latest.water_quality_assessment?.status;
        
        if (status === 'good') {
          return `Your water quality is already excellent! To maintain these great conditions: 1) Continue your current water management practices, 2) Monitor regularly with NADA recordings, 3) Maintain proper water levels in your paddies, 4) Use organic fertilizers when possible, 5) Keep drainage channels clear for good water flow.`;
        } else if (status === 'warning' || status === 'alert') {
          return `Here's your action plan to improve water quality: IMMEDIATE (1-3 days): Stop chemical treatments, flush fields with fresh water, test pH levels. SHORT-TERM (1-2 weeks): Reduce fertilizer use by 50%, ensure proper drainage, remove any organic debris. LONG-TERM: Switch to organic fertilizers gradually, maintain buffer zones around fields, monitor weekly with NADA. Contact your agricultural extension officer if conditions don't improve in 2 weeks.`;
        }
      }
      return `To improve your rice field water quality: 1) Record audio with NADA to establish baseline, 2) Test water pH (should be 6.0-7.0), 3) Ensure good water circulation, 4) Use organic fertilizers, 5) Maintain proper water levels, 6) Keep drainage channels clear. Regular monitoring with NADA will help track your progress!`;
    }

    // Default comprehensive response
    let fallbackMessage = `I'm here to help you understand your rice field conditions through frog call analysis${errorContext}. 

Here are some questions I can help with:
• "How is my water quality?" - I'll analyze your recent recordings
• "What do the frogs in my field tell me?" - Species identification and insights  
• "How can I improve my water conditions?" - Step-by-step improvement plans
• "When should I record for best results?" - Timing and technique tips
• "What do low frog calls mean?" - Interpreting concerning results

Please record audio from your rice fields at dawn (5-7 AM) or dusk (6-8 PM) when frogs are most active, and I'll provide specific advice based on what I detect.`;

    if (errorContext) {
      fallbackMessage += `\n\n*Note: I'm currently using my built-in knowledge due to high AI system demand${errorContext}. My responses are still helpful and based on the latest data from your recordings.*`;
    }

    return fallbackMessage;
  }

  /**
   * Generate follow-up question suggestions
   */
  generateFollowUpQuestions(context: ChatContext): string[] {
    const questions = [
      "How can I improve my water quality?",
      "When is the best time to record frog calls?",
      "What do different frog species tell me about my field?",
      "Should I be worried about my current readings?"
    ];

    if (context.recent_analyses && context.recent_analyses.length > 0) {
      const latest = context.recent_analyses[0];
      
      if (latest.water_quality_assessment?.status === 'alert') {
        questions.unshift("What immediate steps should I take?");
        questions.push("How do I test my water pH?");
      } else if (latest.water_quality_assessment?.status === 'good') {
        questions.push("How do I maintain these good conditions?");
        questions.push("Can I optimize my farming practices further?");
      }

      if (latest.frog_analysis?.species_detected?.length > 2) {
        questions.push("Why do I have so many different frog species?");
      } else if (latest.frog_analysis?.species_detected?.length === 0) {
        questions.push("Why aren't there any frogs in my recording?");
      }
    }

    return questions.slice(0, 4); // Return top 4 suggestions
  }

  /**
   * Check if API is available
   */
  isApiAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Test the API connection with retry logic
   */
  async testConnection(): Promise<{ success: boolean; error?: string; attempts?: number }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'API key not configured' };
      }

      const requestBody = {
        contents: [{
          parts: [{
            text: "Hello, this is a test message from NADA system."
          }]
        }],
        generationConfig: {
          maxOutputTokens: 50,
          temperature: 0.1
        }
      };

      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
        try {
          const response = await this.makeGeminiRequest(requestBody, attempt);
          
          if (response.ok) {
            console.log(`✅ Gemini API test successful after ${attempt + 1} attempt(s)`);
            return { success: true, attempts: attempt + 1 };
          }
        } catch (error) {
          lastError = error;
          console.log(`❌ Gemini API test attempt ${attempt + 1} failed: ${error.message}`);
        }
      }

      return { 
        success: false, 
        error: lastError?.message || 'API test failed after all retries',
        attempts: this.retryConfig.maxRetries + 1
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        attempts: 1
      };
    }
  }

  /**
   * Get current API status info
   */
  getApiStatus(): { configured: boolean; model: string; retryConfig: RetryConfig } {
    return {
      configured: this.isApiAvailable(),
      model: this.model,
      retryConfig: this.retryConfig
    };
  }
}