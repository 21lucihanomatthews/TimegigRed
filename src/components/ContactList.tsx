import { Contact } from '../types';
import SafeImage from './SafeImage';

interface ContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

export default function ContactList({ contacts, onSelectContact }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 text-center">
        <p className="text-lg">No active chats found.</p>
        <p className="text-sm mt-2">Start a conversation from any gig, seeker or market post.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-grow">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className="flex items-center p-4 hover:bg-white/40 active:bg-white/60 w-full text-left border-b border-white/5 transition-colors group"
          >
            <div className="relative">
              <SafeImage src={contact.avatar} alt={contact.name} className="w-14 h-14 rounded-full mr-4 border-2 border-white/20 shadow-xl group-hover:scale-105 transition-transform" />
              {contact.unreadCount && contact.unreadCount > 0 ? (
                <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  {contact.unreadCount}
                </div>
              ) : null}
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-zinc-900 tracking-tight">{contact.name}</h3>
              <p className="text-xs text-zinc-500 truncate mt-0.5 font-medium">{contact.lastMessage}</p>
            </div>
            <div className="ml-2 text-[10px] text-zinc-400 font-mono">
               9:41
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
