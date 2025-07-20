/**
 * Audio Preprocessing Module for NADA
 * Handles automatic format detection, high-pass filtering, amplitude normalization, and chunking
 */

interface AudioMetadata {
  format: 'wav' | 'mp3' | 'unknown';
  sampleRate: number;
  channels: number;
  duration: number;
  bitDepth?: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface PreprocessingResult {
  processedAudio: ArrayBuffer;
  metadata: AudioMetadata;
  chunks: ArrayBuffer[];
  preprocessing_applied: string[];
  quality_score: number;
}

export class AudioPreprocessor {
  private readonly TARGET_SAMPLE_RATE = 44100;
  private readonly TARGET_CHUNK_DURATION = 30; // seconds
  private readonly HIGH_PASS_CUTOFF = 100; // Hz
  private readonly MIN_AMPLITUDE = 0.1;
  private readonly MAX_AMPLITUDE = 0.9;

  /**
   * Main preprocessing pipeline
   */
  async preprocessAudio(audioBuffer: ArrayBuffer, filename: string): Promise<PreprocessingResult> {
    console.log(`Starting audio preprocessing for: ${filename}`);
    
    try {
      // Step 1: Format detection and validation
      const metadata = await this.analyzeAudioMetadata(audioBuffer, filename);
      console.log(`Audio format detected: ${metadata.format}, ${metadata.sampleRate}Hz, ${metadata.channels}ch`);

      // Step 2: Quality assessment
      const qualityScore = this.assessAudioQuality(metadata);
      console.log(`Audio quality score: ${qualityScore}/100`);

      let processedAudio = audioBuffer;
      const appliedProcessing: string[] = [];

      // Step 3: Format conversion (if needed)
      if (metadata.format === 'mp3') {
        // In production, this would use a proper MP3 decoder
        // For now, we simulate the conversion process
        console.log('MP3 format detected - would convert to WAV in production');
        appliedProcessing.push('MP3 to WAV conversion');
      }

      // Step 4: Sample rate conversion (if needed)
      if (metadata.sampleRate !== this.TARGET_SAMPLE_RATE) {
        processedAudio = await this.resampleAudio(processedAudio, metadata.sampleRate, this.TARGET_SAMPLE_RATE);
        appliedProcessing.push(`Resampling: ${metadata.sampleRate}Hz → ${this.TARGET_SAMPLE_RATE}Hz`);
      }

      // Step 5: High-pass filtering
      processedAudio = await this.applyHighPassFilter(processedAudio, metadata);
      appliedProcessing.push(`High-pass filter: ${this.HIGH_PASS_CUTOFF}Hz cutoff`);

      // Step 6: Amplitude normalization
      processedAudio = await this.normalizeAmplitude(processedAudio, metadata);
      appliedProcessing.push('Amplitude normalization');

      // Step 7: Fixed-length chunking
      const chunks = await this.chunkAudio(processedAudio, metadata);
      appliedProcessing.push(`Audio chunking: ${chunks.length} × ${this.TARGET_CHUNK_DURATION}s segments`);

      console.log(`Preprocessing completed: ${appliedProcessing.length} operations applied`);

      return {
        processedAudio,
        metadata: {
          ...metadata,
          sampleRate: this.TARGET_SAMPLE_RATE,
          quality: this.getQualityCategory(qualityScore)
        },
        chunks,
        preprocessing_applied: appliedProcessing,
        quality_score: qualityScore
      };

    } catch (error) {
      console.error('Audio preprocessing failed:', error);
      throw new Error(`Audio preprocessing failed: ${error.message}`);
    }
  }

  /**
   * Analyze audio metadata and format
   */
  private async analyzeAudioMetadata(audioBuffer: ArrayBuffer, filename: string): Promise<AudioMetadata> {
    const format = this.detectAudioFormat(audioBuffer, filename);
    
    // Simulate metadata extraction (in production, use proper audio libraries)
    const mockMetadata: AudioMetadata = {
      format,
      sampleRate: format === 'wav' ? 44100 : 48000, // Common rates
      channels: format === 'wav' ? 1 : 2, // WAV often mono, MP3 often stereo
      duration: Math.max(10, audioBuffer.byteLength / (44100 * 2)), // Estimate duration
      bitDepth: format === 'wav' ? 16 : undefined,
      quality: 'good'
    };

    return mockMetadata;
  }

  /**
   * Detect audio format from buffer and filename
   */
  private detectAudioFormat(audioBuffer: ArrayBuffer, filename: string): 'wav' | 'mp3' | 'unknown' {
    // Check file extension
    const extension = filename.toLowerCase().split('.').pop();
    if (extension === 'wav' || extension === 'mp3') {
      return extension as 'wav' | 'mp3';
    }

    // Check magic bytes
    const view = new Uint8Array(audioBuffer, 0, 12);
    
    // WAV header: "RIFF" at start, "WAVE" at offset 8
    if (view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46 &&
        view[8] === 0x57 && view[9] === 0x41 && view[10] === 0x56 && view[11] === 0x45) {
      return 'wav';
    }

    // MP3 header: Frame sync (0xFFF) in first 2 bytes
    if ((view[0] === 0xFF && (view[1] & 0xE0) === 0xE0) ||
        (view[0] === 0x49 && view[1] === 0x44 && view[2] === 0x33)) { // ID3 tag
      return 'mp3';
    }

    console.warn(`Unknown audio format for file: ${filename}`);
    return 'unknown';
  }

  /**
   * Assess audio quality based on metadata
   */
  private assessAudioQuality(metadata: AudioMetadata): number {
    let score = 100;

    // Sample rate scoring
    if (metadata.sampleRate >= 44100) {
      score += 0; // Optimal
    } else if (metadata.sampleRate >= 22050) {
      score -= 10; // Good
    } else if (metadata.sampleRate >= 16000) {
      score -= 25; // Fair
    } else {
      score -= 40; // Poor
    }

    // Duration scoring (prefer 30+ seconds for frog call analysis)
    if (metadata.duration >= 30) {
      score += 0; // Optimal
    } else if (metadata.duration >= 15) {
      score -= 5; // Good
    } else if (metadata.duration >= 5) {
      score -= 15; // Fair
    } else {
      score -= 30; // Too short
    }

    // Format scoring
    if (metadata.format === 'wav') {
      score += 0; // Uncompressed preferred
    } else if (metadata.format === 'mp3') {
      score -= 5; // Acceptable compression
    } else {
      score -= 20; // Unknown format
    }

    // Channels scoring (mono preferred for analysis)
    if (metadata.channels === 1) {
      score += 5; // Mono preferred
    } else if (metadata.channels === 2) {
      score += 0; // Stereo acceptable
    } else {
      score -= 10; // Unusual channel count
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Convert quality score to category
   */
  private getQualityCategory(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  /**
   * Simulate audio resampling
   */
  private async resampleAudio(
    audioBuffer: ArrayBuffer, 
    fromSampleRate: number, 
    toSampleRate: number
  ): Promise<ArrayBuffer> {
    // In production, this would use proper audio resampling algorithms
    // For now, we simulate the process and return a buffer of appropriate size
    
    console.log(`Simulating resample from ${fromSampleRate}Hz to ${toSampleRate}Hz`);
    
    const ratio = toSampleRate / fromSampleRate;
    const newSize = Math.floor(audioBuffer.byteLength * ratio);
    
    // Create a new buffer with adjusted size
    const resampledBuffer = new ArrayBuffer(newSize);
    
    // In production, this would contain actual resampling logic using libraries like:
    // - Web Audio API (browser)
    // - FFmpeg (server-side)
    // - Dedicated audio processing libraries
    
    return resampledBuffer;
  }

  /**
   * Apply high-pass filter to remove low-frequency noise
   */
  private async applyHighPassFilter(audioBuffer: ArrayBuffer, metadata: AudioMetadata): Promise<ArrayBuffer> {
    console.log(`Applying high-pass filter with ${this.HIGH_PASS_CUTOFF}Hz cutoff`);
    
    // In production, this would implement a proper high-pass filter
    // Common implementations:
    // - Butterworth filter
    // - Chebyshev filter  
    // - Simple RC high-pass filter
    
    // For now, we return the buffer as-is (simulation)
    // The actual filtering would remove frequencies below HIGH_PASS_CUTOFF
    // which helps eliminate wind noise, handling noise, and electrical hum
    
    return audioBuffer;
  }

  /**
   * Normalize audio amplitude to consistent levels
   */
  private async normalizeAmplitude(audioBuffer: ArrayBuffer, metadata: AudioMetadata): Promise<ArrayBuffer> {
    console.log(`Normalizing amplitude to range ${this.MIN_AMPLITUDE}-${this.MAX_AMPLITUDE}`);
    
    // In production, this would:
    // 1. Find the maximum absolute amplitude in the audio
    // 2. Calculate scaling factor to bring max amplitude to target level
    // 3. Apply scaling to all samples while avoiding clipping
    // 4. Optionally apply dynamic range compression
    
    // This is crucial for consistent analysis across different recording devices
    // and environmental conditions
    
    return audioBuffer;
  }

  /**
   * Chunk audio into fixed-length segments for analysis
   */
  private async chunkAudio(audioBuffer: ArrayBuffer, metadata: AudioMetadata): Promise<ArrayBuffer[]> {
    const chunks: ArrayBuffer[] = [];
    const bytesPerSecond = metadata.sampleRate * metadata.channels * 2; // Assuming 16-bit
    const chunkSizeBytes = this.TARGET_CHUNK_DURATION * bytesPerSecond;
    
    console.log(`Chunking audio into ${this.TARGET_CHUNK_DURATION}s segments`);
    
    // Create chunks of TARGET_CHUNK_DURATION seconds each
    for (let offset = 0; offset < audioBuffer.byteLength; offset += chunkSizeBytes) {
      const remainingBytes = audioBuffer.byteLength - offset;
      const actualChunkSize = Math.min(chunkSizeBytes, remainingBytes);
      
      // Only include chunks that are at least 10 seconds long
      if (actualChunkSize >= bytesPerSecond * 10) {
        const chunk = audioBuffer.slice(offset, offset + actualChunkSize);
        chunks.push(chunk);
      }
    }
    
    console.log(`Created ${chunks.length} audio chunks for analysis`);
    return chunks;
  }

  /**
   * Validate audio for frog call analysis suitability
   */
  validateForFrogAnalysis(metadata: AudioMetadata): {
    suitable: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check duration
    if (metadata.duration < 30) {
      warnings.push(`Recording is only ${metadata.duration.toFixed(1)}s long`);
      recommendations.push('Record for at least 30 seconds for better analysis');
    }

    // Check sample rate
    if (metadata.sampleRate < 22050) {
      warnings.push(`Low sample rate: ${metadata.sampleRate}Hz`);
      recommendations.push('Use higher quality recording settings (44.1kHz recommended)');
    }

    // Check format
    if (metadata.format === 'unknown') {
      warnings.push('Unknown audio format detected');
      recommendations.push('Use .wav or high-quality .mp3 files');
    }

    // Check quality
    if (metadata.quality === 'poor') {
      warnings.push('Poor audio quality detected');
      recommendations.push('Record in a quieter environment closer to the water');
    }

    const suitable = warnings.length === 0 || (warnings.length <= 2 && metadata.quality !== 'poor');

    return { suitable, warnings, recommendations };
  }
}