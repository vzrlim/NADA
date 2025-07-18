import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Play, Pause, Volume2, Activity, Zap, Upload, FileAudio, X, CheckCircle } from "lucide-react";

interface DetectionResult {
  timestamp: string;
  callsDetected: number;
  species: string;
  confidence: number;
  frequency: number;
}

export function AudioAnalysis() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentCalls, setCurrentCalls] = useState(45);
  const [recentDetections, setRecentDetections] = useState<DetectionResult[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate real-time audio processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        // Generate random waveform data
        const newWaveform = Array.from({ length: 100 }, () => Math.random() * 100);
        setWaveformData(newWaveform);
        
        // Simulate frog call detection
        if (Math.random() > 0.7) {
          const detection: DetectionResult = {
            timestamp: new Date().toLocaleTimeString(),
            callsDetected: Math.floor(Math.random() * 5) + 1,
            species: ['Hylarana erythraea', 'Fejervarya limnocharis', 'Microhyla butleri'][Math.floor(Math.random() * 3)],
            confidence: Math.random() * 0.3 + 0.7,
            frequency: Math.random() * 2000 + 1000
          };
          
          setRecentDetections(prev => [detection, ...prev].slice(0, 10));
          setCurrentCalls(prev => Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1)));
        }
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, [isRecording]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#10b981';
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
  }, [waveformData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is audio
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }
    
    setUploadedFile(file);
    setProcessingComplete(false);
    
    // Create audio URL for playback
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Simulate processing
    processUploadedAudio(file);
  };

  const processUploadedAudio = async (file: File) => {
    setIsProcessing(true);
    setRecentDetections([]);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate mock detection results for uploaded file
    const mockDetections: DetectionResult[] = [
      {
        timestamp: "0:15",
        callsDetected: 3,
        species: "Hylarana erythraea",
        confidence: 0.87,
        frequency: 1245
      },
      {
        timestamp: "0:32",
        callsDetected: 2,
        species: "Fejervarya limnocharis",
        confidence: 0.92,
        frequency: 1890
      },
      {
        timestamp: "0:48",
        callsDetected: 1,
        species: "Microhyla butleri",
        confidence: 0.78,
        frequency: 2150
      },
      {
        timestamp: "1:05",
        callsDetected: 4,
        species: "Hylarana erythraea",
        confidence: 0.85,
        frequency: 1320
      }
    ];
    
    setRecentDetections(mockDetections);
    setCurrentCalls(mockDetections.reduce((sum, d) => sum + d.callsDetected, 0));
    setIsProcessing(false);
    setProcessingComplete(true);
    
    // Generate static waveform for uploaded file
    const staticWaveform = Array.from({ length: 100 }, (_, i) => 
      Math.sin(i * 0.1) * 50 + 25 + Math.random() * 25
    );
    setWaveformData(staticWaveform);
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setAudioUrl(null);
    setProcessingComplete(false);
    setIsProcessing(false);
    setRecentDetections([]);
    setWaveformData([]);
    setCurrentCalls(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getQualityStatus = (calls: number) => {
    if (calls >= 8) return { status: 'High Activity', color: 'bg-green-100 text-green-800' };
    if (calls >= 4) return { status: 'Medium Activity', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Low Activity', color: 'bg-red-100 text-red-800' };
  };

  const qualityStatus = getQualityStatus(currentCalls);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-sage-800">Audio Analysis</h2>
          <p className="text-sm text-sage-600">RIBBIT & AVES Integration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 border-sage-300 hover:bg-sage-50"
          >
            <Upload className="w-4 h-4" />
            Upload Audio
          </Button>
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={() => setIsRecording(!isRecording)}
            className="flex items-center gap-2 bg-sage-600 hover:bg-sage-700"
            disabled={uploadedFile !== null}
          >
            {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRecording ? "Stop" : "Start"} Live
          </Button>
        </div>
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
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* File Upload Status */}
      {uploadedFile && (
        <Card className="p-4 border-sage-200 bg-sage-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileAudio className="w-5 h-5 text-sage-600" />
              <div>
                <p className="font-medium text-sage-800">{uploadedFile.name}</p>
                <p className="text-sm text-sage-600">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isProcessing && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-sage-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-sage-600">Processing...</span>
                </div>
              )}
              {processingComplete && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">Analysis Complete</span>
                </div>
              )}
              {audioUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAudioPlayback}
                  className="border-sage-300"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-sage-600 hover:text-sage-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Waveform */}
        <Card className="p-6 border-sage-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-sage-800">
                {uploadedFile ? "Uploaded Audio" : "Live Audio Stream"}
              </h3>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sage-600" />
                <span className="text-sm text-sage-600">
                  {isRecording ? "Recording" : uploadedFile ? "Uploaded" : "Inactive"}
                </span>
              </div>
            </div>
            
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="w-full h-32 bg-sage-50 rounded border border-sage-200"
            />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-sage-600">Sample Rate</span>
                <p className="font-medium text-sage-800">44.1 kHz</p>
              </div>
              <div>
                <span className="text-sage-600">Bit Depth</span>
                <p className="font-medium text-sage-800">16-bit</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Status */}
        <Card className="p-6 border-sage-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-sage-800">Analysis Results</h3>
              <Badge className={qualityStatus.color}>
                {qualityStatus.status}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-sage-600">
                    {uploadedFile ? "Total Calls Detected" : "Calls per Minute"}
                  </span>
                  <span className="font-bold text-2xl text-sage-800">{currentCalls}</span>
                </div>
                <Progress value={(currentCalls / 15) * 100} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-sage-600">Processing</span>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-sage-500" />
                    <span className="text-sm text-sage-700">OpenSoundscape</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-sage-600">AI Model</span>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sage-500" />
                    <span className="text-sm text-sage-700">AVES v2.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Detections */}
      <Card className="p-6 border-sage-200">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-sage-800">
            {uploadedFile ? "Detected Frog Calls" : "Recent Frog Call Detections"}
          </h3>
          
          {isProcessing ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-sage-600">Analyzing audio for frog calls...</p>
            </div>
          ) : recentDetections.length === 0 ? (
            <p className="text-sm text-sage-600 text-center py-8">
              {isRecording ? "Listening for frog calls..." : uploadedFile ? "No frog calls detected in uploaded file" : "Upload audio file or start live monitoring"}
            </p>
          ) : (
            <div className="space-y-3">
              {recentDetections.map((detection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-sage-50 rounded border border-sage-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-sage-800">{detection.species}</span>
                      <Badge variant="outline" className="text-xs border-sage-300">
                        {Math.round(detection.confidence * 100)}% confident
                      </Badge>
                    </div>
                    <p className="text-xs text-sage-600">
                      {detection.callsDetected} calls detected • {detection.frequency.toFixed(0)}Hz
                    </p>
                  </div>
                  <span className="text-xs text-sage-600">{detection.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}