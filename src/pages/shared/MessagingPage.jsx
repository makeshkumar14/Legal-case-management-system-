import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Search, Send, User } from 'lucide-react';
import { DATA_SYNC_EVENT, messagesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getRoleTheme } from '../../utils/roleTheme';

export function MessagingPage() {
  const { user } = useAuth();
  const theme = getRoleTheme(user?.role);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await messagesAPI.contacts();
      setContacts(res.data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchConversation = async (contactId) => {
    if (!contactId) return;
    setLoadingMessages(true);
    try {
      const res = await messagesAPI.conversation(contactId);
      setMessages(res.data || []);
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId ? { ...contact, unread: 0 } : contact
        )
      );
    } catch (err) {
      console.error('Error fetching conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact?.id) fetchConversation(selectedContact.id);
  }, [selectedContact?.id]);

  useEffect(() => {
    const syncMessages = (event) => {
      if (!event?.detail?.scope || event.detail.scope === 'messages') {
        fetchContacts();
        if (selectedContact?.id) fetchConversation(selectedContact.id);
      }
    };

    window.addEventListener(DATA_SYNC_EVENT, syncMessages);
    return () => window.removeEventListener(DATA_SYNC_EVENT, syncMessages);
  }, [selectedContact?.id]);

  const filteredContacts = useMemo(
    () => contacts.filter((contact) => contact.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [contacts, searchQuery]
  );

  const sendMessage = async () => {
    if (!messageDraft.trim() || !selectedContact?.id) return;
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      from: 'me',
      text: messageDraft.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageDraft('');

    try {
      const res = await messagesAPI.send(selectedContact.id, optimisticMessage.text);
      const createdMessage = res.data?.data || res.data;
      setMessages((prev) => prev.map((item) => (item.id === optimisticMessage.id ? createdMessage : item)));
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContact.id
            ? { ...contact, lastMsg: optimisticMessage.text, unread: 0, time: createdMessage?.time || optimisticMessage.time }
            : contact
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => prev.filter((item) => item.id !== optimisticMessage.id));
      setMessageDraft(optimisticMessage.text);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#1a1a2e] dark:text-white mb-4">
        Messages
      </motion.h1>
      <div className="flex h-[calc(100%-3rem)] rounded-2xl overflow-hidden border-2 border-[#e5e4df] bg-white/80 shadow-sm">
        <div className={`w-full md:w-[22rem] border-r border-[#e5e4df] flex flex-col ${selectedContact ? 'hidden md:flex' : ''}`}>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b80]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-sm text-[#1a1a2e] placeholder:text-[#6b6b80] focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingContacts && <div className="p-4 text-sm text-[#6b6b80]">Loading conversations...</div>}
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-[#f7f6f3] transition-all text-left ${selectedContact?.id === contact.id ? `${theme.accentSoftBg} border-l-4 ${theme.accentBorder}` : ''}`}
              >
                <div className="relative">
                  <div className={['w-11 h-11 rounded-full flex items-center justify-center text-white font-bold', theme.accentBg].join(' ')}>
                    {contact.name.charAt(0)}
                  </div>
                  {contact.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#1a1a2e] truncate">{contact.name}</h4>
                    <span className="text-xs text-[#6b6b80]">{contact.time || 'Now'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[#6b6b80] truncate">{contact.lastMsg || `Start a conversation with this ${contact.role.toLowerCase()}.`}</p>
                    {contact.unread > 0 && (
                      <span className={['w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center', theme.accentBg].join(' ')}>
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${!selectedContact ? 'hidden md:flex' : ''}`}>
          {selectedContact ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-[#e5e4df]">
                <button onClick={() => setSelectedContact(null)} className="md:hidden p-2 rounded-lg text-[#6b6b80]">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold', theme.accentBg].join(' ')}>
                  {selectedContact.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#1a1a2e]">{selectedContact.name}</h3>
                  <p className="text-xs text-[#6b6b80]">{selectedContact.role}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages && <div className="text-sm text-[#6b6b80]">Loading messages...</div>}
                {!loadingMessages && messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <MessageSquare className="w-16 h-16 text-[#6b6b80] mx-auto mb-4 opacity-40" />
                      <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">No messages yet</h3>
                      <p className="text-[#6b6b80]">Send the first update to start this conversation.</p>
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${message.from === 'me' ? `${theme.accentBg} text-white` : 'bg-[#f7f6f3] text-[#1a1a2e]'}`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.from === 'me' ? 'text-white/70' : 'text-[#6b6b80]'}`}>{message.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-[#e5e4df]">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={`Message ${selectedContact.name}...`}
                    className="flex-1 px-4 py-3 bg-[#f7f6f3] border-2 border-[#e5e4df] rounded-xl text-sm text-[#1a1a2e] placeholder:text-[#6b6b80] focus:outline-none"
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={sendMessage} className={['p-3 rounded-xl shadow-lg text-white', theme.accentBg, theme.shadow].join(' ')}>
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <User className="w-16 h-16 text-[#6b6b80] mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-[#1a1a2e] mb-2">Choose a conversation</h3>
              <p className="text-[#6b6b80]">Select a contact to review updates or send a message.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
