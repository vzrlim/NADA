import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, CheckCircle, Clock, Droplets, Volume2, MapPin, Phone, MessageSquare, Plus, Settings, BarChart3 } from "lucide-react";

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

interface DashboardProps {
  fieldContext: FieldContextType;
}

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
  size?: string;
  analysisCount?: number;
  notes?: string;
}

export function Dashboard({ fieldContext }: DashboardProps) {
  const { allFields, onManageFields } = fieldContext;
  // Convert field data to display format with consistent environmental data
  const convertFieldToDisplayData = (field: Field): WaterQualityData => {
    let callsPerMinute: number;
    let temperature: number;
    let humidity: number;
    let ph: number;
    let recommendation: string;
    let urgency: 'low' | 'medium' | 'high';
    let statusText: string;

    // Create consistent values based on field ID for stable demo data
    const fieldHash = field.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const consistentSeed = fieldHash % 100;

    switch (field.status) {
      case 'good':
        callsPerMinute = 62 + (consistentSeed % 8); // 62-69 calls/min for good fields
        temperature = 27.2 + ((consistentSeed * 3) % 20) / 10; // 27.2-29.1°C
        humidity = 82 + (consistentSeed % 8); // 82-89%
        ph = 6.9 + ((consistentSeed * 7) % 8) / 10; // 6.9-7.6
        statusText = "Excellent Water Quality";
        recommendation = `${field.name} has excellent water quality! High frog activity (${callsPerMinute} calls/min) indicates healthy ecosystem conditions. Continue current farming practices.`;
        urgency = 'low';
        break;
      case 'warning':
        callsPerMinute = 34 + (consistentSeed % 12); // 34-45 calls/min for warning fields
        temperature = 28.5 + ((consistentSeed * 5) % 25) / 10; // 28.5-30.9°C
        humidity = 76 + (consistentSeed % 10); // 76-85%
        ph = 7.6 + ((consistentSeed * 11) % 10) / 10; // 7.6-8.5
        statusText = "Warning - Monitor Closely";
        recommendation = `${field.name} shows moderate frog activity (${callsPerMinute} calls/min). Consider reducing chemical inputs, testing pH levels, and monitoring water flow.`;
        urgency = 'medium';
        break;
      case 'alert':
        callsPerMinute = 18 + (consistentSeed % 10); // 18-27 calls/min for alert fields
        temperature = 30.1 + ((consistentSeed * 7) % 30) / 10; // 30.1-33.0°C
        humidity = 68 + (consistentSeed % 12); // 68-79%
        ph = 8.2 + ((consistentSeed * 13) % 15) / 10; // 8.2-9.6
        statusText = "Critical - Immediate Action";
        recommendation = `URGENT: ${field.name} has very low frog activity (${callsPerMinute} calls/min). Stop all chemical treatments immediately, flush with clean water, and contact agricultural extension office.`;
        urgency = 'high';
        break;
      default:
        callsPerMinute = 0;
        temperature = 28.0;
        humidity = 80;
        ph = 7.0;
        statusText = "No Data Available";
        recommendation = `${field.name} needs analysis. Upload audio recordings to assess water quality through frog call monitoring.`;
        urgency = 'low';
        break;
    }

    return {
      paddyId: field.name,
      location: `${field.location} • ${field.size}`,
      callsPerMinute,
      status: field.status === 'unknown' ? 'alert' : field.status,
      statusText,
      lastUpdated: field.lastAnalysis 
        ? `${Math.floor((Date.now() - new Date(field.lastAnalysis).getTime()) / (1000 * 60))} minutes ago`
        : field.status === 'unknown' ? 'Never' : '5 minutes ago',
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      ph: Math.round(ph * 10) / 10,
      recommendation,
      urgency,
      size: field.size,
      analysisCount: field.analysisCount,
      notes: field.notes
    };
  };

  const handleTakeAction = (fieldName: string) => {
    alert(`Taking immediate action for ${fieldName}. Field operations will be initiated to improve water quality.`);
  };

  const handleCheckField = (fieldName: string) => {
    alert(`Scheduling field inspection for ${fieldName}. You will receive an update within 30 minutes.`);
  };

  const handleMaintainCurrent = (fieldName: string) => {
    alert(`Continuing current practices for ${fieldName}. Keep up the good work!`);
  };

  const handleCallExpert = (fieldName: string) => {
    alert(`Connecting you with a water quality expert for ${fieldName}. Phone: +60 3-1234-5678`);
  };

  const handleGetSupport = () => {
    alert('Opening support chat... Our experts are available 24/7 to help you with water quality management.');
  };

  const getStatusStyling = (status: string) => {
    switch(status) {
      case 'good': return 'fairy-accent-good';
      case 'warning': return 'fairy-accent-warning';
      case 'alert': return 'fairy-accent-alert';
      default: return 'fairy-accent-alert';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'good': return <CheckCircle className="w-5 h-5 text-sage-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-dusty-pink-600" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-dusty-pink-700" />;
      default: return <AlertTriangle className="w-5 h-5 text-dusty-pink-600" />;
    }
  };

  const getActionButton = (field: WaterQualityData) => {
    if (field.status === 'alert') {
      return (
        <Button 
          className="w-full bg-gradient-to-r from-dusty-pink-400 to-dusty-pink-500 hover:from-dusty-pink-500 hover:to-dusty-pink-600 text-cream-50 shadow-lg transition-all duration-200"
          onClick={() => handleTakeAction(field.paddyId)}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Take Action Now
        </Button>
      );
    }
    if (field.status === 'warning') {
      return (
        <Button 
          className="w-full bg-gradient-to-r from-cream-200 to-dusty-pink-200 hover:from-cream-300 hover:to-dusty-pink-300 text-sage-800 border border-cream-300/50 shadow-md transition-all duration-200"
          onClick={() => handleCheckField(field.paddyId)}
        >
          <Clock className="w-4 h-4 mr-2" />
          Check Field
        </Button>
      );
    }
    return (
      <Button 
        className="w-full bg-gradient-to-r from-sage-200 to-sage-300 hover:from-sage-300 hover:to-sage-400 text-sage-800 border border-sage-300/50 shadow-md transition-all duration-200"
        onClick={() => handleMaintainCurrent(field.paddyId)}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Maintain Current
      </Button>
    );
  };

  // Convert user fields to dashboard display data
  const dashboardData = allFields.map(convertFieldToDisplayData);
  
  const totalFields = allFields.length;
  const healthyFields = allFields.filter(f => f.status === 'good').length;
  const warningFields = allFields.filter(f => f.status === 'warning').length;
  const alertFields = allFields.filter(f => f.status === 'alert' || f.status === 'unknown').length;

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

      {/* No Fields State */}
      {allFields.length === 0 && (
        <Card className="fairy-card border-sage-200/50 p-12 text-center fairy-glow">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full mx-auto flex items-center justify-center">
              <Plus className="w-8 h-8 text-cream-50" />
            </div>
            <h3 className="text-xl font-bold text-sage-800">No Paddy Fields Added</h3>
            <p className="text-sage-600 max-w-md mx-auto">
              Start monitoring your rice fields' water quality by adding your first paddy field. 
              NADA will analyze frog calls to assess ecosystem health.
            </p>
            <Button 
              className="fairy-button-primary mt-4"
              onClick={onManageFields}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Field
            </Button>
          </div>
        </Card>
      )}

      {/* Field Cards */}
      {allFields.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-sage-800">Your Paddy Fields ({allFields.length})</h2>
            <Button 
              variant="outline" 
              onClick={onManageFields}
              className="border-sage-300 hover:bg-sage-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Fields
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {dashboardData.map((field) => (
              <Card key={field.paddyId} className={`fairy-card border-sage-200/50 p-6 fairy-glow hover:shadow-xl transition-all duration-300 ${
                field.status === 'alert' ? 'bg-gradient-to-br from-dusty-pink-50/50 to-dusty-pink-100/30' :
                field.status === 'warning' ? 'bg-gradient-to-br from-cream-50/50 to-dusty-pink-50/30' :
                'bg-gradient-to-br from-sage-50/50 to-sage-50/30'
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

                  {/* Field Analytics */}
                  {field.analysisCount !== undefined && field.analysisCount > 0 && (
                    <Card className="fairy-card border-sage-200/30 p-3 bg-gradient-to-r from-lavender-50/50 to-cream-50/50">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-sage-600" />
                          <span className="text-sage-600">Analyses Completed:</span>
                        </div>
                        <span className="font-bold text-sage-800">{field.analysisCount}</span>
                      </div>
                    </Card>
                  )}

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

                  {/* Field Notes */}
                  {field.notes && (
                    <Card className="fairy-card border-sage-200/30 p-3 bg-gradient-to-r from-cream-50/50 to-sage-50/50">
                      <p className="text-xs text-sage-700 leading-relaxed">
                        <span className="font-medium">Notes:</span> {field.notes}
                      </p>
                    </Card>
                  )}

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
                    {getActionButton(field)}
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
        </div>
      )}

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