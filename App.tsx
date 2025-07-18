import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Dashboard } from "./components/Dashboard";
import { AudioAnalysis } from "./components/AudioAnalysis";
import { NaturalLanguageQuery } from "./components/NaturalLanguageQuery";
import { Analytics } from "./components/Analytics";
import { AlertsSystem } from "./components/AlertsSystem";
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
  Sparkles
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
      history: "History",
      alerts: "Alerts"
    },
    status: {
      monitoring: "Monitoring...",
      fields: "Paddy Field",
      good: "Good",
      warning: "Warning",
      alert: "Critical"
    },
    quickStats: {
      title: "Frog Call Stats",
      healthy: "High Activity",
      needCheck: "Medium Activity",
      urgent: "Low Activity",
      avgSound: "Avg Frog Calls/Min"
    }
  }
};

type TabType = 'home' | 'listen' | 'ask' | 'history' | 'alerts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = translations.en;

  const tabs = [
    { id: 'home', label: t.tabs.home, icon: Home },
    { id: 'listen', label: t.tabs.listen, icon: Mic },
    { id: 'ask', label: t.tabs.ask, icon: MessageSquare },
    { id: 'history', label: t.tabs.history, icon: BarChart3 },
    { id: 'alerts', label: t.tabs.alerts, icon: Bell },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'listen':
        return <AudioAnalysis />;
      case 'ask':
        return <NaturalLanguageQuery />;
      case 'history':
        return <Analytics />;
      case 'alerts':
        return <AlertsSystem />;
      default:
        return <Dashboard />;
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
            <Badge className="fairy-accent-good border-sage-300/50 shadow-sm">
              <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse mr-2" />
              <span className="text-sm">{t.status.monitoring}</span>
            </Badge>
          </div>
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
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    className={`w-full justify-start text-left h-14 px-4 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? "bg-gradient-to-r from-sage-100 to-sage-200 text-sage-800 shadow-md fairy-glow" 
                        : "hover:bg-gradient-to-r hover:from-sage-50 hover:to-lavender-50 text-sage-700 hover:text-sage-800"
                    }`}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="w-5 h-5 mr-4" />
                    <span className="text-base font-medium">{tab.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
          
          {/* Quick Stats Card */}
          <div className="p-6 border-t border-sage-200/30">
            <Card className="fairy-card border-sage-200/50 fairy-glow">
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sage-600" />
                  <h3 className="text-base font-semibold text-sage-800">{t.quickStats.title}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-sage-100 border border-sage-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-sage-700" />
                      <span className="text-sm font-medium text-sage-800">{t.quickStats.healthy}</span>
                    </div>
                    <span className="text-sm font-bold text-cream-50 bg-sage-600 px-2 py-1 rounded-full shadow-sm">1</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-dusty-pink-100 border border-dusty-pink-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-dusty-pink-700" />
                      <span className="text-sm font-medium text-dusty-pink-800">{t.quickStats.needCheck}</span>
                    </div>
                    <span className="text-sm font-bold text-cream-50 bg-dusty-pink-600 px-2 py-1 rounded-full shadow-sm">1</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-dusty-pink-200 border border-dusty-pink-300">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-dusty-pink-800" />
                      <span className="text-sm font-medium text-dusty-pink-900">{t.quickStats.urgent}</span>
                    </div>
                    <span className="text-sm font-bold text-cream-50 bg-dusty-pink-700 px-2 py-1 rounded-full shadow-sm">1</span>
                  </div>
                </div>
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