import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';

const quickActions = ['Case Status', 'Hearing Info', 'Legal Terms', 'File Complaint', 'Find Advocate'];

const botResponses = {
  'case status': 'You can check your case status by navigating to "My Cases" from the dashboard. Enter your case number (e.g., CIV-2024-1842) to view detailed status, hearing dates, and documents.',
  'hearing': 'Upcoming hearings are displayed on your dashboard. For court users, go to "Hearings" to schedule or manage hearings. Advocates can view their hearing calendar from the dashboard.',
  'legal terms': '**Common Legal Terms:**\n• **Petitioner** – Person filing the case\n• **Respondent** – Person against whom the case is filed\n• **Adjournment** – Postponement of hearing\n• **Affidavit** – Written statement confirmed by oath\n• **Bail** – Temporary release of accused',
  'file complaint': 'To file a complaint: 1) Visit your nearest district court, 2) Consult a legal aid center, 3) File online through eFiling portal. You can also use the "Search Case" feature to look up similar cases.',
  'find advocate': 'You can find registered advocates through the court portal. Go to the Advocates section to view profiles, specializations, and performance metrics of available lawyers.',
  'hello': 'Hello! 👋 I\'m your AI Legal Assistant. I can help you with case information, legal terms, hearing schedules, and more. How can I assist you today?',
  'help': 'I can help you with:\n• 📋 Case status inquiries\n• 📅 Hearing schedules\n• 📚 Legal terminology\n• 📝 Filing procedures\n• 👨‍⚖️ Finding advocates\n\nJust type your question or use the quick actions below!',
  'default': 'I understand you\'re asking about legal matters. For specific case inquiries, please provide your case number. For general information, try asking about "case status", "hearing info", or "legal terms". You can also use the quick action buttons below.'
};

function getResponse(input) {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(botResponses)) {
    if (key !== 'default' && lower.includes(key)) return response;
  }
  return botResponses.default;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, from: 'bot', text: 'Hello! 👋 I\'m your AI Legal Assistant. How can I help you today?', time: new Date() }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const sendMessage = (text) => {
    const msgText = text || input.trim();
    if (!msgText) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'user', text: msgText, time: new Date() }]);
    setInput(''); setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'bot', text: getResponse(msgText), time: new Date() }]);
    }, 800 + Math.random() * 1200);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] flex flex-col rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e5e4df] dark:border-[#2d2d45] bg-white dark:bg-[#1a1a2e]">
            
            <div className="flex items-center gap-3 p-4 bg-[#1a1a2e] text-white">
              <div className="w-10 h-10 rounded-xl bg-[#b4f461] flex items-center justify-center"><Bot className="w-5 h-5 text-[#1a1a2e]" /></div>
              <div className="flex-1"><h3 className="font-bold text-sm">AI Legal Assistant</h3><p className="text-xs text-[#b4f461]">● Online</p></div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f7f6f3] dark:bg-[#0f0f1a]">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${msg.from === 'user' ? 'bg-[#b4f461] text-[#1a1a2e]' : 'bg-white dark:bg-[#232338] text-[#1a1a2e] dark:text-white border border-[#e5e4df] dark:border-[#2d2d45]'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start"><div className="px-4 py-3 rounded-2xl bg-white dark:bg-[#232338] border border-[#e5e4df] dark:border-[#2d2d45]">
                  <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-[#6b6b80] animate-bounce" style={{animationDelay:'0ms'}} /><div className="w-2 h-2 rounded-full bg-[#6b6b80] animate-bounce" style={{animationDelay:'150ms'}} /><div className="w-2 h-2 rounded-full bg-[#6b6b80] animate-bounce" style={{animationDelay:'300ms'}} /></div>
                </div></div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white dark:bg-[#1a1a2e] border-t border-[#e5e4df] dark:border-[#2d2d45]">
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                {quickActions.map(action => (
                  <button key={action} onClick={() => sendMessage(action)} className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-[#f7f6f3] dark:bg-[#232338] border border-[#e5e4df] dark:border-[#2d2d45] text-[#6b6b80] hover:text-[#1a1a2e] dark:hover:text-white hover:border-[#b4f461] transition-all">
                    {action}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2.5 bg-[#f7f6f3] dark:bg-[#232338] border border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-1 focus:ring-[#b4f461]" />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => sendMessage()}
                  className="p-2.5 bg-[#b4f461] text-[#1a1a2e] rounded-xl"><Send className="w-4 h-4" /></motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-[#b4f461] text-[#1a1a2e] shadow-xl shadow-[#b4f461]/30 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isOpen ? <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }}><X className="w-6 h-6" /></motion.div>
            : <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }}><Sparkles className="w-6 h-6" /></motion.div>}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
