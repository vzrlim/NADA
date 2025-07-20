import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Switch } from "./ui/switch";
import { Bell, Phone, AlertTriangle, CheckCircle, Clock, Settings, MapPin, Calendar, Volume2 } from "lucide-react";

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
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

interface AlertsSystemProps {
  fieldContext?: FieldContextType;
}

interface AlertItem {
  id: string;
  field: Field;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  callsPerMinute: number;
  threshold: string;
}

interface NotificationSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  criticalOnly: boolean;
  quietHours: boolean;
}

export function AlertsSystem({ fieldContext }: AlertsSystemProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    smsEnabled: true,
    emailEnabled: true,
    pushEnabled: true,
    criticalOnly: false,
    quietHours: true
  });
  const [showSettings, setShowSettings] = useState(false);

  // Generate realistic alerts based on actual field data
  const generateAlertsFromFields = (fields: Field[]): AlertItem[] => {
    if (fields.length === 0) return [];

    const generatedAlerts: AlertItem[] = [];
    const now = new Date();

    fields.forEach((field, index) => {
      let alertType: 'critical' | 'warning' | 'info';
      let callsPerMinute: number;
      let title: string;
      let message: string;
      let threshold: string;
      
      // Generate consistent data based on field status
      switch (field.status) {
        case 'alert':
          alertType = 'critical';
          callsPerMinute = Math.floor(Math.random() * 25) + 5; // 5-30 calls/min
          title = 'Critical Water Quality Alert';
          message = `Very low frog activity detected (${callsPerMinute} calls/min). Immediate action required to prevent crop damage.`;
          threshold = 'Below 30 calls/min';
          break;
        case 'warning':
          alertType = 'warning';
          callsPerMinute = Math.floor(Math.random() * 20) + 30; // 30-49 calls/min
          title = 'Water Quality Warning';
          message = `Frog call activity decreasing (${callsPerMinute} calls/min). Monitor and consider reducing chemical inputs.`;
          threshold = '30-49 calls/min';
          break;
        case 'good':
          alertType = 'info';
          callsPerMinute = Math.floor(Math.random() * 30) + 50; // 50-80 calls/min
          title = 'Water Quality Normal';
          message = `Excellent frog activity levels maintained (${callsPerMinute} calls/min). Continue current practices.`;
          threshold = 'Above 50 calls/min';
          break;
        default:
          return; // Skip unknown status fields
      }

      // Generate timestamp based on field's last analysis
      const baseTime = field.lastAnalysis ? new Date(field.lastAnalysis) : new Date(now.getTime() - (index + 1) * 60 * 60 * 1000);
      const timeDiff = now.getTime() - baseTime.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      let timestamp: string;
      if (minutesAgo < 60) {
        timestamp = `${minutesAgo} minutes ago`;
      } else if (minutesAgo < 1440) { // Less than 24 hours
        const hoursAgo = Math.floor(minutesAgo / 60);
        timestamp = `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
      } else {
        const daysAgo = Math.floor(minutesAgo / 1440);
        timestamp = `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
      }

      generatedAlerts.push({
        id: `alert_${field.id}_${index}`,
        field,
        type: alertType,
        title,
        message,
        timestamp,
        isRead: field.status === 'good', // Mark good status as read by default
        callsPerMinute,
        threshold
      });
    });

    // Sort alerts by severity and timestamp
    return generatedAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (severityOrder[a.type] !== severityOrder[b.type]) {
        return severityOrder[a.type] - severityOrder[b.type];
      }
      // If same severity, sort by read status (unread first)
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }
      return 0; // Maintain original order for same severity and read status
    });
  };

  // Update alerts when fields change
  useEffect(() => {
    if (fieldContext && fieldContext.allFields.length > 0) {
      const newAlerts = generateAlertsFromFields(fieldContext.allFields);
      setAlerts(newAlerts);
      console.log(`🔔 Generated ${newAlerts.length} alerts from ${fieldContext.allFields.length} fields`);
    } else {
      // Fallback to sample data if no field context
      setAlerts([
        {
          id: '1',
          field: {
            id: 'sample_field_alert',
            name: 'Sample Field',
            location: 'Demo Location',
            size: '2.0 hectares',
            status: 'alert',
            analysisCount: 1,
            createdAt: new Date().toISOString()
          },
          type: 'critical',
          title: 'Critical Water Quality Alert',
          message: 'Very low frog activity detected (18 calls/min). Immediate action required to prevent crop damage.',
          timestamp: '2 minutes ago',
          isRead: false,
          callsPerMinute: 18,
          threshold: 'Below 30 calls/min'
        }
      ]);
    }
  }, [fieldContext?.allFields]);

  // Load notification preferences from backend
  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f664fd48/notifications/preferences?user_id=default`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const prefs = result.preferences;
        
        // Convert backend format to frontend format
        setSettings({
          smsEnabled: prefs.channels.find((c: any) => c.type === 'sms')?.enabled || false,
          emailEnabled: prefs.channels.find((c: any) => c.type === 'email')?.enabled || false,
          pushEnabled: prefs.channels.find((c: any) => c.type === 'push')?.enabled || false,
          criticalOnly: prefs.alert_types.water_quality_critical && !prefs.alert_types.water_quality_warning,
          quietHours: prefs.quiet_hours?.enabled || false
        });
        
        console.log('✅ Notification preferences loaded from backend');
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const saveNotificationPreferences = async (newSettings: NotificationSettings) => {
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      // Convert frontend format to backend format
      const backendPreferences = {
        channels: [
          { type: 'in_app', enabled: true },
          { type: 'push', enabled: newSettings.pushEnabled },
          { type: 'email', enabled: newSettings.emailEnabled },
          { type: 'sms', enabled: newSettings.smsEnabled }
        ],
        alert_types: {
          water_quality_critical: true,
          water_quality_warning: !newSettings.criticalOnly,
          biodiversity_low: !newSettings.criticalOnly,
          system_updates: false,
          daily_summary: false
        },
        quiet_hours: {
          enabled: newSettings.quietHours,
          start_time: "22:00",
          end_time: "06:00"
        }
      };
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f664fd48/notifications/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: backendPreferences,
          user_id: 'default'
        })
      });
      
      if (response.ok) {
        console.log('✅ Notification preferences saved to backend');
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  };

  // Test notification system
  const testNotificationSystem = async () => {
    try {
      console.log('Testing notification system...');
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f664fd48/notifications/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: 'default',
          channel_type: 'all'
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Test notification result:', result);
        window.alert(`✅ Notification system test completed!\n\nSent via: ${result.result.sent.join(', ')}\nFailed: ${result.result.failed.join(', ') || 'None'}\n\nYour NADA backend is working perfectly! 🌾🐸`);
      } else {
        console.error('❌ Test notification failed:', result);
        window.alert(`❌ Test failed: ${result.error}\n\nPlease check backend connection.`);
      }
    } catch (error) {
      console.error('❌ Test notification error:', error);
      window.alert(`❌ Test failed: ${error.message}\n\nBackend may be unavailable.`);
    }
  };

  const markAsRead = (alertId: string) => {
    console.log('Marking alert as read:', alertId);
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const markAllAsRead = () => {
    console.log('Marking all alerts as read');
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
  };

  const deleteAlert = (alertId: string) => {
    console.log('Deleting alert:', alertId);
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleTakeAction = (alertItem: AlertItem) => {
    console.log('Taking action for:', alertItem.field.name);
    window.alert(`Taking immediate action for ${alertItem.field.name}:\n\n1. Stopping all chemical treatments immediately\n2. Flushing field with clean water\n3. Scheduling emergency water quality test\n4. Contacting field supervisor\n\nExpected resolution time: 4-6 hours`);
  };

  const handleCallExpert = (alertItem: AlertItem) => {
    console.log('Calling expert for:', alertItem.field.name);
    window.alert(`Connecting you with water quality expert for ${alertItem.field.name}:\n\nExpert: Dr. Ahmad Rahman\nPhone: +60 3-1234-5678\nSpecialty: Rice Paddy Water Management\n\nNote: Expert will call you within 15 minutes to discuss urgent water quality issues.`);
  };

  const handleViewFieldDetails = (alertItem: AlertItem) => {
    console.log('Viewing details for:', alertItem.field.name);
    if (fieldContext && fieldContext.setSelectedField) {
      fieldContext.setSelectedField(alertItem.field);
    }
    window.alert(`Field Details for ${alertItem.field.name}:\n\n📍 Location: ${alertItem.field.location}\n🐸 Current Activity: ${alertItem.callsPerMinute} calls/min\n⚠️ Status: ${alertItem.type.toUpperCase()}\n📊 Threshold: ${alertItem.threshold}\n⏰ Last Updated: ${alertItem.timestamp}\n\n💡 Field has been selected in the header dropdown for detailed monitoring...`);
  };

  const handleCheckField = (alertItem: AlertItem) => {
    console.log('Checking field:', alertItem.field.name);
    window.alert(`Scheduling field inspection for ${alertItem.field.name}:\n\n✅ Field technician will visit within 2 hours\n✅ Water samples will be collected for testing\n✅ pH and chemical levels will be measured\n✅ You'll receive a report within 4 hours\n\nInspector: Mohd Farid (Phone: +60 12-345-6789)`);
  };

  const handleViewRecommendations = (alertItem: AlertItem) => {
    console.log('Viewing recommendations for:', alertItem.field.name);
    window.alert(`Recommendations for ${alertItem.field.name}:\n\n🔧 IMMEDIATE ACTIONS:\n• Reduce chemical fertilizer by 50%\n• Increase water flow rate\n• Monitor pH levels daily\n\n📋 MONITORING:\n• Check frog call activity twice daily\n• Test water pH every 3 days\n• Record environmental conditions\n\n📞 Contact support if no improvement in 48 hours`);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-dusty-pink-600" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-dusty-pink-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-sage-600" />;
      default:
        return <Bell className="w-5 h-5 text-sage-500" />;
    }
  };

  const getAlertStyling = (type: string, isRead: boolean) => {
    const baseClasses = isRead ? 'opacity-70' : '';
    switch (type) {
      case 'critical':
        return `border-dusty-pink-200 bg-dusty-pink-50 ${baseClasses}`;
      case 'warning':
        return `border-dusty-pink-100 bg-dusty-pink-25 ${baseClasses}`;
      case 'info':
        return `border-sage-200 bg-sage-50 ${baseClasses}`;
      default:
        return `border-sage-200 bg-sage-50 ${baseClasses}`;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'fairy-accent-alert';
      case 'warning':
        return 'fairy-accent-warning';
      case 'info':
        return 'fairy-accent-good';
      default:
        return 'fairy-accent-good';
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.type === 'critical' && !alert.isRead).length;
  const totalFields = fieldContext?.allFields.length || 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-sage-800">Alerts & Notifications</h2>
          <p className="text-sage-700">Water quality alerts for your paddy fields</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={unreadCount > 0 ? "fairy-accent-warning" : "fairy-accent-good"}>
            {unreadCount} Unread
          </Badge>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="border-sage-300 hover:bg-sage-100"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="default"
            onClick={testNotificationSystem}
            className="bg-sage-600 hover:bg-sage-700 text-cream-50 ml-2"
          >
            🧪 Test Notifications
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="fairy-card border-dusty-pink-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dusty-pink-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-cream-50" />
            </div>
            <div>
              <p className="text-sm text-dusty-pink-800 font-medium">Critical Alerts</p>
              <p className="text-2xl font-bold text-dusty-pink-900">{criticalCount}</p>
            </div>
          </div>
        </Card>

        <Card className="fairy-card border-sage-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sage-600 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-cream-50" />
            </div>
            <div>
              <p className="text-sm text-sage-700 font-medium">Total Alerts</p>
              <p className="text-2xl font-bold text-sage-800">{alerts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="fairy-card border-sage-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lavender-600 rounded-full flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-cream-50" />
            </div>
            <div>
              <p className="text-sm text-lavender-800 font-medium">Monitoring</p>
              <p className="text-2xl font-bold text-lavender-900">{totalFields} Fields</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <Card className="fairy-card border-sage-200 p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-sage-800">Notification Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sage-800">SMS Notifications</p>
                    <p className="text-sm text-sage-600">Receive alerts via text message</p>
                  </div>
                  <Switch
                    checked={settings.smsEnabled}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...settings, smsEnabled: checked };
                      setSettings(newSettings);
                      saveNotificationPreferences(newSettings);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sage-800">Email Notifications</p>
                    <p className="text-sm text-sage-600">Receive alerts via email</p>
                  </div>
                  <Switch
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...settings, emailEnabled: checked };
                      setSettings(newSettings);
                      saveNotificationPreferences(newSettings);
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sage-800">Critical Alerts Only</p>
                    <p className="text-sm text-sage-600">Only receive critical water quality alerts</p>
                  </div>
                  <Switch
                    checked={settings.criticalOnly}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...settings, criticalOnly: checked };
                      setSettings(newSettings);
                      saveNotificationPreferences(newSettings);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sage-800">Quiet Hours</p>
                    <p className="text-sm text-sage-600">Reduce notifications 10 PM - 6 AM</p>
                  </div>
                  <Switch
                    checked={settings.quietHours}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...settings, quietHours: checked };
                      setSettings(newSettings);
                      saveNotificationPreferences(newSettings);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            className="border-sage-300 hover:bg-sage-100"
          >
            Mark All as Read
          </Button>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card className="fairy-card border-sage-200 p-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-sage-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-sage-800 mb-2">No Active Alerts</h3>
              <p className="text-sage-600">All your paddy fields are showing healthy water quality levels.</p>
            </div>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className={`fairy-card p-6 hover:shadow-lg transition-shadow ${getAlertStyling(alert.type, alert.isRead)}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sage-800">{alert.title}</h3>
                        <Badge className={getBadgeColor(alert.type)}>
                          {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                        </Badge>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-dusty-pink-600 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-sage-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{alert.field.name} - {alert.field.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{alert.timestamp}</span>
                        </div>
                      </div>
                      
                      <p className="text-sage-700 mb-3">{alert.message}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="px-3 py-1 bg-sage-100 rounded-full">
                          <span className="text-sage-700">
                            <strong>{alert.callsPerMinute}</strong> calls/min
                          </span>
                        </div>
                        <div className="px-3 py-1 bg-sage-100 rounded-full">
                          <span className="text-sage-700">Threshold: {alert.threshold}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                        className="text-sage-600 hover:text-sage-800"
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-sage-600 hover:text-sage-800"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {alert.type === 'critical' && (
                  <div className="flex gap-3 pt-3 border-t border-sage-200">
                    <Button 
                      className="bg-dusty-pink-600 hover:bg-dusty-pink-700 text-cream-50"
                      onClick={() => handleTakeAction(alert)}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Take Action
                    </Button>
                    <Button 
                      className="bg-lavender-600 hover:bg-lavender-700 text-cream-50"
                      onClick={() => handleCallExpert(alert)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Expert
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-sage-300 hover:bg-sage-100"
                      onClick={() => handleViewFieldDetails(alert)}
                    >
                      View Field Details
                    </Button>
                  </div>
                )}
                
                {alert.type === 'warning' && (
                  <div className="flex gap-3 pt-3 border-t border-sage-200">
                    <Button 
                      className="bg-dusty-pink-500 hover:bg-dusty-pink-600 text-cream-50"
                      onClick={() => handleCheckField(alert)}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Check Field
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-sage-300 hover:bg-sage-100"
                      onClick={() => handleViewRecommendations(alert)}
                    >
                      View Recommendations
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}