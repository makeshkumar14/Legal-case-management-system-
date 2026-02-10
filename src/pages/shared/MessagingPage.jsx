import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, Send, Phone, Video, MoreVertical, Circle, ArrowLeft, Users, User } from 'lucide-react';

const contacts = [
  { id: 1, name: 'Adv. Priya Sharma', role: 'Advocate', online: true, lastMsg: 'Documents have been submitted', time: '2m ago', unread: 3 },
  { id: 2, name: 'Judge R. Krishnan', role: 'Court', online: true, lastMsg: 'Hearing postponed to next week', time: '15m ago', unread: 1 },
  { id: 3, name: 'Rajesh Kumar', role: 'Client', online: false, lastMsg: 'Thank you for the update', time: '1h ago', unread: 0 },
  { id: 4, name: 'Adv. Vikram Patel', role: 'Advocate', online: true, lastMsg: 'Need case file for CIV-2024-1842', time: '3h ago', unread: 0 },
  { id: 5, name: 'Court Registrar', role: 'Court', online: false, lastMsg: 'QR codes have been updated', time: '1d ago', unread: 0 },
  { id: 6, name: 'Meera Devi', role: 'Client', online: false, lastMsg: 'When is the next hearing?', time: '2d ago', unread: 2 },
];

const chatMessages = {
  1: [
    { id: 1, from: 'them', text: 'Hi, I have submitted the evidence documents for CIV-2024-1842.', time: '10:30 AM' },
    { id: 2, from: 'me', text: 'Great, I will review them today. Any specific points to note?', time: '10:32 AM' },
    { id: 3, from: 'them', text: 'Yes, please check page 15 of the financial statements. There are discrepancies.', time: '10:35 AM' },
    { id: 4, from: 'them', text: 'Documents have been submitted', time: '10:36 AM' },
  ],
  2: [
    { id: 1, from: 'them', text: 'The hearing for CRM-2024-0567 has been postponed to next Monday.', time: '9:00 AM' },
    { id: 2, from: 'me', text: 'Noted, Your Honor. Should I inform the opposing counsel?', time: '9:15 AM' },
    { id: 3, from: 'them', text: 'Yes, please coordinate. Hearing postponed to next week', time: '9:20 AM' },
  ],
};

export function MessagingPage() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(chatMessages);

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const sendMessage = () => {
    if (!message.trim() || !selectedContact) return;
    const newMsg = { id: Date.now(), from: 'me', text: message, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => ({ ...prev, [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg] }));
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-4">Messages</motion.h1>
      <div className="flex h-[calc(100%-3rem)] rounded-2xl overflow-hidden border-2 border-[#e5e4df] dark:border-[#2d2d45] bg-white/80 dark:bg-[#232338]">
        
        <div className={`w-full md:w-80 border-r border-[#e5e4df] dark:border-[#2d2d45] flex flex-col ${selectedContact ? 'hidden md:flex' : ''}`}>
          <div className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none" /></div></div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map(c => (
              <button key={c.id} onClick={() => setSelectedContact(c)} className={`w-full flex items-center gap-3 p-4 hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a2e] transition-all text-left ${selectedContact?.id === c.id ? 'bg-[#f7f6f3] dark:bg-[#1a1a2e] border-l-4 border-[#b4f461]' : ''}`}>
                <div className="relative"><div className="w-11 h-11 rounded-full bg-[#b4f461]/20 flex items-center justify-center text-[#2d6a25] font-bold">{c.name.charAt(0)}</div>
                  {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#232338]" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-[#1a1a2e] dark:text-white truncate">{c.name}</h4><span className="text-xs text-[#6b6b80]">{c.time}</span></div>
                  <div className="flex items-center justify-between"><p className="text-xs text-[#6b6b80] truncate">{c.lastMsg}</p>
                    {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-[#b4f461] text-[#1a1a2e] text-xs font-bold flex items-center justify-center ml-2">{c.unread}</span>}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${!selectedContact ? 'hidden md:flex' : ''}`}>
          {selectedContact ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-[#e5e4df] dark:border-[#2d2d45]">
                <button onClick={() => setSelectedContact(null)} className="md:hidden p-2 rounded-lg text-[#6b6b80]"><ArrowLeft className="w-5 h-5" /></button>
                <div className="relative"><div className="w-10 h-10 rounded-full bg-[#b4f461]/20 flex items-center justify-center text-[#2d6a25] font-bold">{selectedContact.name.charAt(0)}</div>
                  {selectedContact.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#232338]" />}</div>
                <div className="flex-1"><h3 className="text-sm font-semibold text-[#1a1a2e] dark:text-white">{selectedContact.name}</h3>
                  <p className="text-xs text-[#6b6b80]">{selectedContact.online ? 'Online' : 'Offline'} • {selectedContact.role}</p></div>
                <button className="p-2 rounded-lg hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a2e] text-[#6b6b80]"><Phone className="w-5 h-5" /></button>
                <button className="p-2 rounded-lg hover:bg-[#f7f6f3] dark:hover:bg-[#1a1a2e] text-[#6b6b80]"><Video className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(messages[selectedContact.id] || []).map(msg => (
                  <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${msg.from === 'me' ? 'bg-[#b4f461] text-[#1a1a2e]' : 'bg-[#f7f6f3] dark:bg-[#1a1a2e] text-[#1a1a2e] dark:text-white'}`}>
                      <p className="text-sm">{msg.text}</p><p className={`text-xs mt-1 ${msg.from === 'me' ? 'text-[#1a1a2e]/60' : 'text-[#6b6b80]'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-[#e5e4df] dark:border-[#2d2d45]">
                <div className="flex items-center gap-3">
                  <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-[#f7f6f3] dark:bg-[#1a1a2e] border-2 border-[#e5e4df] dark:border-[#2d2d45] rounded-xl text-sm text-[#1a1a2e] dark:text-white placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#b4f461]/30" />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={sendMessage}
                    className="p-3 bg-[#b4f461] text-[#1a1a2e] rounded-xl shadow-lg shadow-[#b4f461]/25"><Send className="w-5 h-5" /></motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-16 h-16 text-[#6b6b80] mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-[#1a1a2e] dark:text-white mb-2">Select a conversation</h3>
              <p className="text-[#6b6b80]">Choose a contact to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
