import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Store, 
  Clock, 
  ShieldCheck, 
  Phone, 
  Sparkles, 
  HelpCircle, 
  Compass, 
  ChevronDown 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const CustomerSupportBot: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! 🙏 Welcome to Bajaj Enterprises Bikaner. I am your showroom assistant. How can I help you today?',
      timestamp: 'Just now',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide on admin portal routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickChips = [
    { label: '📍 Location & Hours', query: 'Showroom location and timings' },
    { label: '🚲 Sizing Guide', query: 'Bicycle wheel and age size guide' },
    { label: '🛡️ 1-Year Warranty', query: 'Warranty and guarantee details' },
    { label: '🏷️ Festive Offers', query: 'Current festive offers and schemes' },
    { label: '📞 Contact Showroom', query: 'Phone number and store contact' },
  ];

  const getBotResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    if (q.includes('location') || q.includes('address') || q.includes('where') || q.includes('kahan') || q.includes('kote gate') || q.includes('timing') || q.includes('time') || q.includes('open') || q.includes('hour')) {
      return `📍 **Showroom Location & Timings:**\n\n• **Address:** Opposite Joshi Sweets, Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001\n• **Showroom Hours:** Open every day from 10:00 AM to 8:30 PM (Mon-Sun)\n• Free test rides and personalized frame fitting available at the showroom!`;
    }

    if (q.includes('size') || q.includes('sizing') || q.includes('height') || q.includes('age') || q.includes('feet') || q.includes('inch') || q.includes('kids') || q.includes('bacche')) {
      return `🚲 **Bicycle Sizing Recommendation:**\n\n• **16T / 20T:** Kids 5–10 years (Height 3'6" – 4'8")\n• **24T:** Boys & Girls 9–13 years (Height 4'6" – 5'2")\n• **26T:** Teens & Adults for city commuting (Height 5'0" – 5'8")\n• **27.5T / 29T:** Adults & MTB geard trail riders (Height 5'6" – 6'2"+)\n\nAll our cycles feature ergonomic adjustable seatposts for the perfect posture!`;
    }

    if (q.includes('warrant') || q.includes('guarant') || q.includes('service') || q.includes('repair') || q.includes('1 year')) {
      return `🛡️ **1-Year Manufacturer Frame Warranty:**\n\nEvery bicycle at Bajaj Enterprises comes backed by a standard **1-Year Manufacturer Frame Warranty**.\n\nWe also provide genuine factory parts, first complimentary inspection, and authorized service support right at our Kote Gate showroom.`;
    }

    if (q.includes('offer') || q.includes('festive') || q.includes('discount') || q.includes('price') || q.includes('rate') || q.includes('kitne') || q.includes('cost') || q.includes('scheme')) {
      return `🏷️ **Current Offers & Pricing:**\n\n• Showroom festive discounts of up to 15% - 25% off on popular AVON and HERCULES cycles.\n• Free essential accessories kit (Bell, Reflectors, Stand) on select models.\n• Payment options: UPI, Debit/Credit Cards, Cash, and flexible finance/EMI schemes at the showroom.`;
    }

    if (q.includes('deliver') || q.includes('pickup') || q.includes('home delivery') || q.includes('bikaner')) {
      return `🚚 **Delivery & Pickup Options:**\n\n• **Store Pickup (Instant):** Collect your fully assembled, tuned, and tested bicycle directly from our Kote Gate showroom.\n• **Local Doorstep Delivery:** Available across Bikaner within 24 hours of enquiry/order confirmation.`;
    }

    if (q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('number') || q.includes('whatsapp') || q.includes('mobile')) {
      return `📞 **Contact Bajaj Enterprises:**\n\n• **Phone / WhatsApp:** +91 94141 38662\n• **Showroom Line:** +91 98292 17882\n• **Email:** bajajenterprisesbikaner@gmail.com\n• **Address:** Opp. Joshi Sweets, Alakh Sagar Road, Kote Gate, Bikaner.\n\nYou can also click the **"Quick Enquiry"** button on any bicycle to send your query directly!`;
    }

    if (q.includes('brand') || q.includes('avon') || q.includes('hercules') || q.includes('roadeo') || q.includes('hero') || q.includes('gear') || q.includes('mtb')) {
      return `🏆 **Authorised Brands:**\n\nBajaj Enterprises is the premier authorised dealer in Bikaner for **AVON Cycles** and **HERCULES Cycles** (including Roadeo, BSA, and Montra performance series). We stock City, Geared, MTB, Kids, and Commuter bicycles.`;
    }

    return `Thank you for your question! 😊\n\nBajaj Enterprises is located at Alakh Sagar Road, Kote Gate, Bikaner. For exact bicycle pricing, availability, or to book a free test ride, please call **+91 94141 38662** or submit an enquiry through our website.`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    setTimeout(() => {
      const botResponseText = getBotResponse(text);
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl shadow-emerald-900/40 transition-all transform hover:scale-105 active:scale-95"
          aria-label="Open Customer Support Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full" />
          </div>
          <span className="font-extrabold text-xs tracking-wide">
            Ask Showroom Assistant
          </span>
          <span className="bg-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full text-emerald-100">
            Online
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                  <span>Bajaj Enterprises Assistant</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400">
                  Kote Gate, Bikaner • Quick Support Bot
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Chips Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleSendMessage(chip.query)}
                className="flex-shrink-0 text-[11px] font-bold px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg border border-slate-200 transition shadow-xs"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about timings, sizing, warranty, offers..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-100 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none text-slate-800 transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl shadow-md transition"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
