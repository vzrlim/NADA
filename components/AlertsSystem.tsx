import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Switch } from "./ui/switch";
import { Bell, Phone, AlertTriangle, CheckCircle, Clock, Settings, MapPin, Calendar, Volume2 } from "lucide-react";

interface AlertItem {
  id: string;
  paddyId: string;
  location: string;
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

export function AlertsSystem() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      paddyId: 'Field C',
      location: 'Perak Highlands, Malaysia',
      type: 'critical',
      title: 'Critical Water Quality Alert',
      message: 'Very low frog activity detected (18 calls/min). Immediate action required to prevent crop damage.',
      timestamp: '2 minutes ago',
      isRead: false,
      callsPerMinute: 18,
      threshold: 'Below 30 calls/min'
    },
    {
      id: '2',
      paddyId: 'Field B',
      location: 'Selangor Hills, Malaysia',
      type: 'warning',
      title: 'Water Quality Warning',
      message: 'Frog call activity decreasing (34 calls/min). Monitor and consider reducing chemical inputs.',
      timestamp: '15 minutes ago',
      isRead: false,
      callsPerMinute: 34,
      threshold: '30-49 calls/min'
    },
    {
      id: '3',
      paddyId: 'Field A',
      location: 'Kedah Valley, Malaysia',
      type: 'info',
      title: 'Water Quality Normal',
      message: 'Excellent frog activity levels maintained (62 calls/min). Continue current practices.',
      timestamp: '1 hour ago',
      isRead: true,
      callsPerMinute: 62,
      threshold: 'Above 50 calls/min'
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    smsEnabled: true,
    emailEnabled: true,
    pushEnabled: true,
    criticalOnly: false,
    quietHours: true
  });

  const [showSettings, setShowSettings] = useState(false);

  // Simple test function to verify button clicks work
  const testButtonClick = (buttonName: string) => {
    console.log(`Button clicked: ${buttonName}`);
    window.alert(`✅ ${buttonName} button is working!`);
  };

  const markAsRead = (alertId: string) => {
    try {
      console.log('Marking alert as read:', alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      console.log('Marking all alerts as read');
      setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  const deleteAlert = (alertId: string) => {
    try {
      console.log('Deleting alert:', alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error in deleteAlert:', error);
    }
  };

  const handleTakeAction = (alertItem: AlertItem) => {
    try {
      console.log('Taking action for:', alertItem.paddyId);
      window.alert(`Taking immediate action for ${alertItem.paddyId}:\n\n1. Stopping all chemical treatments immediately\n2. Flushing field with clean water\n3. Scheduling emergency water quality test\n4. Contacting field supervisor\n\nExpected resolution time: 4-6 hours`);
    } catch (error) {
      console.error('Error in handleTakeAction:', error);
      window.alert('Action initiated successfully!');
    }
  };

  const handleCallExpert = (alertItem: AlertItem) => {
    try {
      console.log('Calling expert for:', alertItem.paddyId);
      window.alert(`Connecting you with water quality expert for ${alertItem.paddyId}:\n\nExpert: Dr. Ahmad Rahman\nPhone: +60 3-1234-5678\nSpecialty: Rice Paddy Water Management\n\nNote: Expert will call you within 15 minutes to discuss urgent water quality issues.`);
    } catch (error) {
      console.error('Error in handleCallExpert:', error);
      window.alert('Connecting with expert...');
    }
  };

  const handleViewFieldDetails = (alertItem: AlertItem) => {
    try {
      console.log('Viewing details for:', alertItem.paddyId);
      window.alert(`Field Details for ${alertItem.paddyId}:\n\n📍 Location: ${alertItem.location}\n🐸 Current Activity: ${alertItem.callsPerMinute} calls/min\n⚠️ Status: ${alertItem.type.toUpperCase()}\n📊 Threshold: ${alertItem.threshold}\n⏰ Last Updated: ${alertItem.timestamp}\n\n💡 Opening detailed field monitoring dashboard...`);
    } catch (error) {
      console.error('Error in handleViewFieldDetails:', error);
      window.alert('Opening field details...');
    }
  };

  const handleCheckField = (alertItem: AlertItem) => {
    try {
      console.log('Checking field:', alertItem.paddyId);
      window.alert(`Scheduling field inspection for ${alertItem.paddyId}:\n\n✅ Field technician will visit within 2 hours\n✅ Water samples will be collected for testing\n✅ pH and chemical levels will be measured\n✅ You'll receive a report within 4 hours\n\nInspector: Mohd Farid (Phone: +60 12-345-6789)`);
    } catch (error) {
      console.error('Error in handleCheckField:', error);
      window.alert('Field inspection scheduled!');
    }
  };

  const handleViewRecommendations = (alertItem: AlertItem) => {
    try {
      console.log('Viewing recommendations for:', alertItem.paddyId);
      window.alert(`Recommendations for ${alertItem.paddyId}:\n\n🔧 IMMEDIATE ACTIONS:\n• Reduce chemical fertilizer by 50%\n• Increase water flow rate\n• Monitor pH levels daily\n\n📋 MONITORING:\n• Check frog call activity twice daily\n• Test water pH every 3 days\n• Record environmental conditions\n\n📞 Contact support if no improvement in 48 hours`);
    } catch (error) {
      console.error('Error in handleViewRecommendations:', error);
      window.alert('Loading recommendations...');
    }
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
            onClick={() => {
              console.log('Settings button clicked, current state:', showSettings);
              setShowSettings(!showSettings);
            }}
            className="border-sage-300 hover:bg-sage-100"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="default"
            onClick={() => testButtonClick('Test')}
            className="bg-sage-600 hover:bg-sage-700 text-cream-50 ml-2"
          >
            🧪 Test Button
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
              <p className="text-2xl font-bold text-lavender-900">3 Fields</p>
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
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsEnabled: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sage-800">Email Notifications</p>
                    <p className="text-sm text-sage-600">Receive alerts via email</p>
                  </div>
                  <Switch
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
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
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, criticalOnly: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sage-800">Quiet Hours</p>
                    <p className="text-sm text-sage-600">Reduce notifications 10 PM - 6 AM</p>
                  </div>
                  <Switch
                    checked={settings.quietHours}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, quietHours: checked }))}
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
                          <span>{alert.paddyId} - {alert.location}</span>
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