import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Send, MessageCircle, Bot, User, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface NaturalLanguageQueryProps {
  language: 'en' | 'ms';
}

export function NaturalLanguageQuery({ language }: NaturalLanguageQueryProps) {
  const translations = {
    en: {
      title: "Ask Your Farm Helper",
      subtitle: "Ask anything about your rice fields in simple words",
      placeholder: "Type your question here... (e.g., 'Why is my water bad?')",
      send: "Send",
      listening: "I'm here to help!",
      suggestions: [
        "Why is my water quality bad?",
        "What should I do about low frog sounds?",
        "How to make my rice field healthier?",
        "When should I check my water?"
      ],
      welcome: "Hello! I'm your farm helper. I can help you understand your rice field and water quality. Just ask me anything in simple words - like talking to a friend! 😊",
      typing: "Helper is typing..."
    },
    ms: {
      title: "Tanya Pembantu Ladang",
      subtitle: "Tanya apa saja tentang sawah anda dengan kata mudah",
      placeholder: "Taip soalan anda di sini... (contoh: 'Kenapa air saya tidak baik?')",
      send: "Hantar",
      listening: "Saya sedia membantu!",
      suggestions: [
        "Kenapa kualiti air saya tidak baik?",
        "Apa yang perlu saya buat kalau bunyi katak kurang?",
        "Bagaimana nak buat sawah lebih sihat?",
        "Bila saya perlu periksa air?"
      ],
      welcome: "Hai! Saya pembantu ladang anda. Saya boleh bantu anda faham tentang sawah dan kualiti air. Tanya saja apa-apa dalam bahasa mudah - macam cakap dengan kawan! 😊",
      typing: "Pembantu sedang menaip..."
    }
  };

  const t = translations[language];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: t.welcome,
      timestamp: new Date().toLocaleTimeString(),
      suggestions: t.suggestions
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(content, language);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString(),
        suggestions: response.suggestions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateResponse = (query: string, lang: 'en' | 'ms'): { content: string; suggestions?: string[] } => {
    const lowerQuery = query.toLowerCase();

    if (lang === 'en') {
      if (lowerQuery.includes('bad') || lowerQuery.includes('poor') || lowerQuery.includes('problem')) {
        return {
          content: "I see you're worried about your water quality! 😟 Here's what might be wrong:\n\n🚨 **Most Common Problems:**\n• Too much pesticide or fertilizer\n• pH too high (above 8.0)\n• Not enough water flow\n• Hot weather\n\n✅ **What You Can Do:**\n• Stop using chemicals for 1 week\n• Add fresh water to your field\n• Check water pH with test strips\n• Wait for cooler weather\n\n📞 **Call an expert if frogs don't come back in 3 days!**",
          suggestions: [
            "How to test water pH?",
            "What chemicals should I stop using?",
            "How much fresh water to add?",
            "Where to buy test strips?"
          ]
        };
      }

      if (lowerQuery.includes('frog') || lowerQuery.includes('sound') || lowerQuery.includes('low')) {
        return {
          content: "Low frog sounds mean they don't like your water! 🐸 Here's why:\n\n🤔 **Why Frogs Are Quiet:**\n• Water is too dirty\n• Chemicals scare them away\n• Water too hot (above 30°C)\n• No food for them\n\n🛠️ **Easy Fixes:**\n• Stop spraying pesticides\n• Add shade to your field\n• Let water flow slowly\n• Don't disturb them at night\n\n🌟 **Good News:** Frogs will come back when water is clean!",
          suggestions: [
            "How to add shade to field?",
            "What time do frogs sing most?",
            "How to improve water flow?",
            "Best temperature for frogs?"
          ]
        };
      }

      if (lowerQuery.includes('healthy') || lowerQuery.includes('better') || lowerQuery.includes('improve')) {
        return {
          content: "Great question! Let's make your rice field super healthy! 🌾✨\n\n🌱 **Easy Steps:**\n1. **Use less chemicals** - Try organic methods\n2. **Keep water moving** - Don't let it sit still\n3. **Test water monthly** - Use pH strips\n4. **Listen to frogs** - They tell you everything!\n\n🔄 **Monthly Routine:**\n• Week 1: Check water and add fresh if needed\n• Week 2: Test pH level\n• Week 3: Count frog sounds\n• Week 4: Plan next month\n\n🏆 **Result:** Happy frogs = Healthy rice = Better harvest!",
          suggestions: [
            "What organic methods work best?",
            "How often to change water?",
            "Normal pH level for rice?",
            "Best harvest time?"
          ]
        };
      }

      if (lowerQuery.includes('when') || lowerQuery.includes('time') || lowerQuery.includes('check')) {
        return {
          content: "Good timing is very important! ⏰ Here's when to check:\n\n📅 **Daily (Morning):**\n• Look at water color\n• Listen for frog sounds\n• Check if water is flowing\n\n📅 **Weekly:**\n• Test water pH\n• Count frog sounds properly\n• Check for sick plants\n\n📅 **Monthly:**\n• Deep water quality test\n• Plan chemical use\n• Check overall field health\n\n🚨 **Emergency Check:** If frogs suddenly stop singing!",
          suggestions: [
            "What color should water be?",
            "How many frog sounds is normal?",
            "Signs of sick rice plants?",
            "Emergency contact number?"
          ]
        };
      }

      return {
        content: "I'm here to help with your rice field! 🌾 I can answer questions about:\n\n• **Water quality** - Is it good or bad?\n• **Frog sounds** - What they mean\n• **Field problems** - How to fix them\n• **Best practices** - Keep your rice healthy\n• **When to check** - Timing is important\n\nJust ask me anything! Use simple words like you're talking to a friend. 😊",
        suggestions: [
          "Is my water quality good?",
          "Why are frogs not singing?",
          "How to fix water problems?",
          "Best time to check fields?"
        ]
      };
    } else { // Bahasa Malaysia
      if (lowerQuery.includes('tidak baik') || lowerQuery.includes('bermasalah') || lowerQuery.includes('rosak')) {
        return {
          content: "Saya nampak anda risau tentang kualiti air! 😟 Ini yang mungkin salah:\n\n🚨 **Masalah Biasa:**\n• Terlalu banyak pestisid atau baja\n• pH terlalu tinggi (atas 8.0)\n• Air tidak mengalir\n• Cuaca terlalu panas\n\n✅ **Apa Yang Boleh Buat:**\n• Berhenti guna bahan kimia selama 1 minggu\n• Tambah air bersih ke sawah\n• Periksa pH air dengan jalur ujian\n• Tunggu cuaca sejuk\n\n📞 **Hubungi pakar kalau katak tak balik dalam 3 hari!**",
          suggestions: [
            "Bagaimana nak test pH air?",
            "Bahan kimia mana yang perlu berhenti?",
            "Berapa banyak air bersih nak tambah?",
            "Mana nak beli jalur ujian?"
          ]
        };
      }

      if (lowerQuery.includes('katak') || lowerQuery.includes('bunyi') || lowerQuery.includes('kurang')) {
        return {
          content: "Bunyi katak kurang bermakna mereka tak suka air anda! 🐸 Ini sebabnya:\n\n🤔 **Kenapa Katak Senyap:**\n• Air terlalu kotor\n• Bahan kimia menakutkan mereka\n• Air terlalu panas (atas 30°C)\n• Tak ada makanan untuk mereka\n\n🛠️ **Cara Mudah Perbaiki:**\n• Berhenti sembur racun\n• Tambah teduhan ke sawah\n• Biarkan air mengalir perlahan\n• Jangan ganggu mereka waktu malam\n\n🌟 **Berita Baik:** Katak akan balik bila air bersih!",
          suggestions: [
            "Bagaimana tambah teduhan ke sawah?",
            "Bila masa katak menyanyi paling banyak?",
            "Cara tingkatkan aliran air?",
            "Suhu terbaik untuk katak?"
          ]
        };
      }

      if (lowerQuery.includes('sihat') || lowerQuery.includes('baik') || lowerQuery.includes('tingkatkan')) {
        return {
          content: "Soalan bagus! Mari buat sawah anda super sihat! 🌾✨\n\n🌱 **Langkah Mudah:**\n1. **Kurangkan bahan kimia** - Cuba kaedah organik\n2. **Biarkan air bergerak** - Jangan biar bergenang\n3. **Test air setiap bulan** - Guna jalur pH\n4. **Dengar bunyi katak** - Mereka beritahu semua!\n\n🔄 **Rutin Bulanan:**\n• Minggu 1: Periksa air dan tambah air bersih jika perlu\n• Minggu 2: Test tahap pH\n• Minggu 3: Kira bunyi katak\n• Minggu 4: Rancang bulan depan\n\n🏆 **Hasil:** Katak gembira = Padi sihat = Hasil lebih baik!",
          suggestions: [
            "Kaedah organik mana yang terbaik?",
            "Berapa kerap tukar air?",
            "Tahap pH normal untuk padi?",
            "Masa terbaik untuk menuai?"
          ]
        };
      }

      if (lowerQuery.includes('bila') || lowerQuery.includes('masa') || lowerQuery.includes('periksa')) {
        return {
          content: "Masa yang betul sangat penting! ⏰ Ini bila nak periksa:\n\n📅 **Setiap Hari (Pagi):**\n• Tengok warna air\n• Dengar bunyi katak\n• Periksa kalau air mengalir\n\n📅 **Setiap Minggu:**\n• Test pH air\n• Kira bunyi katak betul-betul\n• Periksa pokok padi sakit\n\n📅 **Setiap Bulan:**\n• Test kualiti air mendalam\n• Rancang penggunaan bahan kimia\n• Periksa kesihatan sawah keseluruhan\n\n🚨 **Periksa Kecemasan:** Kalau katak tiba-tiba berhenti menyanyi!",
          suggestions: [
            "Warna air yang normal macam mana?",
            "Berapa banyak bunyi katak yang normal?",
            "Tanda-tanda pokok padi sakit?",
            "Nombor telefon kecemasan?"
          ]
        };
      }

      return {
        content: "Saya di sini untuk bantu dengan sawah anda! 🌾 Saya boleh jawab soalan tentang:\n\n• **Kualiti air** - Baik atau tidak?\n• **Bunyi katak** - Apa maksudnya\n• **Masalah sawah** - Cara perbaiki\n• **Amalan terbaik** - Jaga padi sihat\n• **Bila nak periksa** - Masa yang betul\n\nTanya saja apa-apa! Guna bahasa mudah macam cakap dengan kawan. 😊",
        suggestions: [
          "Kualiti air saya baik tak?",
          "Kenapa katak tak menyanyi?",
          "Bagaimana nak perbaiki masalah air?",
          "Masa terbaik untuk periksa sawah?"
        ]
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-green-800">{t.title}</h2>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {message.type === 'user' ? 
                      <User className="w-5 h-5 text-white" /> : 
                      <Bot className="w-5 h-5 text-white" />
                    }
                  </div>
                  
                  <div className={`rounded-lg p-4 ${
                    message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'
                  }`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
                    <span className="text-sm text-gray-600 ml-2">{t.typing}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                {language === 'en' ? 'Quick questions:' : 'Soalan pantas:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs h-8 px-3 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.placeholder}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputValue);
                }
              }}
              className="flex-1 text-base"
            />
            <Button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="bg-green-500 hover:bg-green-600 px-4"
            >
              <Send className="w-4 h-4" />
              <span className="ml-2 hidden sm:inline">{t.send}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Helper Status */}
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-green-800">{t.listening}</p>
            <p className="text-sm text-green-600">
              {language === 'en' 
                ? 'Ask me anything about your rice fields - I understand simple words!'
                : 'Tanya saja apa-apa tentang sawah anda - saya faham bahasa mudah!'
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}