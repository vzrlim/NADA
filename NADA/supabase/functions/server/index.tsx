import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { AudioProcessor } from "./audio-processor.tsx";
import { GeminiChatAssistant } from "./gemini-integration.tsx";
import { AudioPreprocessor } from "./audio-preprocessing.tsx";
import { BiodesnoisingProcessor } from "./biodenoising.tsx";
import { NotificationSystem } from "./notification-system.tsx";

const app = new Hono();
const audioProcessor = new AudioProcessor();
const geminiAssistant = new GeminiChatAssistant();
const audioPreprocessor = new AudioPreprocessor();
const biodesnoisingProcessor = new BiodesnoisingProcessor();
const notificationSystem = new NotificationSystem();

// Enable CORS and logging
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

/**
 * GEMINI API TEST ENDPOINT - Enhanced with retry info
 */
app.post("/make-server-f664fd48/gemini/test", async (c) => {
  try {
    console.log("🧪 Testing Gemini API connection with enhanced error handling...");
    
    const testResult = await geminiAssistant.testConnection();
    
    if (testResult.success) {
      console.log(`✅ Gemini API test successful after ${testResult.attempts} attempt(s)`);
      return c.json({
        success: true,
        message: `Gemini API is working correctly (tested with ${testResult.attempts} attempts)`,
        api_available: geminiAssistant.isApiAvailable(),
        api_status: geminiAssistant.getApiStatus()
      });
    } else {
      console.error(`❌ Gemini API test failed after ${testResult.attempts} attempts:`, testResult.error);
      return c.json({
        success: false,
        message: `Gemini API test failed after ${testResult.attempts} attempts`,
        error: testResult.error,
        api_available: geminiAssistant.isApiAvailable(),
        api_status: geminiAssistant.getApiStatus(),
        fallback_available: true
      }, 200); // Return 200 since fallback is available
    }
  } catch (error) {
    console.error("❌ Gemini API test error:", error);
    return c.json({
      success: false,
      message: "Gemini API test failed with exception",
      error: error.message,
      api_available: false,
      fallback_available: true
    }, 200); // Return 200 since fallback is available
  }
});

/**
 * NATURAL LANGUAGE QUERY ENDPOINT - Enhanced with better error handling
 */
app.post("/make-server-f664fd48/query", async (c) => {
  const startTime = Date.now();
  
  try {
    const { query } = await c.req.json();

    if (!query) {
      return c.json({ error: "Query is required" }, 400);
    }

    console.log(`🤖 Processing natural language query: "${query.substring(0, 100)}..."`);

    // Get recent analyses and alerts for context
    let recentAnalyses = await kv.get("recent_analyses") || [];
    const alerts = await kv.get("active_alerts") || [];
    
    // Safety check: filter out any unrealistic call density values from stored data
    recentAnalyses = recentAnalyses.filter((analysis: any) => {
      const callDensity = analysis.frog_analysis?.call_density || 0;
      return callDensity >= 0 && callDensity <= 80;
    });

    // Process query with Google Gemini API (with retry logic built-in)
    const context = {
      recent_analyses: recentAnalyses,
      active_alerts: alerts
    };
    
    console.log(`📊 Query context: ${recentAnalyses.length} recent analyses, ${alerts.length} alerts`);
    
    const result = await geminiAssistant.processFarmerQuery(query, context);
    const processingTime = Date.now() - startTime;

    // Enhanced logging for hackathon demonstration
    const apiMode = geminiAssistant.isApiAvailable() ? 
      (result.response.includes('*Note: I\'m currently using my built-in knowledge') ? 'fallback_due_to_error' : 'gemini') : 
      'fallback_no_key';
      
    console.log(`✅ Natural language query processed successfully in ${processingTime}ms using ${apiMode} mode`);
    
    return c.json({
      success: true,
      response: result.response,
      follow_up_questions: result.follow_up_questions,
      metadata: {
        processing_time_ms: processingTime,
        api_mode: apiMode,
        api_available: geminiAssistant.isApiAvailable(),
        context_analyses: recentAnalyses.length,
        context_alerts: alerts.filter((a: any) => !a.read).length,
        query_length: query.length,
        response_length: result.response.length
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Natural language query processing error (${processingTime}ms):`, error);
    
    // Provide helpful fallback even when there's an unexpected error
    return c.json({ 
      success: false,
      error: "I encountered an issue processing your question, but I'm still here to help!", 
      fallback_response: "I can help you understand your rice field conditions through frog call analysis. Try asking: 'How is my water quality?', 'What should I do about low frog activity?', or 'When is the best time to record?' Please upload audio from your fields so I can provide specific advice.",
      follow_up_questions: [
        "How is my water quality?",
        "When should I record frog calls?",
        "What do different frog calls mean?",
        "How can I improve my water conditions?"
      ],
      metadata: {
        processing_time_ms: processingTime,
        api_mode: 'error_fallback',
        error_details: error.message
      }
    }, 200); // Return 200 so frontend can still show the fallback response
  }
});

/**
 * AUDIO PROCESSING ENDPOINTS
 */

// Enhanced audio analysis endpoint with preprocessing and denoising
app.post("/make-server-f664fd48/audio/analyze", async (c) => {
  const startTime = Date.now();
  
  try {
    console.log("🔊 Received audio analysis request with full preprocessing pipeline");
    
    const body = await c.req.formData();
    const audioFile = body.get('audio') as File;
    const latitude = body.get('latitude') ? parseFloat(body.get('latitude') as string) : undefined;
    const longitude = body.get('longitude') ? parseFloat(body.get('longitude') as string) : undefined;
    const applyDenoising = body.get('denoise') !== 'false'; // Default to true

    if (!audioFile) {
      return c.json({ error: "No audio file provided" }, 400);
    }

    console.log(`📁 Processing audio file: ${audioFile.name}, size: ${(audioFile.size / 1024 / 1024).toFixed(2)}MB`);

    // Convert file to ArrayBuffer
    let audioBuffer = await audioFile.arrayBuffer();
    
    // Step 1: Audio preprocessing (format validation, normalization, chunking)
    console.log("📈 Step 1/4: Audio preprocessing and validation");
    const preprocessingResult = await audioPreprocessor.preprocessAudio(audioBuffer, audioFile.name);
    audioBuffer = preprocessingResult.processedAudio;

    // Validate audio quality
    const validation = audioPreprocessor.validateForFrogAnalysis(preprocessingResult.metadata);
    if (!validation.suitable) {
      const processingTime = Date.now() - startTime;
      console.log(`⚠️ Audio quality insufficient for analysis (${processingTime}ms)`);
      return c.json({
        success: false,
        error: "Audio quality insufficient for reliable frog call analysis",
        warnings: validation.warnings,
        recommendations: validation.recommendations,
        metadata: preprocessingResult.metadata,
        processing_time_ms: processingTime
      }, 400);
    }

    // Step 2: Biodenoising (if enabled and recommended)
    let denoisingResult = null;
    if (applyDenoising) {
      console.log("🔇 Step 2/4: Bioacoustic denoising");
      denoisingResult = await biodesnoisingProcessor.denoiseAudio(audioBuffer, audioFile.name);
      audioBuffer = denoisingResult.denoised_audio;
      console.log(`✨ Noise reduced by ${denoisingResult.noise_reduction_db.toFixed(1)}dB`);
    } else {
      console.log("⏭️ Step 2/4: Skipping denoising as requested");
    }

    // Step 3: AI analysis with both NatureLM and AVES
    console.log("🧠 Step 3/4: AI analysis with NatureLM + AVES");
    const location = latitude && longitude ? { latitude, longitude } : undefined;
    const analysis = await audioProcessor.processAudio(audioBuffer, audioFile.name, location);

    // Step 4: Enhanced analysis with preprocessing metadata
    console.log("📊 Step 4/4: Finalizing enhanced analysis results");
    const enhancedAnalysis = {
      ...analysis,
      preprocessing: {
        applied_operations: preprocessingResult.preprocessing_applied,
        audio_quality: preprocessingResult.metadata.quality,
        quality_score: preprocessingResult.quality_score,
        original_format: preprocessingResult.metadata.format,
        chunk_count: preprocessingResult.chunks.length
      },
      denoising: denoisingResult ? {
        applied: true,
        noise_reduction_db: denoisingResult.noise_reduction_db,
        noise_profile: denoisingResult.noise_profile,
        quality_improvement: denoisingResult.quality_improvement
      } : { applied: false }
    };

    // Store this analysis as historical data (not real-time)
    const recentAnalyses = await kv.get("recent_analyses") || [];
    const newAnalysis = {
      ...enhancedAnalysis,
      timestamp: new Date().toISOString(),
      filename: audioFile.name,
      field_id: body.get('field_id'),
      field_name: body.get('field_name'),
      processing_time_ms: Date.now() - startTime
    };
    
    // Add to historical analyses
    recentAnalyses.unshift(newAnalysis);
    
    // Keep only last 20 analyses for dashboard
    if (recentAnalyses.length > 20) {
      recentAnalyses.splice(20);
    }
    
    await kv.set("recent_analyses", recentAnalyses);
    console.log(`📚 Stored analysis as historical data: ${newAnalysis.analysis_id}`);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Enhanced audio analysis completed successfully in ${processingTime}ms`);
    
    return c.json({
      success: true,
      analysis: enhancedAnalysis,
      processing_time_ms: processingTime,
      message: `Complete audio analysis with preprocessing, ${applyDenoising ? 'denoising, ' : ''}NatureLM and AVES processing completed in ${(processingTime/1000).toFixed(1)}s`
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Enhanced audio analysis error (${processingTime}ms):`, error);
    return c.json({ 
      success: false,
      error: "Audio analysis failed", 
      details: error.message,
      processing_time_ms: processingTime
    }, 500);
  }
});

/**
 * NOTIFICATION ENDPOINTS
 */

// Get notification preferences
app.get("/make-server-f664fd48/notifications/preferences", async (c) => {
  try {
    const userId = c.req.query('user_id') || 'default';
    const preferences = await kv.get(`notification_preferences:${userId}`) || 
                       NotificationSystem.createDefaultPreferences();
    
    return c.json({
      success: true,
      preferences
    });

  } catch (error) {
    console.error("Failed to get notification preferences:", error);
    return c.json({ 
      error: "Failed to retrieve notification preferences", 
      details: error.message 
    }, 500);
  }
});

// Update notification preferences
app.post("/make-server-f664fd48/notifications/preferences", async (c) => {
  try {
    const { preferences, user_id } = await c.req.json();
    const userId = user_id || 'default';
    
    await kv.set(`notification_preferences:${userId}`, preferences);
    
    return c.json({
      success: true,
      message: "Notification preferences updated"
    });

  } catch (error) {
    console.error("Failed to update notification preferences:", error);
    return c.json({ 
      error: "Failed to update notification preferences", 
      details: error.message 
    }, 500);
  }
});

// Test notification (for debugging)
app.post("/make-server-f664fd48/notifications/test", async (c) => {
  try {
    const { user_id, channel_type } = await c.req.json();
    
    const testPayload = {
      id: `test_${Date.now()}`,
      type: 'system' as const,
      severity: 'low' as const,
      title: 'NADA Test Notification',
      message: 'This is a test notification from your NADA system. Everything is working correctly!',
      timestamp: new Date().toISOString()
    };

    const preferences = await kv.get(`notification_preferences:${user_id || 'default'}`) ||
                       NotificationSystem.createDefaultPreferences();
    
    // Send test notification
    const result = await notificationSystem.sendNotification(testPayload, preferences, user_id);
    
    return c.json({
      success: true,
      result,
      message: "Test notification sent"
    });

  } catch (error) {
    console.error("Failed to send test notification:", error);
    return c.json({ 
      error: "Failed to send test notification", 
      details: error.message 
    }, 500);
  }
});

/**
 * AUDIO PREPROCESSING ENDPOINTS
 */

// Analyze audio quality without full processing
app.post("/make-server-f664fd48/audio/analyze-quality", async (c) => {
  try {
    const body = await c.req.formData();
    const audioFile = body.get('audio') as File;

    if (!audioFile) {
      return c.json({ error: "No audio file provided" }, 400);
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const preprocessingResult = await audioPreprocessor.preprocessAudio(audioBuffer, audioFile.name);
    const validation = audioPreprocessor.validateForFrogAnalysis(preprocessingResult.metadata);

    return c.json({
      success: true,
      metadata: preprocessingResult.metadata,
      quality_score: preprocessingResult.quality_score,
      validation,
      preprocessing_required: preprocessingResult.preprocessing_applied,
      message: validation.suitable ? 
        "Audio quality is suitable for frog call analysis" : 
        "Audio quality needs improvement for optimal analysis"
    });

  } catch (error) {
    console.error("Audio quality analysis error:", error);
    return c.json({ 
      error: "Audio quality analysis failed", 
      details: error.message 
    }, 500);
  }
});

// Denoise audio only
app.post("/make-server-f664fd48/audio/denoise", async (c) => {
  try {
    const body = await c.req.formData();
    const audioFile = body.get('audio') as File;

    if (!audioFile) {
      return c.json({ error: "No audio file provided" }, 400);
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const denoisingResult = await biodesnoisingProcessor.denoiseAudio(audioBuffer, audioFile.name);

    return c.json({
      success: true,
      denoising_result: {
        noise_reduction_db: denoisingResult.noise_reduction_db,
        noise_profile: denoisingResult.noise_profile,
        processing_time_ms: denoisingResult.processing_time,
        quality_improvement: denoisingResult.quality_improvement
      },
      message: `Audio denoised successfully. Noise reduced by ${denoisingResult.noise_reduction_db.toFixed(1)} dB`
    });

  } catch (error) {
    console.error("Audio denoising error:", error);
    return c.json({ 
      error: "Audio denoising failed", 
      details: error.message 
    }, 500);
  }
});

/**
 * FIELD MANAGEMENT ENDPOINTS
 */

// Get all fields
app.get("/make-server-f664fd48/fields", async (c) => {
  try {
    let fields = await kv.get("user_fields") || [];
    
    // If no user-created fields exist, provide realistic Malaysian paddy field scenarios
    if (fields.length === 0) {
      fields = [
        {
          id: "sawah_serdang_utara",
          name: "Sawah Serdang Utara",
          location: "Serdang, Selangor",
          size: "3.2 hectares",
          status: "good",
          lastAnalysis: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          analysisCount: 12,
          notes: "Established paddy field with excellent water circulation from Langat River irrigation system",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()
        },
        {
          id: "sawah_kampung_jawa", 
          name: "Sawah Kampung Jawa",
          location: "Klang, Selangor",
          size: "2.8 hectares",
          status: "warning",
          lastAnalysis: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          analysisCount: 6,
          notes: "Close to industrial area, experiencing pollution runoff affecting frog populations",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString()
        },
        {
          id: "sawah_sekinchan_baru",
          name: "Sawah Sekinchan Baru", 
          location: "Sekinchan, Selangor",
          size: "4.1 hectares",
          status: "alert",
          lastAnalysis: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
          analysisCount: 3,
          notes: "Recently converted from palm oil plantation, ecosystem still developing with poor biodiversity",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString()
        }
      ];
      
      // Store these default fields for consistency
      await kv.set("user_fields", fields);
      console.log("Initialized with realistic Malaysian paddy field scenarios");
    }
    
    return c.json({
      success: true,
      fields
    });

  } catch (error) {
    console.error("Failed to get fields:", error);
    return c.json({ 
      error: "Failed to retrieve fields", 
      details: error.message 
    }, 500);
  }
});

// Save field
app.post("/make-server-f664fd48/fields", async (c) => {
  try {
    const { field } = await c.req.json();
    
    if (!field || !field.id || !field.name) {
      return c.json({ error: "Invalid field data" }, 400);
    }

    // Get existing fields
    const existingFields = await kv.get("user_fields") || [];
    
    // Add new field
    const updatedFields = [...existingFields, field];
    
    // Save back to storage
    await kv.set("user_fields", updatedFields);
    
    console.log(`✅ Field saved: ${field.name}`);
    
    return c.json({
      success: true,
      message: "Field saved successfully",
      field
    });

  } catch (error) {
    console.error("Failed to save field:", error);
    return c.json({ 
      error: "Failed to save field", 
      details: error.message 
    }, 500);
  }
});

// Delete field
app.delete("/make-server-f664fd48/fields/:fieldId", async (c) => {
  try {
    const fieldId = c.req.param('fieldId');
    
    // Get existing fields
    const existingFields = await kv.get("user_fields") || [];
    
    // Remove field
    const updatedFields = existingFields.filter((f: any) => f.id !== fieldId);
    
    // Save back to storage
    await kv.set("user_fields", updatedFields);
    
    console.log(`✅ Field deleted: ${fieldId}`);
    
    return c.json({
      success: true,
      message: "Field deleted successfully"
    });

  } catch (error) {
    console.error("Failed to delete field:", error);
    return c.json({ 
      error: "Failed to delete field", 
      details: error.message 
    }, 500);
  }
});

/**
 * STATISTICS AND DASHBOARD DATA ENDPOINTS
 */

// Get recent analyses for dashboard - Static historical data only
app.get("/make-server-f664fd48/dashboard/recent", async (c) => {
  try {
    // Get stored historical analyses
    let recentAnalyses = await kv.get("recent_analyses") || [];
    const activeAlerts = await kv.get("active_alerts") || [];
    
    // Safety check: filter out any unrealistic call density values from stored data
    recentAnalyses = recentAnalyses.filter((analysis: any) => {
      const callDensity = analysis.frog_analysis?.call_density || 0;
      return callDensity >= 0 && callDensity <= 80;
    });
    
    // If no valid analyses exist, create static historical data for Malaysian fields
    if (recentAnalyses.length === 0) {
      recentAnalyses = await createStaticHistoricalAnalyses();
      await kv.set("recent_analyses", recentAnalyses);
    }
    
    // Always return the same historical data - no real-time changes
    return c.json({
      success: true,
      recent_analyses: recentAnalyses.slice(0, 10),
      active_alerts: activeAlerts.filter((alert: any) => !alert.read),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Failed to get dashboard data:", error);
    return c.json({ 
      error: "Failed to retrieve dashboard data", 
      details: error.message 
    }, 500);
  }
});

/**
 * Create static historical analyses for dashboard display
 * These represent past frog call analyses, not real-time data
 */
async function createStaticHistoricalAnalyses() {
  const staticAnalyses = [
    {
      analysis_id: "analysis_historical_001",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      filename: "serdang_utara_morning_recording.wav",
      field_id: "sawah_serdang_utara",
      field_name: "Sawah Serdang Utara",
      audio_metadata: {
        filename: "serdang_utara_morning_recording.wav",
        duration: 120,
        file_size: 2458624
      },
      frog_analysis: {
        species_detected: ["Microhyla butleri", "Hylarana erythraea", "Fejervarya limnocharis"],
        call_density: 62,
        confidence_score: 0.89,
        water_quality_indicator: "good"
      },
      environmental_analysis: {
        biodiversity_score: 0.78,
        habitat_quality: "good",
        noise_pollution_level: 0.15,
        ecosystem_health: "healthy",
        recommendations: ["Maintain current farming practices", "Continue regular monitoring"]
      },
      water_quality_assessment: {
        overall_score: 0.82,
        status: "good",
        factors: ["High frog activity (62 calls/min) indicates healthy water", "High biodiversity indicates healthy ecosystem", "Healthy ecosystem conditions detected"],
        farmer_recommendations: ["Continue current sustainable practices", "3 frog species detected - maintain current habitat conditions"]
      }
    },
    {
      analysis_id: "analysis_historical_002", 
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      filename: "kampung_jawa_evening_recording.wav",
      field_id: "sawah_kampung_jawa",
      field_name: "Sawah Kampung Jawa",
      audio_metadata: {
        filename: "kampung_jawa_evening_recording.wav",
        duration: 180,
        file_size: 3687424
      },
      frog_analysis: {
        species_detected: ["Fejervarya limnocharis", "Duttaphrynus melanostictus"],
        call_density: 38,
        confidence_score: 0.76,
        water_quality_indicator: "warning"
      },
      environmental_analysis: {
        biodiversity_score: 0.52,
        habitat_quality: "fair",
        noise_pollution_level: 0.45,
        ecosystem_health: "stressed",
        recommendations: ["Reduce chemical inputs", "Implement noise reduction measures during evening hours"]
      },
      water_quality_assessment: {
        overall_score: 0.55,
        status: "warning",
        factors: ["Moderate frog activity (38 calls/min) suggests adequate water quality", "Moderate biodiversity - ecosystem under some stress", "Ecosystem shows signs of stress"],
        farmer_recommendations: ["Monitor water conditions and consider reducing chemical inputs", "Implement sustainable farming practices to support biodiversity", "2 frog species detected - maintain current habitat conditions"]
      }
    },
    {
      analysis_id: "analysis_historical_003",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago  
      filename: "sekinchan_baru_dawn_recording.wav",
      field_id: "sawah_sekinchan_baru",
      field_name: "Sawah Sekinchan Baru",
      audio_metadata: {
        filename: "sekinchan_baru_dawn_recording.wav", 
        duration: 150,
        file_size: 3072000
      },
      frog_analysis: {
        species_detected: ["Microhyla butleri"],
        call_density: 23,
        confidence_score: 0.65,
        water_quality_indicator: "alert"
      },
      environmental_analysis: {
        biodiversity_score: 0.28,
        habitat_quality: "poor",
        noise_pollution_level: 0.35,
        ecosystem_health: "degraded", 
        recommendations: ["Urgent need for ecosystem restoration measures", "Consider creating wildlife corridors around field"]
      },
      water_quality_assessment: {
        overall_score: 0.31,
        status: "alert",
        factors: ["Low frog activity (23 calls/min) may indicate water quality issues", "Low biodiversity suggests ecosystem degradation", "Ecosystem appears degraded"],
        farmer_recommendations: ["Check water pH, dissolved oxygen, and chemical contamination", "Consider immediate water quality testing", "Urgent need for ecosystem restoration measures", "1 frog species detected - maintain current habitat conditions"]
      }
    },
    {
      analysis_id: "analysis_historical_004",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
      filename: "serdang_utara_sunset_recording.wav", 
      field_id: "sawah_serdang_utara",
      field_name: "Sawah Serdang Utara",
      audio_metadata: {
        filename: "serdang_utara_sunset_recording.wav",
        duration: 90,
        file_size: 1843200
      },
      frog_analysis: {
        species_detected: ["Polypedates leucomystax", "Hylarana erythraea"],
        call_density: 71,
        confidence_score: 0.92,
        water_quality_indicator: "good"
      },
      environmental_analysis: {
        biodiversity_score: 0.83,
        habitat_quality: "excellent",
        noise_pollution_level: 0.12,
        ecosystem_health: "healthy",
        recommendations: ["Excellent biodiversity! Continue current sustainable practices"]
      },
      water_quality_assessment: {
        overall_score: 0.88,
        status: "good", 
        factors: ["High frog activity (71 calls/min) indicates healthy water", "High biodiversity indicates healthy ecosystem", "Healthy ecosystem conditions detected"],
        farmer_recommendations: ["Continue current sustainable practices", "2 frog species detected - maintain current habitat conditions"]
      }
    },
    {
      analysis_id: "analysis_historical_005",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 72 hours ago
      filename: "kampung_jawa_morning_recording.wav",
      field_id: "sawah_kampung_jawa", 
      field_name: "Sawah Kampung Jawa",
      audio_metadata: {
        filename: "kampung_jawa_morning_recording.wav",
        duration: 165,
        file_size: 3379200
      },
      frog_analysis: {
        species_detected: ["Fejervarya limnocharis"],
        call_density: 34,
        confidence_score: 0.71,
        water_quality_indicator: "warning"
      },
      environmental_analysis: {
        biodiversity_score: 0.44,
        habitat_quality: "fair",
        noise_pollution_level: 0.52,
        ecosystem_health: "stressed",
        recommendations: ["Implement sustainable farming practices to support biodiversity", "High noise levels detected - consider noise reduction measures"]
      },
      water_quality_assessment: {
        overall_score: 0.49,
        status: "warning",
        factors: ["Moderate frog activity (34 calls/min) suggests adequate water quality", "Moderate biodiversity - ecosystem under some stress", "Ecosystem shows signs of stress"],
        farmer_recommendations: ["Monitor water conditions and consider reducing chemical inputs", "Implement sustainable farming practices to support biodiversity", "1 frog species detected - maintain current habitat conditions"]
      }
    }
  ];

  console.log(`📊 Created ${staticAnalyses.length} static historical analyses for dashboard`);
  return staticAnalyses;
}

// Get analytics data - Static historical trends only
app.get("/make-server-f664fd48/analytics", async (c) => {
  try {
    const timeRange = c.req.query('range') || '7d';
    
    // Get static historical analyses
    let analyses = await kv.get("recent_analyses") || [];
    
    // If no historical data exists, create static baseline
    if (analyses.length === 0) {
      analyses = await createStaticHistoricalAnalyses();
    }
    
    // Filter by time range for historical trends
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '1d':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }
    
    const filteredAnalyses = analyses.filter((analysis: any) => 
      new Date(analysis.timestamp) >= cutoffDate
    );
    
    // Static analytics based on historical data
    return c.json({
      success: true,
      analytics: {
        total_analyses: filteredAnalyses.length,
        average_call_density: filteredAnalyses.length > 0 ? 
          filteredAnalyses.reduce((sum: number, a: any) => sum + (a.frog_analysis?.call_density || 0), 0) / filteredAnalyses.length : 0,
        species_diversity: [...new Set(filteredAnalyses.flatMap((a: any) => a.frog_analysis?.species_detected || []))].length,
        water_quality_distribution: {
          good: filteredAnalyses.filter((a: any) => a.water_quality_assessment?.status === 'good').length,
          warning: filteredAnalyses.filter((a: any) => a.water_quality_assessment?.status === 'warning').length,
          alert: filteredAnalyses.filter((a: any) => a.water_quality_assessment?.status === 'alert').length
        }
      },
      time_range: timeRange,
      data_type: "historical"
    });

  } catch (error) {
    console.error("Failed to get analytics data:", error);
    return c.json({ 
      error: "Failed to retrieve analytics data", 
      details: error.message 
    }, 500);
  }
});

// Health check endpoint - Enhanced with API status
app.get("/make-server-f664fd48/health", (c) => {
  const apiStatus = geminiAssistant.getApiStatus();
  
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.2.0",
    features: {
      audio_processing: true,
      gemini_integration: apiStatus.configured,
      gemini_model: apiStatus.model,
      gemini_retry_enabled: true,
      biodenoising: true,
      notifications: true,
      fallback_responses: true
    },
    api_status: apiStatus
  });
});

// Root endpoint
app.get("/make-server-f664fd48/", (c) => {
  return c.json({
    message: "NADA (Natural Acoustic Diagnostics & Alerts) API Server",
    version: "1.2.0",
    description: "AI-powered bioacoustic monitoring for Malaysian rice farmers",
    hackathon_project: "Decoding Animal Communication with AI",
    endpoints: [
      "POST /audio/analyze - Enhanced audio analysis with NatureLM + AVES + preprocessing",
      "POST /query - Gemini-powered natural language processing with retry logic", 
      "GET /dashboard/recent - Historical analyses and alerts for dashboard display",
      "GET /analytics - Historical analytics and trends data with time filtering", 
      "POST /notifications/test  - Test multi-channel notification system",
      "POST /gemini/test - Test Gemini API connection with retry handling",
      "GET /health - Comprehensive health check with API status"
    ],
    improvements: [
      "✅ Gemini API retry logic with exponential backoff",
      "✅ Intelligent fallback responses when API is overloaded",
      "✅ Enhanced error handling and logging",
      "✅ Processing time metrics for performance monitoring",
      "✅ Graceful degradation during high API demand"
    ]
  });
});

// Start the server
Deno.serve(app.fetch);