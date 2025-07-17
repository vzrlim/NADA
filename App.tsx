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
  Droplets,
  AlertTriangle,
  CheckCircle,
  Globe,
  Sparkles
} from "lucide-react";

type TabType = 'home' | 'listen' | 'ask' | 'history' | 'alerts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ms'>('en');

  const translations = {
    en: {
      title: "NADA",
      subtitle: "Enchanted Water Quality Monitor",
      description: "Listen to nature's whispers through frog songs",
      tabs: {
        home: "My Gardens",
        listen: "Nature's Voice", 
        ask: "Wise Helper",
        history: "Ancient Records",
        alerts: "Gentle Warnings"
      },
      status: {
        monitoring: "Listening to Nature",
        fields: "Gardens Blooming",
        good: "Harmonious",
        warning: "Needs Attention", 
        alert: "Requires Care"
      },
      quickStats: {
        title: "Nature's Whispers",
        healthy: "Flourishing",
        needCheck: "Gentle Care",
        urgent: "Tender Healing",
        avgSound: "Frog Melodies"
      }
    },
    ms: {
      title: "NADA",
      subtitle: "Pemantau Kualiti Air Ajaib",
      description: "Dengar bisikan alam melalui nyanyian katak",
      tabs: {
        home: "Taman Saya",
        listen: "Suara Alam",
        ask: "Pembantu Bijak", 
        history: "Rekod Purba",
        alerts: "Amaran Lembut"
      },
      status: {
        monitoring: "Mendengar Alam",
        fields: "Taman Berkembang",
        good: "Harmoni",
        warning: "Perlu Perhatian",
        alert: "Memerlukan Rawatan"
      },
      quickStats: {
        title: "Bisikan Alam",
        healthy: "Subur",
        needCheck: "Rawatan Lembut", 
        urgent: "Penyembuhan Mesra",
        avgSound: "Melodi Katak"
      }
    }
  };

  const t = translations[language];

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
        return <Dashboard language={language} />;
      case 'listen':
        return <AudioAnalysis language={language} />;
      case 'ask':
        return <NaturalLanguageQuery language={language} />;
      case 'history':
        return <Analytics language={language} />;
      case 'alerts':
        return <AlertsSystem language={language} />;
      default:
        return <Dashboard language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-sage-50 to-lavender-50">
      {/* Elegant Header with Fairy Core Styling */}
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
                <p className="text-sm text-sage-600 font-medium">{t.subtitle}</p>
                <p className="text-xs text-sage-500 hidden sm:block italic">{t.description}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ms' : 'en')}
              className="flex items-center gap-2 hover:bg-sage-100/50 text-sage-700"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language === 'en' ? 'BM' : 'EN'}</span>
            </Button>
            <Badge className="fairy-accent-good border-sage-300/50 shadow-sm">
              <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse mr-2" />
              <span className="text-sm">{t.status.monitoring}</span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Elegant Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-80 fairy-card border-r border-sage-200/50 transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:block
        `}>
          <div className="p-6 pt-8">
            {/* Elegant Navigation */}
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
          
          {/* Fairy Stats Card */}
          <div className="p-6 border-t border-sage-200/30">
            <Card className="fairy-card border-sage-200/50 fairy-glow">
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sage-600" />
                  <h3 className="text-base font-semibold text-sage-800">{t.quickStats.title}</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-sage-50 to-moss-50">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-sage-600" />
                      <span className="text-sm font-medium text-sage-700">{t.quickStats.healthy}</span>
                    </div>
                    <span className="text-sm font-bold text-sage-700 bg-white/50 px-2 py-1 rounded-full">1</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-cream-50 to-dusty-pink-50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-cream-700" />
                      <span className="text-sm font-medium text-cream-700">{t.quickStats.needCheck}</span>
                    </div>
                    <span className="text-sm font-bold text-cream-700 bg-white/50 px-2 py-1 rounded-full">1</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-dusty-pink-50 to-dusty-pink-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-dusty-pink-700" />
                      <span className="text-sm font-medium text-dusty-pink-700">{t.quickStats.urgent}</span>
                    </div>
                    <span className="text-sm font-bold text-dusty-pink-700 bg-white/50 px-2 py-1 rounded-full">1</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </aside>

        {/* Main Content with Fairy Styling */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6 sm:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Elegant Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-sage-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}