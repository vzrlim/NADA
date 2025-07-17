import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, CheckCircle, Clock, Droplets, Volume2, MapPin, Phone, MessageSquare, Wrench, Sparkles, Leaf, Heart } from "lucide-react";

interface WaterQualityData {
  paddyId: string;
  location: string;
  locationMs: string;
  callsPerMinute: number;
  status: 'good' | 'warning' | 'alert';
  statusText: { en: string; ms: string };
  lastUpdated: string;
  temperature: number;
  humidity: number;
  ph: number;
  recommendation: { en: string; ms: string };
  urgency: 'low' | 'medium' | 'high';
}

const mockData: WaterQualityData[] = [
  {
    paddyId: "Moonlit Garden",
    location: "Kedah Valley, Malaysia",
    locationMs: "Lembah Kedah, Malaysia",
    callsPerMinute: 62,
    status: 'good',
    statusText: { en: "Harmonious Waters ✨", ms: "Air Harmoni ✨" },
    lastUpdated: "2 minutes ago",
    temperature: 28.5,
    humidity: 85,
    ph: 7.2,
    recommendation: { 
      en: "Your garden sings with life! The frogs are dancing with joy in your pristine waters.", 
      ms: "Taman anda menyanyi dengan kehidupan! Katak menari gembira dalam air yang jernih." 
    },
    urgency: 'low'
  },
  {
    paddyId: "Whispering Fields", 
    location: "Selangor Hills, Malaysia",
    locationMs: "Bukit Selangor, Malaysia",
    callsPerMinute: 34,
    status: 'warning',
    statusText: { en: "Gentle Concern 🌸", ms: "Kebimbangan Lembut 🌸" },
    lastUpdated: "5 minutes ago",
    temperature: 29.1,
    humidity: 82,
    ph: 7.8,
    recommendation: { 
      en: "Your waters whisper for gentler care. Perhaps less earthly chemicals, more nature's embrace.", 
      ms: "Air anda berbisik meminta rawatan yang lebih lembut. Mungkin kurang bahan kimia, lebih pelukan alam." 
    },
    urgency: 'medium'
  },
  {
    paddyId: "Silent Grove",
    location: "Perak Highlands, Malaysia", 
    locationMs: "Tanah Tinggi Perak, Malaysia",
    callsPerMinute: 18,
    status: 'alert',
    statusText: { en: "Needs Tender Healing 🌿", ms: "Perlu Penyembuhan Mesra 🌿" },
    lastUpdated: "1 minute ago",
    temperature: 31.2,
    humidity: 78,
    ph: 8.3,
    recommendation: { 
      en: "The ancient spirits call for immediate care. Stop all harsh treatments and let pure waters flow through your garden.", 
      ms: "Roh purba memanggil rawatan segera. Hentikan semua rawatan kasar dan biarkan air suci mengalir melalui taman anda." 
    },
    urgency: 'high'
  }
];

interface DashboardProps {
  language: 'en' | 'ms';
}

export function Dashboard({ language }: DashboardProps) {
  const translations = {
    en: {
      title: "Enchanted Gardens",
      subtitle: "Where nature's voice guides your harvest",
      totalFields: "Sacred Groves",
      healthyFields: "Blooming Gardens", 
      needAttention: "Gentle Tending",
      urgent: "Healing Needed",
      frogSongs: "Frog Melodies",
      perMinute: "/minute",
      lastChecked: "Last whispered",
      whatToDo: "Nature's guidance:",
      callExpert: "Summon Wise One",
      getHelp: "Seek Wisdom",
      healNow: "Begin Healing",
      tendGently: "Tend Gently",
      keepFlourishing: "Keep Flourishing",
      temperature: "Warmth",
      humidity: "Moisture",
      acidity: "Essence",
      gardenWisdom: "Garden Wisdom",
      wisdomText: "Our ancient keepers of water wisdom are here to guide your journey to harmony."
    },
    ms: {
      title: "Taman Ajaib",
      subtitle: "Di mana suara alam membimbing tuaian anda",
      totalFields: "Hutan Suci",
      healthyFields: "Taman Berbunga",
      needAttention: "Rawatan Lembut", 
      urgent: "Penyembuhan Diperlukan",
      frogSongs: "Melodi Katak",
      perMinute: "/minit",
      lastChecked: "Terakhir berbisik",
      whatToDo: "Bimbingan alam:",
      callExpert: "Panggil Yang Bijak",
      getHelp: "Cari Kebijaksanaan",
      healNow: "Mula Penyembuhan",
      tendGently: "Rawat Dengan Lembut",
      keepFlourishing: "Terus Subur",
      temperature: "Kehangatan",
      humidity: "Kelembapan",
      acidity: "Intipati",
      gardenWisdom: "Kebijaksanaan Taman",
      wisdomText: "Penjaga purba kebijaksanaan air kami di sini untuk membimbing perjalanan anda ke harmoni."
    }
  };

  const t = translations[language];

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
      case 'good': return <Leaf className="w-5 h-5 text-sage-600" />;
      case 'warning': return <Heart className="w-5 h-5 text-cream-700" />;
      case 'alert': return <Sparkles className="w-5 h-5 text-dusty-pink-600" />;
      default: return <Leaf className="w-5 h-5 text-sage-600" />;
    }
  };

  const getActionButton = (status: string, urgency: string) => {
    if (status === 'alert') {
      return (
        <Button className="w-full bg-gradient-to-r from-dusty-pink-400 to-dusty-pink-500 hover:from-dusty-pink-500 hover:to-dusty-pink-600 text-cream-50 shadow-lg transition-all duration-200">
          <Sparkles className="w-4 h-4 mr-2" />
          {t.healNow}
        </Button>
      );
    }
    if (status === 'warning') {
      return (
        <Button className="w-full bg-gradient-to-r from-cream-200 to-dusty-pink-200 hover:from-cream-300 hover:to-dusty-pink-300 text-sage-800 border border-cream-300/50 shadow-md transition-all duration-200">
          <Heart className="w-4 h-4 mr-2" />
          {t.tendGently}
        </Button>
      );
    }
    return (
      <Button className="w-full bg-gradient-to-r from-sage-200 to-moss-200 hover:from-sage-300 hover:to-moss-300 text-sage-800 border border-sage-300/50 shadow-md transition-all duration-200">
        <Leaf className="w-4 h-4 mr-2" />
        {t.keepFlourishing}
      </Button>
    );
  };

  const totalFields = mockData.length;
  const healthyFields = mockData.filter(p => p.status === 'good').length;
  const warningFields = mockData.filter(p => p.status === 'warning').length;
  const alertFields = mockData.filter(p => p.status === 'alert').length;

  return (
    <div className="space-y-8">
      {/* Enchanted Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Sparkles className="w-8 h-8 text-sage-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sage-700 to-sage-800 bg-clip-text text-transparent">{t.title}</h1>
          <Sparkles className="w-8 h-8 text-sage-600" />
        </div>
        <p className="text-sage-600 text-lg italic">{t.subtitle}</p>
      </div>

      {/* Fairy Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="fairy-card border-sage-200/50 p-6 fairy-glow hover:shadow-lg transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sage-300 to-sage-400 rounded-full mx-auto flex items-center justify-center">
              <Droplets className="w-6 h-6 text-cream-50" />
            </div>
            <p className="text-sm text-sage-600 font-medium">{t.totalFields}</p>
            <p className="text-3xl font-bold text-sage-700">{totalFields}</p>
          </div>
        </Card>
        
        <Card className="fairy-card border-sage-200/50 p-6 fairy-glow hover:shadow-lg transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sage-400 to-moss-400 rounded-full mx-auto flex items-center justify-center">
              <Leaf className="w-6 h-6 text-cream-50" />
            </div>
            <p className="text-sm text-sage-600 font-medium">{t.healthyFields}</p>
            <p className="text-3xl font-bold text-sage-700">{healthyFields}</p>
          </div>
        </Card>
        
        <Card className="fairy-card border-cream-200/50 p-6 fairy-glow hover:shadow-lg transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cream-400 to-dusty-pink-300 rounded-full mx-auto flex items-center justify-center">
              <Heart className="w-6 h-6 text-cream-50" />
            </div>
            <p className="text-sm text-cream-700 font-medium">{t.needAttention}</p>
            <p className="text-3xl font-bold text-cream-700">{warningFields}</p>
          </div>
        </Card>
        
        <Card className="fairy-card border-dusty-pink-200/50 p-6 fairy-glow hover:shadow-lg transition-all duration-300">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-gradient-to-br from-dusty-pink-400 to-dusty-pink-500 rounded-full mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cream-50" />
            </div>
            <p className="text-sm text-dusty-pink-700 font-medium">{t.urgent}</p>
            <p className="text-3xl font-bold text-dusty-pink-700">{alertFields}</p>
          </div>
        </Card>
      </div>

      {/* Enchanted Garden Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {mockData.map((garden) => (
          <Card key={garden.paddyId} className={`fairy-card border-sage-200/50 p-6 fairy-glow hover:shadow-xl transition-all duration-300 ${
            garden.status === 'alert' ? 'bg-gradient-to-br from-dusty-pink-50/50 to-dusty-pink-100/30' :
            garden.status === 'warning' ? 'bg-gradient-to-br from-cream-50/50 to-dusty-pink-50/30' :
            'bg-gradient-to-br from-sage-50/50 to-moss-50/30'
          }`}>
            <div className="space-y-5">
              {/* Garden Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-sage-500" />
                  <div>
                    <h3 className="font-bold text-xl text-sage-800">{garden.paddyId}</h3>
                    <p className="text-sm text-sage-600">{language === 'ms' ? garden.locationMs : garden.location}</p>
                  </div>
                </div>
                <Badge className={`${getStatusStyling(garden.status)} shadow-sm`}>
                  {garden.statusText[language]}
                </Badge>
              </div>
              
              <p className="text-xs text-sage-500 italic">{t.lastChecked} {garden.lastUpdated}</p>

              {/* Melodic Sound Level */}
              <Card className="fairy-card border-sage-200/30 p-4 bg-gradient-to-r from-cream-50/50 to-sage-50/50">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Volume2 className="w-5 h-5 text-sage-600" />
                    <span className="text-sm font-medium text-sage-700">{t.frogSongs}</span>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-sage-600 to-sage-700 bg-clip-text text-transparent">
                    {garden.callsPerMinute}
                    <span className="text-sm text-sage-500 font-normal">{t.perMinute}</span>
                  </div>
                </div>
              </Card>

              {/* Environmental Harmony */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 fairy-card border-sage-200/30 rounded-lg">
                  <span className="text-xs text-sage-600 block font-medium">{t.temperature}</span>
                  <span className="font-bold text-sage-700">{garden.temperature}°C</span>
                </div>
                <div className="text-center p-3 fairy-card border-sage-200/30 rounded-lg">
                  <span className="text-xs text-sage-600 block font-medium">{t.humidity}</span>
                  <span className="font-bold text-sage-700">{garden.humidity}%</span>
                </div>
                <div className="text-center p-3 fairy-card border-sage-200/30 rounded-lg">
                  <span className="text-xs text-sage-600 block font-medium">{t.acidity}</span>
                  <span className="font-bold text-sage-700">{garden.ph}</span>
                </div>
              </div>

              {/* Nature's Wisdom */}
              <Card className="fairy-card border-sage-200/30 p-4 bg-gradient-to-br from-lavender-50/30 to-cream-50/30">
                <div className="flex items-start gap-2">
                  {getStatusIcon(garden.status)}
                  <div>
                    <p className="text-sm font-medium text-sage-700 mb-1">{t.whatToDo}</p>
                    <p className="text-sm text-sage-600 italic leading-relaxed">{garden.recommendation[language]}</p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {getActionButton(garden.status, garden.urgency)}
                {garden.status === 'alert' && (
                  <Button className="w-full bg-gradient-to-r from-lavender-200 to-dusty-pink-200 hover:from-lavender-300 hover:to-dusty-pink-300 text-sage-800 border border-lavender-300/50 shadow-md transition-all duration-200">
                    <Phone className="w-4 h-4 mr-2" />
                    {t.callExpert}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Wisdom Card */}
      <Card className="fairy-card border-sage-200/50 p-8 fairy-glow bg-gradient-to-br from-lavender-50/30 to-sage-50/30">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-sage-400 to-sage-600 rounded-full flex items-center justify-center fairy-glow">
            <MessageSquare className="w-8 h-8 text-cream-50" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-sage-800 mb-2">
              {t.gardenWisdom}
            </h3>
            <p className="text-sage-600 italic leading-relaxed">
              {t.wisdomText}
            </p>
          </div>
          <Button className="fairy-button-primary shadow-lg">
            {t.getHelp}
          </Button>
        </div>
      </Card>
    </div>
  );
}