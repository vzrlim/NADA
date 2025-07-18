import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Play, Pause, Volume2, Activity, Zap } from "lucide-react";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    ctx.strokeStyle = '#3b82f6';
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

  const getQualityStatus = (calls: number) => {
    if (calls >= 50) return { status: 'Good', color: 'bg-green-100 text-green-800' };
    if (calls >= 30) return { status: 'Warning', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Alert', color: 'bg-red-100 text-red-800' };
  };

  const qualityStatus = getQualityStatus(currentCalls);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Real-Time Audio Analysis</h2>
          <p className="text-sm text-muted-foreground">RIBBIT & AVES Integration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={() => setIsRecording(!isRecording)}
            className="flex items-center gap-2"
          >
            {isRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRecording ? "Stop" : "Start"} Monitoring
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Waveform */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Live Audio Stream</h3>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </div>
            </div>
            
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="w-full h-32 bg-gray-50 rounded border"
            />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Sample Rate</span>
                <p className="font-medium">44.1 kHz</p>
              </div>
              <div>
                <span className="text-muted-foreground">Bit Depth</span>
                <p className="font-medium">16-bit</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Status */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current Analysis</h3>
              <Badge className={qualityStatus.color}>
                {qualityStatus.status}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Calls per Minute</span>
                  <span className="font-bold text-xl">{currentCalls}</span>
                </div>
                <Progress value={(currentCalls / 80) * 100} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Processing</span>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">OpenSoundscape</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">AI Model</span>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">AVES v2.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Detections */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Frog Call Detections</h3>
          
          {recentDetections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {isRecording ? "Listening for frog calls..." : "Start monitoring to see detections"}
            </p>
          ) : (
            <div className="space-y-3">
              {recentDetections.map((detection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{detection.species}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(detection.confidence * 100)}% confident
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {detection.callsDetected} calls detected • {detection.frequency.toFixed(0)}Hz
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{detection.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}