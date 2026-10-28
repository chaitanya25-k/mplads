import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  HelpCircle, 
  BookOpen, 
  RefreshCw,
  Scale
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AskMoSPIAssistantProps {
  initialQuery?: string;
}

export const AskMoSPIAssistant: React.FC<AskMoSPIAssistantProps> = ({ initialQuery }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaskar! I am the **MoSPI AI Compliance & Forensic Intelligence Assistant**.\n\nI am trained on the **MPLADS Revised Guidelines 2023**, General Financial Rules (GFR), Schedule of Rates (SoR), and live scheme transaction datasets.\n\nYou can ask me about fund entitlement rules, anomaly detection methodologies, state performance comparisons, or statutory procedure for show-cause notices.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    "What are the statutory rules for Calamity fund recommendations under MPLADS 2023?",
    "Explain the methodology used to detect duplicate community asset sanctions using GIS.",
    "What are the mandatory SC (15%) and ST (7.5%) fund allocation requirements?",
    "How does the system calculate Vendor Monopoly Index and flag cartel bidding?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/compliance-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          userRole: 'National Apex Auditor',
          contextData: { system: 'MPLADS AI Anomaly Detection Platform' }
        })
      });
      const data = await response.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.response || 'I have processed your request based on MPLADS 2023 statutory guidelines.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'An error occurred while querying the compliance engine. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                MoSPI AI Regulatory & Forensic Intelligence Advisor
              </h1>
              <p className="text-xs text-slate-400">
                Direct statutory Q&A grounded in MPLADS Guidelines 2023, GFR norms, and live fraud detection rules
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-indigo-300 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Powered by Gemini 3.7 Flash</span>
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestedQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-left text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 p-3 rounded-lg border border-slate-800 transition-all flex items-center justify-between group cursor-pointer"
          >
            <span className="line-clamp-1">{q}</span>
            <Sparkles className="w-3 h-3 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[550px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-slate-50 shrink-0 shadow">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium'
                  : 'bg-slate-950 text-slate-200 border border-slate-800'
              }`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span className={`text-[10px] block mt-1.5 ${
                  msg.sender === 'user' ? 'text-slate-800 text-right' : 'text-slate-500'
                }`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-slate-50 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-400 flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Consulting MPLADS Guidelines & GFR database...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about MPLADS guidelines, anomaly flags, or fund limits..."
            className="flex-1 bg-slate-900 text-xs sm:text-sm text-slate-200 px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || loading}
            className={`p-2.5 rounded-xl transition-all ${
              inputText.trim() && !loading
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
