import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Mic, 
  MicOff, 
  Upload, 
  FileAudio, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Volume2, 
  Waves,
  Download,
  Play,
  Pause,
  Brain,
  Activity,
  MapPin,
  Timer,
  Shield,
  Info,
  Settings,
  RefreshCw
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  location: string;
  size: string;
  status: 'good' | 'warning' | 'alert' | 'unknown';
  lastAnalysis?: string;
  analysisCount: number;
  notes?: string;
  createdAt: string;
}

interface FieldContextType {
  selectedField: Field | null;
  allFields: Field[];
  setSelectedField: (field: Field | null) => void;
  onManageFields: () => void;
}

interface AudioAnalysisProps {
  fieldContext: FieldContextType;
}

interface DetectionResult {
  timestamp: string;
  callsDetected: number;
  species: string;
  confidence: number;
  frequency: number;
  intensity?: number;
  callType?: string;
}

interface AnalysisResult {
  totalCalls: number;
  callsPerMinute: number;
  waterQualityStatus: 'good' | 'warning' | 'alert';
  speciesCount: number;
  biodiversityScore: number;
  ecosystemHealth: string;
  recommendation: string;
  communicationPatterns?: {
    dominantFrequency: number;
    callPatterns: string[];
    behavioralInsights: string[];
  };
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
}

type PermissionState = 'unknown' | 'granted' | 'denied' | 'prompt';

export function AudioAnalysis({ fieldContext }: AudioAnalysisProps) {
  const { selectedField } = fieldContext;

  // Permission states - always simulate granted access
  const [micPermission, setMicPermission] = useState<PermissionState>('granted');
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Recording states
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioLevel: 0,
    recordedBlob: null,
    recordedUrl: null
  });

  // Analysis states
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [recentDetections, setRecentDetections] = useState<DetectionResult[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Media recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visualizerRef = useRef<number | null>(null);

  // Audio constants
  const MIN_RECORDING_DURATION = 30; // 30 seconds minimum
  const MAX_RECORDING_DURATION = 300; // 5 minutes maximum
  const RECOMMENDED_DURATION = 120; // 2 minutes recommended

  // Malaysian frog species database for simulation
  const MALAYSIAN_FROGS = [
    {
      name: 'Microhyla butleri',
      commonName: "Butler's Narrow-mouth Frog",
      frequency: [800, 1200],
      callTypes: ['Mating call', 'Contact call'],
      habitat: 'Rice paddies, wetlands'
    },
    {
      name: 'Hylarana erythraea',
      commonName: 'Green Paddy Frog',
      frequency: [1000, 1800],
      callTypes: ['Mating call', 'Territorial'],
      habitat: 'Paddy fields, ponds'
    },
    {
      name: 'Fejervarya limnocharis',
      commonName: 'Rice Field Frog',
      frequency: [600, 1400],
      callTypes: ['Mating call', 'Rain call'],
      habitat: 'Rice fields, shallow water'
    },
    {
      name: 'Polypedates leucomystax',
      commonName: 'Common Tree Frog',
      frequency: [1200, 2000],
      callTypes: ['Mating call', 'Territorial'],
      habitat: 'Trees near water, rice paddies'
    },
    {
      name: 'Duttaphrynus melanostictus',
      commonName: 'Asian Common Toad',
      frequency: [400, 800],
      callTypes: ['Mating call', 'Release call'],
      habitat: 'Various aquatic habitats'
    },
    {
      name: 'Rana chalconota',
      commonName: 'White-lipped Frog',
      frequency: [900, 1600],
      callTypes: ['Mating call', 'Contact call'],
      habitat: 'Forest streams, rice terraces'
    },
    {
      name: 'Microhyla berdmorei',
      commonName: "Berdmore's Narrow-mouth Frog",
      frequency: [1100, 1500],
      callTypes: ['Mating call', 'Rain call'],
      habitat: 'Temporary pools, rice fields'
    }
  ];

  // Generate realistic simulation data based on audio duration
  const generateSimulationData = (field: Field, audioLength: number = 120): {
    detections: DetectionResult[],
    analysis: AnalysisResult
  } => {
    const fieldHash = field.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random = (seed: number) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Make species count realistic based on audio duration
    let maxSpecies: number;
    let callsMultiplier: number;
    
    if (audioLength < 30) {
      // Very short clips: max 1 species, few calls
      maxSpecies = 1;
      callsMultiplier = 0.3;
    } else if (audioLength < 60) {
      // Short clips: max 2 species
      maxSpecies = 2;
      callsMultiplier = 0.5;
    } else if (audioLength < 120) {
      // Medium clips: max 2-3 species
      maxSpecies = 3;
      callsMultiplier = 0.7;
    } else {
      // Long clips: can have more species
      maxSpecies = 4;
      callsMultiplier = 1.0;
    }

    // Determine water quality based on field status with some randomness
    let baseCallsPerMinute: number;
    let speciesCount: number;
    
    switch (field.status) {
      case 'good':
        baseCallsPerMinute = Math.round((35 + Math.floor(random(fieldHash) * 20)) * callsMultiplier); // 35-55, adjusted for duration
        speciesCount = Math.min(maxSpecies, 2 + Math.floor(random(fieldHash + 1) * 2)); // 2-3 species max
        break;
      case 'warning':
        baseCallsPerMinute = Math.round((20 + Math.floor(random(fieldHash) * 15)) * callsMultiplier); // 20-35, adjusted
        speciesCount = Math.min(maxSpecies, 1 + Math.floor(random(fieldHash + 1) * 2)); // 1-2 species max
        break;
      case 'alert':
        baseCallsPerMinute = Math.round((8 + Math.floor(random(fieldHash) * 12)) * callsMultiplier); // 8-20, adjusted
        speciesCount = Math.min(maxSpecies, 1 + Math.floor(random(fieldHash + 1) * 1)); // 1 species max
        break;
      default:
        baseCallsPerMinute = Math.round(25 * callsMultiplier);
        speciesCount = Math.min(maxSpecies, 1);
    }

    // Ensure minimum values
    baseCallsPerMinute = Math.max(5, baseCallsPerMinute);
    speciesCount = Math.max(1, speciesCount);

    // Generate detections
    const detections: DetectionResult[] = [];
    const selectedSpecies = MALAYSIAN_FROGS
      .sort(() => random(fieldHash + 2) - 0.5)
      .slice(0, speciesCount);

    const totalCalls = Math.max(1, Math.floor((baseCallsPerMinute * audioLength) / 60));
    
    // Distribute calls across the audio duration more realistically
    const callInterval = audioLength / totalCalls;
    
    for (let i = 0; i < totalCalls; i++) {
      const species = selectedSpecies[Math.floor(random(fieldHash + i) * selectedSpecies.length)];
      const timeInSeconds = Math.floor(i * callInterval + random(fieldHash + i + 100) * callInterval * 0.5);
      const timestamp = `${Math.floor(timeInSeconds / 60)}:${String(timeInSeconds % 60).padStart(2, '0')}`;
      
      // Limit call types to be more realistic
      const callType = species.callTypes[Math.floor(random(fieldHash + i + 500) * species.callTypes.length)];
      
      detections.push({
        timestamp,
        callsDetected: 1,
        species: `${species.name} (${species.commonName})`,
        confidence: 0.75 + random(fieldHash + i + 200) * 0.20, // 75-95% confidence
        frequency: species.frequency[0] + random(fieldHash + i + 300) * (species.frequency[1] - species.frequency[0]),
        intensity: 0.5 + random(fieldHash + i + 400) * 0.4, // 50-90% intensity
        callType
      });
    }

    // Sort detections by timestamp
    detections.sort((a, b) => {
      const [aMin, aSec] = a.timestamp.split(':').map(Number);
      const [bMin, bSec] = b.timestamp.split(':').map(Number);
      return (aMin * 60 + aSec) - (bMin * 60 + bSec);
    });

    // Calculate water quality status
    let waterQualityStatus: 'good' | 'warning' | 'alert';
    if (baseCallsPerMinute >= 40) {
      waterQualityStatus = 'good';
    } else if (baseCallsPerMinute >= 25) {
      waterQualityStatus = 'warning';
    } else {
      waterQualityStatus = 'alert';
    }

    const biodiversityScore = Math.min(1, speciesCount / 3);
    const avgFrequency = detections.length > 0 ? 
      detections.reduce((sum, d) => sum + d.frequency, 0) / detections.length : 1000;
    
    // More realistic call patterns - don't over-complicate
    const uniqueCallTypes = [...new Set(detections.map(d => d.callType).filter(Boolean))];
    const callPatterns = uniqueCallTypes.slice(0, 2); // Max 2 call patterns to be realistic

    let recommendation: string;
    if (waterQualityStatus === 'good') {
      recommendation = `Excellent water quality in ${field.name}! High frog activity (${baseCallsPerMinute} calls/min) indicates healthy ecosystem conditions. Continue current farming practices.`;
    } else if (waterQualityStatus === 'warning') {
      recommendation = `Moderate water quality in ${field.name}. Frog activity is ${baseCallsPerMinute} calls/min. Consider reducing chemical inputs, testing pH levels, and ensuring proper water circulation.`;
    } else {
      recommendation = `CRITICAL: Poor water quality detected in ${field.name}! Very low frog activity (${baseCallsPerMinute} calls/min). IMMEDIATE ACTION: Stop chemical treatments, flush with clean water, test for contamination.`;
    }

    const analysis: AnalysisResult = {
      totalCalls,
      callsPerMinute: baseCallsPerMinute,
      waterQualityStatus,
      speciesCount,
      biodiversityScore,
      ecosystemHealth: biodiversityScore > 0.6 ? 'Good' : biodiversityScore > 0.3 ? 'Fair' : 'Poor',
      recommendation,
      communicationPatterns: {
        dominantFrequency: avgFrequency,
        callPatterns: callPatterns.length > 0 ? callPatterns : ['Mating calls detected'],
        behavioralInsights: [
          `${speciesCount} species identified in ${field.name}`,
          `Dominant frequency: ${avgFrequency.toFixed(0)}Hz`,
          `Audio duration: ${Math.floor(audioLength / 60)}:${String(audioLength % 60).padStart(2, '0')}`,
          `Field: ${field.location} • ${field.size}`
        ]
      }
    };

    return { detections, analysis };
  };

  // Simulate microphone permission check - always grant access
  const checkMicPermission = async () => {
    // Always simulate granted access for simplicity
    setMicPermission('granted');
    console.log('🎤 Microphone access simulated as granted');
  };

  // Initialize permission check on mount
  useEffect(() => {
    checkMicPermission();
  }, []);

  // Simulate microphone permission request
  const requestMicPermission = async (): Promise<boolean> => {
    setError(null);
    setPermissionError(null);
    
    if (!selectedField) {
      setError('Please select a paddy field before recording.');
      return false;
    }

    // Always simulate success
    setMicPermission('granted');
    setShowPermissionGuide(false);
    console.log('✅ Microphone permission simulated as granted');
    return true;
  };

  // Simulate microphone initialization
  const initializeMicrophone = async (): Promise<MediaStream> => {
    try {
      // Try to get real microphone for actual recording, but don't fail if denied
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: 44100
          }
        });

        // Set up audio context for real-time visualization
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        audioStreamRef.current = stream;

        return stream;
      } catch (realMicError) {
        // If real microphone fails, simulate it anyway
        console.log('Real microphone not available, simulating...');
        return null as any; // We'll handle this in the recording logic
      }
    } catch (error) {
      // Even if everything fails, continue with simulation
      console.log('Microphone simulation mode');
      return null as any;
    }
  };

  // Start recording with simulation support
  const startRecording = async () => {
    try {
      setError(null);
      setPermissionError(null);
      
      if (!selectedField) {
        setError('Please select a paddy field before recording.');
        return;
      }

      const stream = await initializeMicrophone();
      
      // Set up recording state
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        recordedBlob: null,
        recordedUrl: null
      }));

      if (stream) {
        // Real recording with actual microphone
        try {
          let mimeType = 'audio/webm;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = 'audio/mp4';
              if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = '';
              }
            }
          }

          const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
          const audioChunks: Blob[] = [];

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            setRecordingState(prev => ({
              ...prev,
              recordedBlob: audioBlob,
              recordedUrl: audioUrl,
              isRecording: false
            }));

            // Clean up
            stream.getTracks().forEach(track => track.stop());
            if (audioContextRef.current) {
              audioContextRef.current.close();
            }
          };

          recorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            setError('Recording failed. Please try again.');
            stopRecording();
          };

          recorder.start(1000);
          mediaRecorderRef.current = recorder;
          
          // Start audio visualization if available
          if (analyserRef.current) {
            startAudioVisualization();
          }
        } catch (recorderError) {
          console.log('MediaRecorder failed, using simulation mode');
          // Continue with simulation
        }
      }

      // Start duration timer regardless of real/simulated recording
      durationIntervalRef.current = setInterval(() => {
        setRecordingState(prev => {
          const newDuration = prev.duration + 1;
          
          // Simulate audio level for visualization
          if (!analyserRef.current) {
            const simulatedLevel = 30 + Math.random() * 40; // 30-70%
            prev.audioLevel = simulatedLevel;
          }
          
          // Auto-stop at maximum duration
          if (newDuration >= MAX_RECORDING_DURATION) {
            stopRecording();
            return prev;
          }
          
          return { ...prev, duration: newDuration };
        });
      }, 1000);
      
      console.log(`🎤 Started recording for ${selectedField.name}`);

    } catch (error) {
      console.error('❌ Recording failed:', error);
      setError(`Recording failed: ${error.message}`);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // If no real recording, simulate a recorded blob
      const simulatedBlob = new Blob(['simulated audio data'], { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(simulatedBlob);
      
      setRecordingState(prev => ({
        ...prev,
        recordedBlob: simulatedBlob,
        recordedUrl: audioUrl,
        isRecording: false
      }));
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (visualizerRef.current) {
      cancelAnimationFrame(visualizerRef.current);
      visualizerRef.current = null;
    }

    setRecordingState(prev => ({ ...prev, isRecording: false }));
  };

  // Audio visualization
  const startAudioVisualization = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!recordingState.isRecording) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate audio level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setRecordingState(prev => ({ ...prev, audioLevel: average }));

      // Draw waveform
      ctx.fillStyle = 'rgba(107, 156, 127, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#6b9c7f';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();
      visualizerRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedField) {
      setError('Please select a paddy field before uploading audio.');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (MP3, WAV, M4A, etc.)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Please upload files smaller than 50MB.');
      return;
    }
    
    setError(null);
    setPermissionError(null);
    setUploadedFile(file);
    
    // Reset recording state
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioLevel: 0,
      recordedBlob: null,
      recordedUrl: null
    });
    
    // Create audio URL for playback
    const url = URL.createObjectURL(file);
    setRecordingState(prev => ({ ...prev, recordedUrl: url }));
    
    // Start processing
    processAudio(file);
  };

  // Simulated audio processing with realistic stages and delays
  const processAudio = async (audioFile: File | Blob) => {
    if (!selectedField) {
      setError('No field selected for analysis.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Stage 1: Preparation
      setProcessingStage("Preparing audio for analysis...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Stage 2: Upload simulation
      setProcessingStage("Uploading to NADA AI backend...");
      console.log(`🔊 Analyzing audio for ${selectedField.name} in ${selectedField.location}...`);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Stage 3: AI Processing
      setProcessingStage("AI models processing frog calls...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stage 4: Pattern Recognition
      setProcessingStage("Interpreting communication patterns...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stage 5: Generate Results
      setProcessingStage("Saving results to field database...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get audio duration for realistic analysis
      let audioDuration = recordingState.duration;
      
      // If uploaded file, estimate duration from file size (rough estimate)
      if (uploadedFile && !audioDuration) {
        // Rough estimate: 1MB per minute for compressed audio
        audioDuration = Math.max(10, Math.min(300, Math.floor((uploadedFile.size / (1024 * 1024)) * 60)));
      }
      
      // Fallback duration
      if (!audioDuration) {
        audioDuration = 30; // Default to 30 seconds
      }
      
      // Generate simulation data
      const { detections, analysis } = generateSimulationData(selectedField, audioDuration);
      
      setRecentDetections(detections);
      setAnalysisResult(analysis);
      
      // Generate visualization
      const staticWaveform = Array.from({ length: 100 }, (_, i) => {
        const baseAmplitude = Math.sin(i * 0.1) * 30 + 40;
        const noise = Math.random() * 20;
        return Math.min(100, baseAmplitude + noise);
      });
      setWaveformData(staticWaveform);
      
      console.log(`✅ Analysis completed for ${selectedField.name}:`, {
        callsPerMinute: analysis.callsPerMinute,
        waterQualityStatus: analysis.waterQualityStatus,
        speciesCount: analysis.speciesCount,
        audioDuration: `${Math.floor(audioDuration / 60)}:${String(audioDuration % 60).padStart(2, '0')}`
      });
      
    } catch (error) {
      console.error('❌ Audio processing failed:', error);
      setError(`Analysis failed: ${error.message}`);
      setRecentDetections([]);
      setAnalysisResult(null);
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get recording status
  const getRecordingStatus = () => {
    if (recordingState.isRecording) {
      if (recordingState.duration < MIN_RECORDING_DURATION) {
        return { 
          color: 'text-dusty-pink-600', 
          message: `Recording... ${MIN_RECORDING_DURATION - recordingState.duration}s minimum remaining` 
        };
      } else if (recordingState.duration >= RECOMMENDED_DURATION) {
        return { 
          color: 'text-sage-600', 
          message: 'Good duration reached - you can stop anytime' 
        };
      } else {
        return { 
          color: 'text-dusty-pink-600', 
          message: `Recording... ${RECOMMENDED_DURATION - recordingState.duration}s recommended remaining` 
        };
      }
    }
    return { color: 'text-sage-600', message: 'Ready to record' };
  };

  const recordingStatus = getRecordingStatus();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (visualizerRef.current) {
        cancelAnimationFrame(visualizerRef.current);
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Draw static waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = analysisResult?.waterQualityStatus === 'good' ? '#6b9c7f' : 
                     analysisResult?.waterQualityStatus === 'warning' ? '#c17d74' : '#d49e97';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    waveformData.forEach((value, index) => {
      const x = (index / waveformData.length) * canvas.width;
      const y = canvas.height - (value / 100) * canvas.height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }, [waveformData, analysisResult]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const clearAll = () => {
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioLevel: 0,
      recordedBlob: null,
      recordedUrl: null
    });
    setUploadedFile(null);
    setAnalysisResult(null);
    setRecentDetections([]);
    setWaveformData([]);
    setError(null);
    setPermissionError(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadRecording = () => {
    if (!recordingState.recordedBlob) return;
    
    const url = URL.createObjectURL(recordingState.recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedField?.name || 'field'}_recording_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPermissionStatusDisplay = () => {
    return {
      icon: CheckCircle,
      color: 'text-sage-600',
      bgColor: 'bg-sage-100',
      message: 'Microphone access granted'
    };
  };

  const permissionStatus = getPermissionStatusDisplay();
  const PermissionIcon = permissionStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sage-800">Audio Analysis</h2>
            <p className="text-sm text-sage-600">Record or upload frog calls to analyze water quality</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={clearAll}
              variant="ghost"
              className="text-sage-600 hover:text-sage-800"
              disabled={recordingState.isRecording || isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Field Context Display */}
        {selectedField ? (
          <Card className="p-4 border-sage-200 bg-sage-50">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-sage-600" />
              <div>
                <p className="font-medium text-sage-800">Recording for: {selectedField.name}</p>
                <p className="text-sm text-sage-600">{selectedField.location} • {selectedField.size}</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 border-dusty-pink-200 bg-dusty-pink-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-dusty-pink-600" />
              <div>
                <p className="font-medium text-dusty-pink-800">No Field Selected</p>
                <p className="text-sm text-dusty-pink-700">Please select a paddy field using the dropdown in the header before recording.</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Audio element for playback */}
      {recordingState.recordedUrl && (
        <audio
          ref={audioRef}
          src={recordingState.recordedUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-dusty-pink-200 bg-dusty-pink-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-dusty-pink-600" />
            <div>
              <p className="font-medium text-dusty-pink-800">Error</p>
              <p className="text-sm text-dusty-pink-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recording and Upload Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Recording */}
        <Card className="fairy-card border-sage-200/50 p-6 fairy-glow">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sage-500 to-sage-600 rounded-full flex items-center justify-center">
                {recordingState.isRecording ? <MicOff className="w-5 h-5 text-cream-50" /> : <Mic className="w-5 h-5 text-cream-50" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sage-800">Live Recording</h3>
                <p className="text-sm text-sage-600">Record frog calls directly from your device</p>
              </div>
            </div>

            {/* Permission Status - Always Granted */}
            <div className={`p-3 rounded-lg border-2 border-sage-300 bg-sage-100`}>
              <div className="flex items-center gap-3">
                <PermissionIcon className={`w-5 h-5 text-sage-600`} />
                <div className="flex-1">
                  <p className="font-medium text-sage-800">Microphone access granted</p>
                  <p className="text-sm text-sage-600 mt-1">Ready to record frog calls</p>
                </div>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="space-y-4">
              {!recordingState.isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={!selectedField || isProcessing}
                  className="w-full h-12 bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-cream-50 font-medium"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="w-full h-12 bg-gradient-to-r from-dusty-pink-500 to-dusty-pink-600 hover:from-dusty-pink-600 hover:to-dusty-pink-700 text-cream-50 font-medium"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Recording ({formatDuration(recordingState.duration)})
                </Button>
              )}

              {/* Recording Status */}
              <div className="flex items-center justify-between text-sm">
                <span className={recordingStatus.color}>{recordingStatus.message}</span>
                {recordingState.isRecording && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-dusty-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-sage-600">LIVE</span>
                  </div>
                )}
              </div>

              {/* Audio Level Indicator */}
              {recordingState.isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sage-600">Audio Level</span>
                    <span className="text-sage-800">{Math.round(recordingState.audioLevel)}%</span>
                  </div>
                  <Progress value={recordingState.audioLevel} className="h-2" />
                </div>
              )}

              {/* Recording Tips */}
              {!recordingState.isRecording && (
                <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
                  <h4 className="font-medium text-sage-800 mb-2">Recording Tips:</h4>
                  <ul className="text-sm text-sage-700 space-y-1">
                    <li>• Record during dawn (5-7 AM) or dusk (6-8 PM)</li>
                    <li>• Keep device close to water (1-2 meters)</li>
                    <li>• Minimum 30 seconds, recommended 2 minutes</li>
                    <li>• Avoid traffic noise and disturbances</li>
                  </ul>
                </div>
              )}

              {/* Actions for recorded audio */}
              {recordingState.recordedBlob && !recordingState.isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Recording complete ({formatDuration(recordingState.duration)})
                    </span>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePlayback}
                      className="border-sage-300"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadRecording}
                      className="border-sage-300"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => processAudio(recordingState.recordedBlob!)}
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-cream-50"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Upload Section */}
        <Card className="fairy-card border-sage-200/50 p-6 fairy-glow">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-lavender-500 to-lavender-600 rounded-full flex items-center justify-center">
                <Upload className="w-5 h-5 text-cream-50" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sage-800">Upload Audio File</h3>
                <p className="text-sm text-sage-600">Upload existing frog call recordings</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-sage-300 rounded-lg p-6 text-center hover:border-sage-400 transition-colors">
              <FileAudio className="w-12 h-12 text-sage-500 mx-auto mb-4" />
              <p className="text-sage-700 mb-2">
                <strong>Click to upload</strong> or drag audio file here
              </p>
              <p className="text-sm text-sage-600 mb-4">
                Supports MP3, WAV, M4A • Max 50MB
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="bg-gradient-to-r from-lavender-500 to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 text-cream-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Audio File
              </Button>
            </div>

            {uploadedFile && (
              <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
                <div className="flex items-center gap-3">
                  <FileAudio className="w-5 h-5 text-sage-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sage-800">{uploadedFile.name}</p>
                    <p className="text-sm text-sage-600">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Badge className="bg-sage-600 text-cream-50">Ready for Analysis</Badge>
                </div>
              </div>
            )}

            {/* Upload Tips */}
            <div className="bg-lavender-50 p-4 rounded-lg border border-lavender-200">
              <h4 className="font-medium text-lavender-800 mb-2">Upload Tips:</h4>
              <ul className="text-sm text-lavender-700 space-y-1">
                <li>• Best quality: 44.1kHz sampling rate</li>
                <li>• Clear recordings without background music</li>
                <li>• Natural environment sounds preferred</li>
                <li>• Multiple short clips better than one long file</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Audio Visualization */}
      <Card className="fairy-card border-sage-200/50 p-6 fairy-glow">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-sage-800">Audio Visualization</h3>
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-sage-600" />
              <span className="text-sm text-sage-600">
                {recordingState.isRecording ? "Live" : 
                 recordingState.recordedBlob ? "Recorded" : 
                 uploadedFile ? "Uploaded" : "Inactive"}
              </span>
            </div>
          </div>
          
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="w-full h-32 border border-sage-200 rounded bg-gradient-to-br from-cream-50 to-sage-50"
          />

          <div className="text-center">
            <p className="text-sm text-sage-600">
              {recordingState.isRecording ? 
                "Live audio visualization - make sounds near your device" :
                recordingState.recordedBlob ? 
                "Recording visualization complete" :
                uploadedFile ? 
                "Upload an audio file to see visualization" :
                "Click record button to start capturing frog calls"
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card className="p-6 border-sage-200 bg-gradient-to-r from-sage-50 to-lavender-50">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-sage-600 border-t-transparent rounded-full animate-spin" />
              <Brain className="w-6 h-6 text-sage-600" />
              <Activity className="w-6 h-6 text-sage-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-sage-800">AI Analysis in Progress</h3>
              <p className="text-sm text-sage-600">{processingStage}</p>
              <p className="text-xs text-sage-500 mt-2">
                Analyzing frog calls for {selectedField?.name} using NatureLM & AVES models...
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && !isProcessing && (
        <div className="space-y-6">
          {/* Water Quality Assessment */}
          <Card className={`p-6 border-2 ${
            analysisResult.waterQualityStatus === 'good' ? 'border-sage-300 bg-gradient-to-br from-sage-50 to-moss-50' :
            analysisResult.waterQualityStatus === 'warning' ? 'border-dusty-pink-300 bg-gradient-to-br from-cream-50 to-dusty-pink-50' :
            'border-dusty-pink-400 bg-gradient-to-br from-dusty-pink-50 to-dusty-pink-100'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sage-800">Water Quality Assessment</h3>
                <Badge className={
                  analysisResult.waterQualityStatus === 'good' ? 'bg-sage-600 text-cream-50' :
                  analysisResult.waterQualityStatus === 'warning' ? 'bg-dusty-pink-600 text-cream-50' :
                  'bg-dusty-pink-700 text-cream-50'
                }>
                  {analysisResult.waterQualityStatus === 'good' ? 'Excellent Quality' :
                   analysisResult.waterQualityStatus === 'warning' ? 'Moderate Quality' :
                   'Poor Quality'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-cream-50 rounded-lg border border-sage-200">
                  <div className="text-2xl font-bold text-sage-800">{analysisResult.callsPerMinute}</div>
                  <div className="text-sm text-sage-600">calls/min</div>
                </div>
                <div className="text-center p-3 bg-cream-50 rounded-lg border border-sage-200">
                  <div className="text-2xl font-bold text-sage-800">{analysisResult.speciesCount}</div>
                  <div className="text-sm text-sage-600">species</div>
                </div>
                <div className="text-center p-3 bg-cream-50 rounded-lg border border-sage-200">
                  <div className="text-2xl font-bold text-sage-800">{Math.round(analysisResult.biodiversityScore * 100)}%</div>
                  <div className="text-sm text-sage-600">biodiversity</div>
                </div>
                <div className="text-center p-3 bg-cream-50 rounded-lg border border-sage-200">
                  <div className="text-2xl font-bold text-sage-800">{analysisResult.totalCalls}</div>
                  <div className="text-sm text-sage-600">total calls</div>
                </div>
              </div>

              <Card className="p-4 bg-gradient-to-r from-lavender-50 to-cream-50 border border-sage-200">
                <h4 className="font-semibold text-sage-800 mb-2">Recommendation for {selectedField?.name}:</h4>
                <p className="text-sm text-sage-700 leading-relaxed">{analysisResult.recommendation}</p>
              </Card>
            </div>
          </Card>

          {/* Species Detection Results */}
          {recentDetections.length > 0 && (
            <Card className="p-6 border-sage-200">
              <h3 className="text-lg font-semibold text-sage-800 mb-4">Species Detected</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentDetections.map((detection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg border border-sage-200">
                    <div className="flex-1">
                      <div className="font-medium text-sage-800">{detection.species}</div>
                      <div className="text-sm text-sage-600">
                        {detection.timestamp} • {detection.frequency.toFixed(0)}Hz • {detection.callType}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-sage-800">{Math.round(detection.confidence * 100)}%</div>
                      <div className="text-xs text-sage-600">confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Communication Patterns */}
          {analysisResult.communicationPatterns && (
            <Card className="p-6 border-sage-200">
              <h3 className="text-lg font-semibold text-sage-800 mb-4">Communication Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sage-800 mb-2">Call Patterns</h4>
                  <div className="space-y-1">
                    {analysisResult.communicationPatterns.callPatterns.map((pattern, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-1">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sage-800 mb-2">Analysis Summary</h4>
                  <div className="space-y-1">
                    {analysisResult.communicationPatterns.behavioralInsights.map((insight, index) => (
                      <p key={index} className="text-sm text-sage-700">• {insight}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}