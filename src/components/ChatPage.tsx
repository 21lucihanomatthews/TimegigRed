import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Contact } from '../types';
import ContactList from './ContactList';
import ChatScreen from './ChatScreen';
import { useUser } from '../UserContext';

interface Props {
  onNavigate: (tab: string) => void;
  preSelectedContactId: string | null;
  initialMessage?: string | null;
  onInitialMessageSent?: () => void;
}

export default function ChatPage({ onNavigate, preSelectedContactId, initialMessage, onInitialMessageSent }: Props) {
  const { profiles, profile: currentUser, messages: globalMessages } = useUser();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const BOTS: Contact[] = [
    { id: 'bot-1', name: 'AI Assistant', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Assistant', lastMessage: 'How can I help you today?', isBot: true },
    { id: 'bot-2', name: 'Market Bot', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Market', lastMessage: 'I can help you find items.', isBot: true }
  ];

  const allContacts = useMemo(() => {
    const userContacts: Contact[] = Object.values(profiles)
      .filter(p => p.id !== currentUser.id)
      .map(p => {
        const conversationMsgs = globalMessages.filter(
          m => (m.fromId === currentUser.id && m.toId === p.id) || 
               (m.fromId === p.id && m.toId === currentUser.id)
        );
        const lastMsg = conversationMsgs[conversationMsgs.length - 1];
        
        return {
          id: p.id,
          name: `${p.name} ${p.surname}`,
          avatar: p.avatarUrl,
          lastMessage: lastMsg ? (lastMsg.isDeleted ? 'Message deleted' : (lastMsg.text || 'Media message')) : 'Active user',
          unreadCount: conversationMsgs.filter(m => m.fromId === p.id && !m.isRead).length
        };
      });
    
    // Also include bots in the last message check if needed, but bots are static mostly
    const botContacts = BOTS.map(b => {
      const conversationMsgs = globalMessages.filter(
        m => (m.fromId === currentUser.id && m.toId === b.id) || 
             (m.fromId === b.id && m.toId === currentUser.id)
      );
      const lastMsg = conversationMsgs[conversationMsgs.length - 1];
      const unreadCount = conversationMsgs.filter(m => m.fromId === b.id && !m.isRead).length;
      return lastMsg ? { ...b, lastMessage: lastMsg.text || 'Media', unreadCount } : { ...b, unreadCount };
    });
    
    return [...userContacts, ...botContacts];
  }, [profiles, currentUser.id, globalMessages]);

  const filteredContacts = allContacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (preSelectedContactId) {
        const contact = allContacts.find(c => c.id === preSelectedContactId);
        if (contact) {
            setSelectedContact(contact);
        } else {
            // Check if it exists in profiles but not in current allContacts (unlikely but safe)
            const profile = profiles[preSelectedContactId];
            if (profile) {
                setSelectedContact({
                    id: profile.id,
                    name: `${profile.name} ${profile.surname}`,
                    avatar: profile.avatarUrl,
                    lastMessage: 'New chat'
                });
            }
        }
    }
  }, [preSelectedContactId, allContacts, profiles]);

  if (selectedContact) {
    return <ChatScreen contact={selectedContact} onBack={() => setSelectedContact(null)} initialMessage={initialMessage} onInitialMessageSent={onInitialMessageSent} />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-transparent">
        <div className="p-4 bg-zinc-900/90 backdrop-blur-md text-white flex justify-between items-center flex-shrink-0 border-b border-white/10">
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('GiGs')} className="hover:opacity-80 p-2 bg-white/10 rounded-full">
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-xl font-black tracking-tighter italic">CHATS</h1>
            </div>
        </div>
        <div className="p-4 bg-white/10 backdrop-blur-md border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm border-0 rounded-2xl bg-zinc-900/40 text-black placeholder-zinc-500 shadow-inner focus:ring-2 focus:ring-zinc-500/50 transition-all outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-white/5 backdrop-blur-[2px]">
          <ContactList contacts={filteredContacts} onSelectContact={setSelectedContact} />
        </div>
    </div>
  );
}
