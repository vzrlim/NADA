import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Dashboard } from "./components/Dashboard";
import { AudioAnalysis } from "./components/AudioAnalysis";
import { NaturalLanguageQuery } from "./components/NaturalLanguageQuery";
import { Analytics } from "./components/Analytics";
import { AlertsSystem } from "./components/AlertsSystem";
import { FieldManagement } from "./components/FieldManagement";
import { 
  Home, 
  Mic, 
  MessageSquare, 
  BarChart3, 
  Bell, 
  Menu,
  X,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  TrendingUp,
  MapPin,
  Settings,
  Plus
} from "lucide-react";

const translations = {
  en: {
    title: "NADA",
    subtitle: "Smart Water Quality Monitor",
    description: "Monitor your paddy fields through frog calls",
    tabs: {
      home: "Dashboard",
      listen: "Record Audio", 
      ask: "Ask AI",
      history: "Analytics",
      alerts: "Alerts"
    },
    fields: {
      selectField: "Select Field",
      allFields: "All Fields",
      noFieldSelected: "No field selected",
      manageFields: "Manage Fields",
      addNewField: "Add New Field"
    },
    status: {
      monitoring: "System Ready",
      analyzing: "Analyzing...",
      fields: "Paddy Field",
      good: "Good",
      warning: "Warning", 
      alert: "Critical"
    },
    quickStats: {
      title: "Field Status",
      healthy: "Good Quality",
      needCheck: "Needs Attention",
      urgent: "Critical",
      avgSound: "Recent Analyses"
    }
  }
};

type TabType = 'home' | 'listen' | 'ask' | 'history' | 'alerts';

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

interface QuickStatsData {
  good: number;
  warning: number;
  alert: number;
  total: number;
  lastAnalysis?: string;
  hasData: boolean;
}

interface FieldContextType {
  selectedField: Field | null;
  allFields: Field[];
  setSelectedField: (field: Field | null) => void;
  onManageFields: () => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [allFields, setAllFields] = useState<Field[]>([]);
  const [showFieldManagement, setShowFieldManagement] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStatsData>({
    good: 0,
    warning: 0,
    alert: 0,
    total: 0,
    hasData: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  
  // Refs to prevent race conditions
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);
  
  const t = translations.en;

  // Simplified field loading without complex data synchronization
  const loadFields = useCallback(async () => {
    if (!mountedRef.current || loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      const { projectId, publicAnonKey } = await import('./utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f664fd48/fields`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const backendFields = data.fields || [];
        
        if (backendFields.length > 0 && mountedRef.current) {
          setAllFields(backendFields);
          // Only set selectedField if none is currently selected
          if (!selectedField) {
            setSelectedField(backendFields[0]);
          }
          setDataInitialized(true);
          console.log('✅ Loaded fields from backend:', backendFields.length);
          return;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load fields from backend, using sample data:', error);
    }

    // Initialize with sample fields if backend fails or has no data
    if (mountedRef.current) {
      const sampleFields: Field[] = [
        {
          id: "field_a",
          name: "Field A",
          location: "North Sector",
          size: "2.5 hectares",
          status: "good",
          lastAnalysis: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          analysisCount: 3,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
        },
        {
          id: "field_b", 
          name: "Field B",
          location: "East Sector",
          size: "1.8 hectares",
          status: "warning",
          lastAnalysis: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          analysisCount: 2,
          notes: "Near the main road, may have runoff issues",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
        },
        {
          id: "field_c",
          name: "Field C",
          location: "South Sector", 
          size: "3.2 hectares",
          status: "alert",
          lastAnalysis: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          analysisCount: 1,
          notes: "New field, still establishing ecosystem",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
        }
      ];
      
      setAllFields(sampleFields);
      // Only set selectedField if none is currently selected
      if (!selectedField) {
        setSelectedField(sampleFields[0]);
      }
      setDataInitialized(true);
      console.log('📝 Initialized with sample fields');
    }
  }, [selectedField]); // Add selectedField as dependency but only to check if it exists

  // Simple refresh function without complex data fetching
  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing field data...');
    await loadFields();
  }, [loadFields]);

  // Generate stable quick stats based on selected field without external API calls
  const generateQuickStats = useCallback((field: Field | null): QuickStatsData => {
    if (!field) {
      return {
        good: 0,
        warning: 0,
        alert: 0,
        total: 0,
        hasData: false
      };
    }

    // Generate consistent stats based on field properties
    const fieldHash = field.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const baseCount = Math.max(1, field.analysisCount || 1);
    
    let good = 0, warning = 0, alert = 0;
    
    switch (field.status) {
      case 'good':
        good = Math.max(1, Math.floor(baseCount * 0.8));
        warning = Math.floor(baseCount * 0.2);
        alert = 0;
        break;
      case 'warning':
        good = Math.floor(baseCount * 0.4);
        warning = Math.max(1, Math.floor(baseCount * 0.6));
        alert = Math.floor(baseCount * 0.1);
        break;
      case 'alert':
        good = 0;
        warning = Math.floor(baseCount * 0.3);
        alert = Math.max(1, Math.floor(baseCount * 0.7));
        break;
      default:
        good = 0;
        warning = 0;
        alert = 0;
    }

    return {
      good,
      warning,
      alert,
      total: good + warning + alert,
      lastAnalysis: field.lastAnalysis,
      hasData: true
    };
  }, []);

  // Initialize app data on mount - simplified
  useEffect(() => {
    mountedRef.current = true;
    loadFields();
    
    return () => {
      mountedRef.current = false;
      loadingRef.current = false;
    };
  }, []); // Remove loadFields from dependencies to prevent loops

  // Update quick stats when selected field changes - no API calls
  useEffect(() => {
    if (dataInitialized && mountedRef.current) {
      const stats = generateQuickStats(selectedField);
      setQuickStats(stats);
      setIsLoading(false);
      loadingRef.current = false;
      
      if (selectedField) {
        console.log(`🎯 Switched to field: ${selectedField.name}`);
      }
    }
  }, [selectedField, dataInitialized, generateQuickStats]);

  // Navigation configuration with proper field requirements
  const tabs = [
    { 
      id: 'home', 
      label: t.tabs.home, 
      icon: Home,
      requiresField: false,
      description: "Overview of all fields"
    },
    { 
      id: 'listen', 
      label: t.tabs.listen, 
      icon: Mic,
      requiresField: true,
      description: "Record frog calls for specific field"
    },
    { 
      id: 'ask', 
      label: t.tabs.ask, 
      icon: MessageSquare,
      requiresField: true,
      description: "Ask AI about specific field"
    },
    { 
      id: 'history', 
      label: t.tabs.history, 
      icon: BarChart3,
      requiresField: false,
      description: "Analytics for all fields"
    },
    { 
      id: 'alerts', 
      label: t.tabs.alerts, 
      icon: Bell,
      requiresField: false,
      description: "System-wide alerts"
    },
  ];

  // Enhanced navigation logic with field validation
  const canAccessTab = useCallback((tabId: TabType) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return false;
    
    if (tab.requiresField) {
      return selectedField !== null && allFields.length > 0;
    }
    return true;
  }, [selectedField, allFields.length, tabs]);

  // Safe tab switching with validation
  const switchToTab = useCallback((tabId: TabType) => {
    if (canAccessTab(tabId)) {
      setActiveTab(tabId);
      setSidebarOpen(false);
    } else {
      // If we can't access the tab, go to dashboard
      setActiveTab('home');
      setSidebarOpen(false);
    }
  }, [canAccessTab]);

  const renderContent = () => {
    // Simplified field context without complex data synchronization
    const fieldContext: FieldContextType = {
      selectedField,
      allFields,
      setSelectedField: (field) => {
        console.log(`🎯 Switching to field: ${field?.name || 'none'}`);
        setSelectedField(field);
        // If switching to a tab that requires a field but no field is selected, go to home
        if (!field && tabs.find(t => t.id === activeTab)?.requiresField) {
          setActiveTab('home');
        }
      },
      onManageFields: () => setShowFieldManagement(true),
      refreshData,
      isLoading: false // Remove loading state to prevent flickering
    };

    const props = { fieldContext };

    switch (activeTab) {
      case 'home':
        return <Dashboard {...props} />;
      case 'listen':
        return canAccessTab('listen') ? <AudioAnalysis {...props} /> : <Dashboard {...props} />;
      case 'ask':
        return canAccessTab('ask') ? <NaturalLanguageQuery {...props} /> : <Dashboard {...props} />;
      case 'history':
        return <Analytics {...props} />;
      case 'alerts':
        return <AlertsSystem {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  // Simplified field change handler without complex logic
  const handleFieldChange = (fieldId: string) => {
    if (fieldId === 'manage') {
      setShowFieldManagement(true);
      return;
    }
    
    const field = allFields.find(f => f.id === fieldId) || null;
    setSelectedField(field);
    
    // If we're on a tab that requires a field but no field is selected, go to dashboard
    if (!field && tabs.find(t => t.id === activeTab)?.requiresField) {
      setActiveTab('home');
    }
  };

  const handleFieldsUpdated = (updatedFields: Field[]) => {
    console.log('🏞️ Fields updated:', updatedFields.length);
    setAllFields(updatedFields);
    
    // Smart field selection logic
    if (updatedFields.length === 0) {
      setSelectedField(null);
      setActiveTab('home');
    } else if (selectedField && !updatedFields.find(f => f.id === selectedField.id)) {
      // If current field was deleted, select first available field
      console.log(`🔄 Selected field ${selectedField.name} was deleted, switching to ${updatedFields[0].name}`);
      setSelectedField(updatedFields[0]);
    } else if (!selectedField && updatedFields.length > 0) {
      // If no field selected but fields exist, select first one
      console.log(`🎯 Auto-selecting first field: ${updatedFields[0].name}`);
      setSelectedField(updatedFields[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-lavender-50">
      {/* Header */}
      <header className="fairy-card border-b border-sage-200/50 px-6 py-4 sticky top-0 z-40 backdrop-blur-md fairy-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden hover:bg-sage-100/50 text-sage-700"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center fairy-glow">
                <Sparkles className="w-6 h-6 text-cream-50" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-sage-700 to-sage-800 bg-clip-text text-transparent">{t.title}</h1>
                <p className="text-sm text-sage-700 font-medium">{t.subtitle}</p>
                <p className="text-xs text-sage-600 hidden sm:block italic">{t.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Field Selector with Management */}
            <div className="hidden sm:flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sage-600" />
              <Select value={selectedField?.id || ""} onValueChange={handleFieldChange}>
                <SelectTrigger className="w-[200px] border-sage-300 bg-cream-50/80 text-sage-800">
                  <SelectValue placeholder={allFields.length === 0 ? t.fields.addNewField : t.fields.selectField}>
                    {selectedField ? (
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedField.status === 'good' ? 'bg-sage-500' : 
                          selectedField.status === 'warning' ? 'bg-dusty-pink-500' : 
                          selectedField.status === 'alert' ? 'bg-dusty-pink-600' :
                          'bg-sage-400'
                        }`} />
                        <span className="font-medium">{selectedField.name}</span>
                      </div>
                    ) : allFields.length === 0 ? t.fields.addNewField : t.fields.selectField}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allFields.length === 0 ? (
                    <SelectItem value="manage" className="text-sage-600">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {t.fields.addNewField}
                      </div>
                    </SelectItem>
                  ) : (
                    <>
                      {allFields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              field.status === 'good' ? 'bg-sage-500' : 
                              field.status === 'warning' ? 'bg-dusty-pink-500' : 
                              field.status === 'alert' ? 'bg-dusty-pink-600' :
                              'bg-sage-400'
                            }`} />
                            <div>
                              <div className="font-medium">{field.name}</div>
                              <div className="text-xs text-sage-600">{field.location} • {field.size}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="manage" className="border-t border-sage-200 mt-1 pt-2">
                        <div className="flex items-center gap-2 text-sage-600">
                          <Settings className="w-4 h-4" />
                          {t.fields.manageFields}
                        </div>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {quickStats.total > 0 && selectedField && (
              <Badge variant="outline" className="border-sage-300 text-sage-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                {quickStats.total} analyses
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile Field Selector */}
        <div className="sm:hidden mt-3">
          <Select value={selectedField?.id || ""} onValueChange={handleFieldChange}>
            <SelectTrigger className="w-full border-sage-300 bg-cream-50/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sage-600" />
                <SelectValue placeholder={allFields.length === 0 ? t.fields.addNewField : t.fields.selectField}>
                  {selectedField ? (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        selectedField.status === 'good' ? 'bg-sage-500' : 
                        selectedField.status === 'warning' ? 'bg-dusty-pink-500' : 
                        selectedField.status === 'alert' ? 'bg-dusty-pink-600' :
                        'bg-sage-400'
                      }`} />
                      <span>{selectedField.name} - {selectedField.location}</span>
                    </div>
                  ) : allFields.length === 0 ? t.fields.addNewField : t.fields.selectField}
                </SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              {allFields.length === 0 ? (
                <SelectItem value="manage">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t.fields.addNewField}
                  </div>
                </SelectItem>
              ) : (
                <>
                  {allFields.map((field) => (
                    <SelectItem key={field.id} value={field.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          field.status === 'good' ? 'bg-sage-500' : 
                          field.status === 'warning' ? 'bg-dusty-pink-500' : 
                          field.status === 'alert' ? 'bg-dusty-pink-600' :
                          'bg-sage-400'
                        }`} />
                        <div>
                          <div className="font-medium">{field.name}</div>
                          <div className="text-xs text-sage-600">{field.location} • {field.size}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value="manage" className="border-t border-sage-200 mt-1 pt-2">
                    <div className="flex items-center gap-2 text-sage-600">
                      <Settings className="w-4 h-4" />
                      {t.fields.manageFields}
                    </div>
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-80 fairy-card border-r border-sage-200/50 transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:block
        `}>
          <div className="p-6 pt-8">
            {/* Navigation */}
            <nav className="space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const needsField = tab.requiresField && (!selectedField || allFields.length === 0);
                
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    disabled={needsField}
                    className={`w-full justify-start text-left h-14 px-4 rounded-xl transition-all duration-200 relative ${
                      isActive 
                        ? "bg-gradient-to-r from-sage-100 to-sage-200 text-sage-800 shadow-md fairy-glow" 
                        : needsField
                        ? "text-sage-500 cursor-not-allowed opacity-60"
                        : "hover:bg-gradient-to-r hover:from-sage-50 hover:to-lavender-50 text-sage-700 hover:text-sage-800"
                    }`}
                    onClick={() => switchToTab(tab.id as TabType)}
                  >
                    <Icon className="w-5 h-5 mr-4" />
                    <div className="flex-1 text-left">
                      <span className="text-base font-medium">{tab.label}</span>
                      {needsField && (
                        <div className="text-xs text-sage-500 mt-0.5">
                          {allFields.length === 0 ? "Add fields first" : "Select field first"}
                        </div>
                      )}
                    </div>
                  </Button>
                );
              })}
            </nav>
          </div>
          
          {/* Dynamic Quick Stats Card - Field Specific */}
          <div className="p-6 border-t border-sage-200/30">
            <Card className="fairy-card border-sage-200/50 fairy-glow">
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sage-600" />
                  <h3 className="text-base font-semibold text-sage-800">
                    {selectedField ? `${selectedField.name} Status` : t.quickStats.title}
                  </h3>
                </div>
                
                {allFields.length === 0 ? (
                  <div className="text-center py-4">
                    <Plus className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                    <p className="text-sm text-sage-600 mb-2">No paddy fields added</p>
                    <p className="text-xs text-sage-500">Add your first field to start monitoring</p>
                  </div>
                ) : !selectedField ? (
                  <div className="text-center py-4">
                    <MapPin className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                    <p className="text-sm text-sage-600 mb-2">{t.fields.noFieldSelected}</p>
                    <p className="text-xs text-sage-500">Select a field to view its status</p>
                  </div>
                ) : !quickStats.hasData ? (
                  <div className="text-center py-4">
                    <Sparkles className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                    <p className="text-sm text-sage-600 mb-2">{selectedField.name}</p>
                    <p className="text-xs text-sage-500">Ready for monitoring</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quickStats.good > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-sage-100 border border-sage-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-sage-700" />
                          <span className="text-sm font-medium text-sage-800">{t.quickStats.healthy}</span>
                        </div>
                        <span className="text-sm font-bold text-cream-50 bg-sage-600 px-2 py-1 rounded-full shadow-sm">{quickStats.good}</span>
                      </div>
                    )}
                    
                    {quickStats.warning > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dusty-pink-100 border border-dusty-pink-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-dusty-pink-700" />
                          <span className="text-sm font-medium text-dusty-pink-800">{t.quickStats.needCheck}</span>
                        </div>
                        <span className="text-sm font-bold text-cream-50 bg-dusty-pink-600 px-2 py-1 rounded-full shadow-sm">{quickStats.warning}</span>
                      </div>
                    )}
                    
                    {quickStats.alert > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dusty-pink-200 border border-dusty-pink-300">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-dusty-pink-800" />
                          <span className="text-sm font-medium text-dusty-pink-900">{t.quickStats.urgent}</span>
                        </div>
                        <span className="text-sm font-bold text-cream-50 bg-dusty-pink-700 px-2 py-1 rounded-full shadow-sm">{quickStats.alert}</span>
                      </div>
                    )}
                    
                    {quickStats.good === 0 && quickStats.warning === 0 && quickStats.alert === 0 && quickStats.total > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-sage-100 border border-sage-200">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-sage-700" />
                          <span className="text-sm font-medium text-sage-800">{t.quickStats.avgSound}</span>
                        </div>
                        <span className="text-sm font-bold text-cream-50 bg-sage-600 px-2 py-1 rounded-full shadow-sm">{quickStats.total}</span>
                      </div>
                    )}
                    
                    {selectedField && (
                      <div className="text-xs text-sage-600 space-y-1 pt-2 border-t border-sage-200">
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="font-medium">{selectedField.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span className="font-medium">{selectedField.size}</span>
                        </div>
                        {quickStats.lastAnalysis && (
                          <div className="flex justify-between">
                            <span>Last update:</span>
                            <span className="font-medium">{new Date(quickStats.lastAnalysis).toLocaleTimeString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6 sm:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Field Management Modal */}
      <FieldManagement
        isOpen={showFieldManagement}
        onClose={() => setShowFieldManagement(false)}
        allFields={allFields}
        onFieldsUpdated={handleFieldsUpdated}
        selectedField={selectedField}
        onFieldSelected={setSelectedField}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-sage-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}