import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertTriangle, CheckCircle, Clock, Bell, Settings, Mail, Phone, MessageSquare, X } from "lucide-react";

interface Alert {
  id: string;
  paddyId: string;
  location: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  severity: 'high' | 'medium' | 'low';
}

interface AlertConfig {
  enabled: boolean;
  threshold: number;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  contacts: {
    email: string;
    phone: string;
  };
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    paddyId: 'ID-001',
    location: 'Java, Indonesia',
    type: 'critical',
    message: 'Frog call activity dropped to 18 calls/min - Water quality requires immediate attention',
    timestamp: '2 minutes ago',
    acknowledged: false,
    severity: 'high'
  },
  {
    id: '2',
    paddyId: 'MY-002',
    location: 'Selangor, Malaysia',
    type: 'warning',
    message: 'Frog call activity declining - Monitor closely (34 calls/min)',
    timestamp: '15 minutes ago',
    acknowledged: false,
    severity: 'medium'
  },
  {
    id: '3',
    paddyId: 'MY-001',
    location: 'Kedah, Malaysia',
    type: 'info',
    message: 'Water quality stable - Frog activity normal (62 calls/min)',
    timestamp: '1 hour ago',
    acknowledged: true,
    severity: 'low'
  }
];

export function AlertsSystem() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    enabled: true,
    threshold: 30,
    channels: {
      email: true,
      sms: true,
      push: true
    },
    contacts: {
      email: 'farmer@example.com',
      phone: '+60123456789'
    }
  });
  const [showSettings, setShowSettings] = useState(false);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical' && !alert.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Alert System</h2>
          <p className="text-sm text-muted-foreground">Real-time notifications and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            {activeAlerts.length} Active
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold text-yellow-600">{activeAlerts.length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">System Status</p>
              <p className="text-2xl font-bold text-green-600">Online</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Alert Settings</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="alert-enabled">Enable Alerts</Label>
                  <Switch 
                    id="alert-enabled"
                    checked={alertConfig.enabled}
                    onCheckedChange={(checked) => 
                      setAlertConfig(prev => ({ ...prev, enabled: checked }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="threshold">Alert Threshold (calls/min)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={alertConfig.threshold}
                    onChange={(e) => 
                      setAlertConfig(prev => ({ ...prev, threshold: parseInt(e.target.value) }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Notification Channels</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">Email</span>
                      </div>
                      <Switch 
                        checked={alertConfig.channels.email}
                        onCheckedChange={(checked) => 
                          setAlertConfig(prev => ({ 
                            ...prev, 
                            channels: { ...prev.channels, email: checked }
                          }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">SMS</span>
                      </div>
                      <Switch 
                        checked={alertConfig.channels.sms}
                        onCheckedChange={(checked) => 
                          setAlertConfig(prev => ({ 
                            ...prev, 
                            channels: { ...prev.channels, sms: checked }
                          }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">Push Notifications</span>
                      </div>
                      <Switch 
                        checked={alertConfig.channels.push}
                        onCheckedChange={(checked) => 
                          setAlertConfig(prev => ({ 
                            ...prev, 
                            channels: { ...prev.channels, push: checked }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={alertConfig.contacts.email}
                    onChange={(e) => 
                      setAlertConfig(prev => ({ 
                        ...prev, 
                        contacts: { ...prev.contacts, email: e.target.value }
                      }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={alertConfig.contacts.phone}
                    onChange={(e) => 
                      setAlertConfig(prev => ({ 
                        ...prev, 
                        contacts: { ...prev.contacts, phone: e.target.value }
                      }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alert-frequency">Alert Frequency</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="5min">Every 5 minutes</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="1hour">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Active Alerts */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Alerts</h3>
          
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.acknowledged ? 'bg-gray-50' : 'bg-white'
                  } ${
                    alert.type === 'critical' ? 'border-l-red-500' :
                    alert.type === 'warning' ? 'border-l-yellow-500' :
                    'border-l-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{alert.paddyId}</span>
                          <Badge className={getAlertColor(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-xs">
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{alert.location}</p>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{alert.timestamp}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(alert.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}