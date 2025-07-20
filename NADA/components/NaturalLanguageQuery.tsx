import { useState } from "react";
import { Send, MessageCircle, Bot, User, Lightbulb } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export function NaturalLanguageQuery() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your farm helper. I can help you understand your rice field and water quality. Just ask me anything in simple words - like talking to a friend! 😊",
      timestamp: new Date().toLocaleTimeString(),
      suggestions: [
        "Why is my water quality bad?",
        "What should I do about low frog sounds?",
        "How to make my rice field healthier?",
        "When should I check my water?"
      ]
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

    try {
      // Get Supabase info for API calls
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      console.log('Sending query to Gemini-powered NADA backend...');
      
      // Call the enhanced natural language query API
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-f664fd48/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: content })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Backend query failed:', result);
        throw new Error(result.error || 'Query failed');
      }
      
      console.log('✅ Gemini AI response received:', result);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.response,
        timestamp: new Date().toLocaleTimeString(),
        suggestions: result.follow_up_questions || [
          "How can I improve my water quality?",
          "When is the best time to record frog calls?",
          "What do different frog species tell me about my field?",
          "Should I be worried about my current readings?"
        ]
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('❌ Query failed:', error);
      
      // Fallback to mock response if backend fails
      console.log('Falling back to demo mode...');
      const response = generateResponse(content);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `🤖 **Demo Mode**: ${response.content}\n\n*Note: This is a demo response. Connect to backend for real AI-powered answers.*`,
        timestamp: new Date().toLocaleTimeString(),
        suggestions: response.suggestions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateResponse = (query: string): { content: string; suggestions?: string[] } => {
    const lowerQuery = query.toLowerCase();

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
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-sage-800">Ask Your Farm Helper</h2>
        <p className="text-sage-600 mt-1">Ask anything about your rice fields in simple words</p>
      </div>

      <div className="fairy-card border-sage-200/50 p-4 sm:p-6 fairy-glow">
        <div className="space-y-4">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gradient-to-br from-sage-50/50 to-lavender-50/50 rounded-lg border border-sage-200/30">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-dusty-pink-400 to-dusty-pink-600' 
                      : 'bg-gradient-to-br from-sage-400 to-sage-600'
                  }`}>
                    {message.type === 'user' ? 
                      <User className="w-5 h-5 text-cream-50" /> : 
                      <Bot className="w-5 h-5 text-cream-50" />
                    }
                  </div>
                  
                  <div className={`rounded-lg p-4 shadow-sm ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-dusty-pink-500 to-dusty-pink-600 text-cream-50' 
                      : 'bg-gradient-to-br from-cream-50 to-cream-100 border border-sage-200/50'
                  }`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-dusty-pink-100' : 'text-sage-600'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-cream-50" />
                </div>
                <div className="bg-gradient-to-br from-cream-50 to-cream-100 border border-sage-200/50 rounded-lg p-4 shadow-sm">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse delay-200"></div>
                    <span className="text-sm text-sage-600 ml-2">Helper is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <div className="space-y-2">
              <p className="text-sm text-sage-600 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs h-8 px-3 border border-sage-300 text-sage-700 hover:bg-sage-50 rounded-lg transition-colors shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question here... (e.g., 'Why is my water bad?')"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputValue);
                }
              }}
              className="flex-1 text-base px-3 py-2 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent bg-cream-50/50"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-br from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 disabled:from-sage-300 disabled:to-sage-400 px-4 py-2 rounded-lg text-cream-50 font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Helper Status */}
      <div className="p-4 bg-gradient-to-br from-sage-50 to-lavender-50 border border-sage-200/50 rounded-lg fairy-glow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sage-500 to-sage-600 rounded-full flex items-center justify-center shadow-sm">
            <MessageCircle className="w-5 h-5 text-cream-50" />
          </div>
          <div>
            <p className="font-medium text-sage-800">I'm here to help!</p>
            <p className="text-sm text-sage-600">
              Ask me anything about your rice fields - I understand simple words!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}