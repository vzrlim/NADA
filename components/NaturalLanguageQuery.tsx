import { useState } from "react";
import { Send, MessageCircle, Bot, User, Lightbulb } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export default function NaturalLanguageQuery() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your farm helper. I can help you understand your rice field and water quality. Just ask me anything in simple words - like talking to a friend! 😊",
      timestamp: new Date().toLocaleTimeString(),
      suggestions: [
        "Why is my water quality bad?",
        "What should I do about low frog sounds?",
        "How to make my rice field healthier?",
        "When should I check my water?"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const GEMINI_API_KEY = "AIzaSyARcHkaN_bAofM5cImHKtdGB9scvG_SILY";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await generateGeminiResponse(content);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString(),
        suggestions: response.suggestions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Let me try to help with what I know!\n\n🌾 **Common Rice Field Issues:**\n• Water quality problems\n• Frog population changes\n• pH imbalances\n• Chemical contamination\n\nCan you tell me more about your specific problem?",
        timestamp: new Date().toLocaleTimeString(),
        suggestions: [
          "My water looks dirty",
          "Frogs stopped singing",
          "Plants look unhealthy",
          "Need help with pH testing"
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateGeminiResponse = async (query: string): Promise<{ content: string; suggestions?: string[] }> => {
    const systemPrompt = `You are a friendly farm helper assistant specializing in rice field management and water quality. Your expertise includes:

- Rice field water quality assessment
- Frog population as environmental indicators  
- pH levels and water chemistry
- Organic farming practices
- Pest and disease management
- Harvest timing

RESPONSE STYLE:
- Use simple, friendly language (like talking to a friend)
- Include emojis to make it warm and approachable
- Structure responses with clear headings using ** for bold
- Provide actionable, practical advice
- Keep responses focused on rice farming
- Use bullet points for easy reading
- Include encouraging words

RESPONSE FORMAT:
- Always end with 4 relevant follow-up questions the user might ask
- Format follow-ups as simple, natural questions
- Keep the main response under 200 words
- Use emojis appropriately (🌾 🐸 💧 ✅ 🚨 etc.)

Remember: You're helping farmers improve their rice fields and understand their water quality through simple, practical advice.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nUser question: ${query}\n\nProvide a helpful response about rice field management with 4 follow-up questions.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1000,
      }
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Extract suggestions from the response
    const suggestions = extractSuggestions(aiResponse);

    return {
      content: aiResponse,
      suggestions
    };
  };

  const extractSuggestions = (response: string): string[] => {
    // Look for common question patterns at the end of the response
    const lines = response.split('\n');
    const suggestions: string[] = [];
    
    for (let i = lines.length - 1; i >= 0 && suggestions.length < 4; i--) {
      const line = lines[i].trim();
      if (line.includes('?') && line.length > 10 && line.length < 50) {
        // Clean up the line (remove bullets, numbers, etc.)
        const cleaned = line.replace(/^[•\-\*\d\.]+\s*/, '').trim();
        if (cleaned && !suggestions.includes(cleaned)) {
          suggestions.unshift(cleaned);
        }
      }
    }

    // If we didn't find enough suggestions, add some defaults
    if (suggestions.length < 4) {
      const defaultSuggestions = [
        "How to improve water quality?",
        "What do frog sounds mean?",
        "Best time to check fields?",
        "How to test water pH?"
      ];
      
      for (const suggestion of defaultSuggestions) {
        if (!suggestions.includes(suggestion) && suggestions.length < 4) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions.slice(0, 4);
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-sage-800">Ask Your Farm Helper</h2>
        <p className="text-sage-600 mt-1">Ask anything about your rice fields in simple words</p>
      </div>

      <div className="fairy-card border-sage-200/50 p-4 sm:p-6 fairy-glow">
        <div className="space-y-4">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gradient-to-br from-sage-50/50 to-lavender-50/50 rounded-lg border border-sage-200/30">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-dusty-pink-400 to-dusty-pink-600' 
                      : 'bg-gradient-to-br from-sage-400 to-sage-600'
                  }`}>
                    {message.type === 'user' ? 
                      <User className="w-5 h-5 text-cream-50" /> : 
                      <Bot className="w-5 h-5 text-cream-50" />
                    }
                  </div>
                  
                  <div className={`rounded-lg p-4 shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-dusty-pink-500 to-dusty-pink-600 text-cream-50' 
                      : 'bg-gradient-to-br from-cream-50 to-cream-100 border border-sage-200/50'
                  }`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-dusty-pink-100' : 'text-sage-600'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-cream-50" />
                </div>
                <div className="bg-gradient-to-br from-cream-50 to-cream-100 border border-sage-200/50 rounded-lg p-4 shadow-sm">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse delay-200"></div>
                    <span className="text-sm text-sage-600 ml-2">Helper is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <div className="space-y-2">
              <p className="text-sm text-sage-600 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs h-8 px-3 border border-sage-300 text-sage-700 hover:bg-sage-50 rounded-lg transition-colors shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question here... (e.g., 'Why is my water bad?')"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputValue);
                }
              }}
              className="flex-1 text-base px-3 py-2 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent bg-cream-50/50"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-br from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 disabled:from-sage-300 disabled:to-sage-400 px-4 py-2 rounded-lg text-cream-50 font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Helper Status */}
      <div className="p-4 bg-gradient-to-br from-sage-50 to-lavender-50 border border-sage-200/50 rounded-lg fairy-glow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sage-500 to-sage-600 rounded-full flex items-center justify-center shadow-sm">
            <MessageCircle className="w-5 h-5 text-cream-50" />
          </div>
          <div>
            <p className="font-medium text-sage-800">I'm here to help!</p>
            <p className="text-sm text-sage-600">
              Ask me anything about your rice fields - I understand simple words!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}