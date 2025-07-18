import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, CheckCircle, Clock, Droplets, Volume2, MapPin, Phone, MessageSquare, Wrench, Sparkles, Leaf, Heart } from "lucide-react";

interface WaterQualityData {
  paddyId: string;
  location: string;
  callsPerMinute: number;
  status: 'good' | 'warning' | 'alert';
  statusText: string;
  lastUpdated: string;
  temperature: number;
  humidity: number;
  ph: number;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
}

const mockData: WaterQualityData[] = [
  {
    paddyId: "Field A",
    location: "Kedah Valley, Malaysia",
    callsPerMinute: 62,
    status: 'good',
    statusText: "Good Water Quality",
    lastUpdated: "2 minutes ago",
    temperature: 28.5,
    humidity: 85,
    ph: 7.2,
    recommendation: "Water quality is excellent. Maintain current practices for optimal frog activity and healthy paddy conditions.",
    urgency: 'low'
  },
  {
    paddyId: "Field B", 
    location: "Selangor Hills, Malaysia",
    callsPerMinute: 34,
    status: 'warning',
    statusText: "Warning - Check Water",
    lastUpdated: "5 minutes ago",
    temperature: 29.1,
    humidity: 82,
    ph: 7.8,
    recommendation: "Frog call activity is decreasing. Consider reducing chemical inputs and checking water pH levels.",
    urgency: 'medium'
  },
  {
    paddyId: "Field C",
    location: "Perak Highlands, Malaysia", 
    callsPerMinute: 18,
    status: 'alert',
    statusText: "Critical - Immediate Action",
    lastUpdated: "1 minute ago",
    temperature: 31.2,
    humidity: 78,
    ph: 8.3,
    recommendation: "Very low frog activity detected. Stop all chemical treatments immediately and flush fields with clean water.",
    urgency: 'high'
  }
];

export function Dashboard() {
  const handleTakeAction = (fieldId: string) => {
    alert(`Taking immediate action for ${fieldId}. Field operations will be initiated to improve water quality.`);
  };

  const handleCheckField = (fieldId: string) => {
    alert(`Scheduling field inspection for ${fieldId}. You will receive an update within 30 minutes.`);
  };

  const handleMaintainCurrent = (fieldId: string) => {
    alert(`Continuing current practices for ${fieldId}. Keep up the good work!`);
  };

  const handleCallExpert = (fieldId: string) => {
    alert(`Connecting you with a water quality expert for ${fieldId}. Phone: +60 3-1234-5678`);
  };

  const handleGetSupport = () => {
    alert('Opening support chat... Our experts are available 24/7 to help you with water quality management.');
  };

  const getStatusStyling = (status: string) => {
    switch(status) {
      case 'good': return 'fairy-accent-good';
      case 'warning': return 'fairy-accent-warning';
      case 'alert': return 'fairy-accent-alert';
      default: return 'fairy-accent-good';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-sage-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-cream-700" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-dusty-pink-600" />;
      default: return <CheckCircle className="w-5 h-5 text-sage-600" />;
    }
  };

  const getActionButton = (status: string, urgency: string, fieldId: string) => {
    if (status === 'alert') {
      return (
        <Button 
          className="w-full bg-gradient-to-r from-dusty-pink-400 to-dusty-pink-500 hover:from-dusty-pink-500 hover:to-dusty-pink-600 text-cream-50 shadow-lg transition-all duration-200"
          onClick={() => handleTakeAction(fieldId)}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Take Action Now
        </Button>
      );
    }
    if (status === 'warning') {
      return (
        <Button 
          className="w-full bg-gradient-to-r from-cream-200 to-dusty-pink-200 hover:from-cream-300 hover:to-dusty-pink-300 text-sage-800 border border-cream-300/50 shadow-md transition-all duration-200"
          onClick={() => handleCheckField(fieldId)}
        >
          <Clock className="w-4 h-4 mr-2" />
          Check Field
        </Button>
      );
    }
    return (
      <Button 
        className="w-full bg-gradient-to-r from-sage-200 to-moss-200 hover:from-sage-300 hover:to-moss-300 text-sage-800 border border-sage-300/50 shadow-md transition-all duration-200"
        onClick={() => handleMaintainCurrent(fieldId)}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Maintain Current
      </Button>
    );
  };

  const totalFields = mockData.length;
  const healthyFields = mockData.filter(p => p.status === 'good').length;
  const warningFields = mockData.filter(p => p.status === 'warning').length;
  const alertFields = mockData.filter(p => p.status === 'alert').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Droplets className="w-8 h-8 text-sage-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sage-700 to-sage-800 bg-clip-text text-transparent">Water Quality Dashboard</h1>
          <Droplets className="w-8 h-8 text-sage-600" />
        </div>
        <p className="text-sage-700 text-lg">Monitor your paddy fields through frog call analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="fairy-card border-sage-200/50 p-6 fairy-glow hover:shadow-lg transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sage-300 to-sage-400 rounded-full mx-auto flex items-center justify-center">
              <Droplets className="w-6 h-6 text-cream-50" />
            </div>
            <p className="text-sm text-sage-700 font-medium">Total Fields</p>
            <p className="text-3xl font-bold text-sage-800">{totalFields}</p>
          </div>
        </Card>
        
        <Card className="fairy-card border-sage-200/50 p-6 fairy-glow hover:shadow-lg transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-moss-400 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-cream-50" />
            </div>
            <p className="text-sm text-sage-700 font-medium">Good Quality</p>
            <p className="text-3xl font-bold text-sage-800">{healthyFields}</p>
          </div>
        </Card>
        
        <Card className="fairy-card border-cream-200/50 p-6 fairy-glow hover:shadow-lg transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cream-400 to-dusty-pink-300 rounded-full mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-cream-50" />
            </div>
            <p className="text-sm text-dusty-pink-800 font-medium">Needs Attention</p>
            <p className="text-3xl font-bold text-dusty-pink-800">{warningFields}</p>
          </div>
        </Card>
        
        <Card className="fairy-card border-dusty-pink-200/50 p-6 fairy-glow hover:shadow-lg transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-dusty-pink-400 to-dusty-pink-500 rounded-full mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-cream-50" />
            </div>
            <p className="text-sm text-dusty-pink-800 font-medium">Critical</p>
            <p className="text-3xl font-bold text-dusty-pink-900">{alertFields}</p>
          </div>
        </Card>
      </div>

      {/* Field Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {mockData.map((field) => (
          <Card key={field.paddyId} className={`fairy-card border-sage-200/50 p-6 fairy-glow hover:shadow-xl transition-all duration-300 ${
            field.status === 'alert' ? 'bg-gradient-to-br from-dusty-pink-50/50 to-dusty-pink-100/30' :
            field.status === 'warning' ? 'bg-gradient-to-br from-cream-50/50 to-dusty-pink-50/30' :
            'bg-gradient-to-br from-sage-50/50 to-moss-50/30'
          }`}>
            <div className="space-y-5">
              {/* Field Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-sage-600" />
                  <div>
                    <h3 className="font-bold text-xl text-sage-800">{field.paddyId}</h3>
                    <p className="text-sm text-sage-700">{field.location}</p>
                  </div>
                </div>
                <Badge className={getStatusStyling(field.status)}>
                  {field.statusText}
                </Badge>
              </div>
              
              <p className="text-xs text-sage-600">Last updated {field.lastUpdated}</p>

              {/* Frog Call Level */}
              <Card className="fairy-card border-sage-200/30 p-4 bg-gradient-to-r from-cream-50/50 to-sage-50/50">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Volume2 className="w-5 h-5 text-sage-600" />
                    <span className="text-sm font-medium text-sage-700">Frog Calls</span>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-sage-600 to-sage-700 bg-clip-text text-transparent">
                    {field.callsPerMinute}
                    <span className="text-sm text-sage-600 font-normal">/min</span>
                  </div>
                </div>
              </Card>

              {/* Environmental Data */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 fairy-card border-sage-200/30 rounded-lg">
                  <span className="text-xs text-sage-700 block font-medium">Temp</span>
                  <span className="font-bold text-sage-700">{field.temperature}°C</span>
                </div>
                <div className="text-center p-3 fairy-card border-sage-200/30 rounded-lg">
                  <span className="text-xs text-sage-700 block font-medium">Humidity</span>
                  <span className="font-bold text-sage-700">{field.humidity}%</span>
                </div>
                <div className="text-center p-3 fairy-card border-sage-200/30 rounded-lg">
                  <span className="text-xs text-sage-700 block font-medium">pH</span>
                  <span className="font-bold text-sage-700">{field.ph}</span>
                </div>
              </div>

              {/* Recommendation */}
              <Card className="fairy-card border-sage-200/30 p-4 bg-gradient-to-br from-lavender-50/30 to-cream-50/30">
                <div className="flex items-start gap-2">
                  {getStatusIcon(field.status)}
                  <div>
                    <p className="text-sm font-medium text-sage-700 mb-1">Recommendation:</p>
                    <p className="text-sm text-sage-700 leading-relaxed">{field.recommendation}</p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {getActionButton(field.status, field.urgency, field.paddyId)}
                {field.status === 'alert' && (
                  <Button 
                    className="w-full bg-gradient-to-r from-lavender-200 to-dusty-pink-200 hover:from-lavender-300 hover:to-dusty-pink-300 text-sage-800 border border-lavender-300/50 shadow-md transition-all duration-200"
                    onClick={() => handleCallExpert(field.paddyId)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Expert
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Help Card */}
      <Card className="fairy-card border-sage-200/50 p-8 fairy-glow bg-gradient-to-br from-lavender-50/30 to-sage-50/30">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center fairy-glow">
            <MessageSquare className="w-8 h-8 text-cream-50" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-sage-800 mb-2">
              Need Help?
            </h3>
            <p className="text-sage-600 leading-relaxed">
              Our water quality experts are here to help you interpret frog call data and improve your paddy field conditions.
            </p>
          </div>
          <Button 
            className="fairy-button-primary shadow-lg"
            onClick={handleGetSupport}
          >
            Get Support
          </Button>
        </div>
      </Card>
    </div>
  );
}