import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message } from './types';

export interface TopupRequest {
  id: string;
  userId: string;
  userName: string;
  coins: number;
  randAmount: string;
  proofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface Transaction {
  id: string;
  type: 'receive' | 'send';
  amount: number;
  title: string;
  date: string;
}

export interface UserProfile {
  id: string;
  name: string;
  middleName: string;
  surname: string;
  contact: string;
  avatarUrl: string;
  socialLinks: string[];
  isVerified: boolean;
  idUploaded: boolean;
  cvUploaded: boolean;
  certificatesUploaded: boolean;
  balance: number;
  isAdmin: boolean;
  receiveCode: string;
  transactions: Transaction[];
  hasSeenTour: boolean;
}

interface UserContextType {
  profile: UserProfile;
  profiles: Record<string, UserProfile>;
  currentUserId: string;
  messages: Message[];
  sendMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  switchUser: (id: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  topupRequests: TopupRequest[];
  adminProfit: number;
  submitTopup: (coins: number, randAmount: string, proofUrl: string) => void;
  approveTopup: (id: string) => void;
  rejectTopup: (id: string) => void;
  notifyLowBalance: () => void;
  transferCoins: (toCode: string, amount: number) => Promise<{ success: boolean; message: string }>;
  error: string | null;
}

const defaultProfiles: Record<string, UserProfile> = {
  me: {
    id: 'me',
    name: 'User',
    middleName: '',
    surname: '',
    contact: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    socialLinks: [],
    isVerified: false,
    idUploaded: false,
    cvUploaded: false,
    certificatesUploaded: false,
    balance: 0,
    isAdmin: false,
    receiveCode: 'GIG-' + Math.random().toString(36).substring(7).toUpperCase(),
    transactions: [],
    hasSeenTour: false,
  }
};

const UserContext = createContext<UserContextType>({
  profile: defaultProfiles.me,
  profiles: defaultProfiles,
  currentUserId: 'me',
  messages: [],
  sendMessage: () => {},
  updateMessage: () => {},
  deleteMessage: () => {},
  switchUser: () => {},
  updateProfile: () => {},
  topupRequests: [],
  adminProfit: 0,
  submitTopup: () => {},
  approveTopup: () => {},
  rejectTopup: () => {},
  notifyLowBalance: () => {},
  transferCoins: async () => ({ success: false, message: '' }),
  error: null,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(defaultProfiles);
  const [currentUserId, setCurrentUserId] = useState<string>('me');
  const [messages, setMessages] = useState<Message[]>([]);
  const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
  const [adminProfit, setAdminProfit] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          fetch('/api/profiles').then(res => res.ok ? res.json() : res.json().catch(() => ({ error: res.statusText }))),
          fetch('/api/messages').then(res => res.ok ? res.json() : res.json().catch(() => ({ error: res.statusText }))),
          fetch('/api/topup-requests').then(res => res.ok ? res.json() : res.json().catch(() => ({ error: res.statusText })))
        ]);
        
        const [profilesRes, messagesRes, topupsRes] = responses;

        if (profilesRes?.error || messagesRes?.error || topupsRes?.error) {
          setError(profilesRes?.error || messagesRes?.error || topupsRes?.error);
        }
        
        if (Array.isArray(profilesRes) && profilesRes.length > 0) {
          const profilesMap: Record<string, UserProfile> = {};
          profilesRes.forEach((p: UserProfile) => {
            profilesMap[p.id] = p;
          });
          setProfiles({ ...defaultProfiles, ...profilesMap });
        }
        
        if (Array.isArray(messagesRes)) setMessages(messagesRes);
        if (Array.isArray(topupsRes)) setTopupRequests(topupsRes);
        
        const savedUserId = localStorage.getItem('appCurrentUserId');
        if (savedUserId) setCurrentUserId(savedUserId);
        
      } catch (err: any) {
        console.error('Failed to fetch user data', err);
        setError(err.message || "Failed to connect to server");
      } finally {
        setLoaded(true);
      }
    };
    fetchData();
  }, []);

  const profile = profiles[currentUserId] || defaultProfiles.me;

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await fetch(`/api/profiles/${currentUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const saved = await res.json();
      setProfiles(prev => ({ ...prev, [currentUserId]: { ...prev[currentUserId], ...saved } }));
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const switchUser = (id: string) => {
    if (profiles[id]) {
      setCurrentUserId(id);
      localStorage.setItem('appCurrentUserId', id);
    }
  };

  const sendMessage = async (msg: Omit<Message, 'id' | 'timestamp'>) => {
    try {
      const newMessage: Omit<Message, 'id' | 'timestamp'> = {
        ...msg,
        isRead: false,
        status: 'sent'
      };
      
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMessage,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      });
      const saved = await res.json();
      setMessages(prev => [...prev, saved]);

      if (msg.toId.startsWith('bot-')) {
        setTimeout(async () => {
          const botResponses = ["Interesting!", "Tell me more.", "I see.", "Got it."];
          const botMsg = {
            id: Math.random().toString(36).substring(7),
            fromId: msg.toId,
            toId: msg.fromId,
            text: botResponses[Math.floor(Math.random() * botResponses.length)],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            isRead: false
          };
          const bRes = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(botMsg)
          });
          const bSaved = await bRes.json();
          setMessages(prev => [...prev, bSaved]);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const updateMessage = async (id: string, updates: Partial<Message>) => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const saved = await res.json();
      setMessages(prev => prev.map(m => m.id === saved.id ? saved : m));
    } catch (err) {
      console.error('Failed to update message', err);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: true, text: 'This message was deleted' })
      });
      const saved = await res.json();
      setMessages(prev => prev.map(m => m.id === saved.id ? saved : m));
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const submitTopup = async (coins: number, randAmount: string, proofUrl: string) => {
    try {
      const newRequest = {
        id: Math.random().toString(36).substring(7),
        userId: currentUserId,
        userName: `${profile.name} ${profile.surname}`,
        coins,
        randAmount,
        proofUrl,
        status: 'pending',
        date: new Date().toLocaleDateString(),
      };
      const res = await fetch('/api/topup-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      const saved = await res.json();
      setTopupRequests(prev => [...prev, saved]);
    } catch (err) {
      console.error('Failed to submit topup', err);
    }
  };

  const approveTopup = async (id: string) => {
    try {
      const req = topupRequests.find(r => r.id === id);
      if (!req || req.status !== 'pending') return;

      const res = await fetch(`/api/topup-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      const saved = await res.json();
      setTopupRequests(prev => prev.map(r => r.id === saved.id ? saved : r));
      
      const rAmount = parseFloat(req.randAmount.replace('R', '').replace(',', '.'));
      setAdminProfit(prev => prev + rAmount);

      const targetProfile = profiles[req.userId] || profile;
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(7),
        type: 'receive',
        amount: req.coins,
        title: 'Topup Approved',
        date: new Date().toLocaleDateString(),
      };
      
      await fetch(`/api/profiles/${req.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          balance: targetProfile.balance + req.coins,
          transactions: [newTransaction, ...targetProfile.transactions]
        })
      });
      
      setProfiles(prev => ({
        ...prev,
        [req.userId]: {
          ...prev[req.userId],
          balance: prev[req.userId].balance + req.coins,
          transactions: [newTransaction, ...prev[req.userId].transactions]
        }
      }));
    } catch (err) {
      console.error('Failed to approve topup', err);
    }
  };

  const rejectTopup = async (id: string) => {
    try {
      const res = await fetch(`/api/topup-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      const saved = await res.json();
      setTopupRequests(prev => prev.map(r => r.id === saved.id ? saved : r));
    } catch (err) {
      console.error('Failed to reject topup', err);
    }
  };

  const notifyLowBalance = () => {};

  const transferCoins = async (toCode: string, amount: number) => {
    if (amount <= 0) return { success: false, message: 'Invalid amount.' };
    if (profile.balance < amount) return { success: false, message: 'Insufficient balance.' };
    if (toCode.trim().toUpperCase() === profile.receiveCode.toUpperCase()) {
      return { success: false, message: 'Cannot transfer to yourself.' };
    }

    const recipientCodeUpper = toCode.trim().toUpperCase();
    const recipientKey = Object.keys(profiles).find(
      key => profiles[key].receiveCode.toUpperCase() === recipientCodeUpper
    );

    if (!recipientKey) return { success: false, message: 'Recipient not found.' };

    try {
      const recipient = profiles[recipientKey];
      const newSenderTransaction: Transaction = {
        id: Math.random().toString(36).substring(7),
        type: 'send',
        amount,
        title: `Transfer to ${toCode.toUpperCase()}`,
        date: new Date().toLocaleDateString(),
      };
      const newRecipientTransaction: Transaction = {
        id: Math.random().toString(36).substring(7),
        type: 'receive',
        amount,
        title: `Received from ${profile.name}`,
        date: new Date().toLocaleDateString(),
      };

      await Promise.all([
        fetch(`/api/profiles/${currentUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance: profile.balance - amount,
            transactions: [newSenderTransaction, ...profile.transactions]
          })
        }),
        fetch(`/api/profiles/${recipientKey}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            balance: recipient.balance + amount,
            transactions: [newRecipientTransaction, ...recipient.transactions]
          })
        })
      ]);

      setProfiles(prev => ({
        ...prev,
        [currentUserId]: {
          ...prev[currentUserId],
          balance: prev[currentUserId].balance - amount,
          transactions: [newSenderTransaction, ...profile.transactions]
        },
        [recipientKey]: {
          ...prev[recipientKey],
          balance: recipient.balance + amount,
          transactions: [newRecipientTransaction, ...recipient.transactions]
        }
      }));

      return { success: true, message: `Successfully transferred ${amount} coins.` };
    } catch (err) {
      return { success: false, message: 'Transfer failed.' };
    }
  };

  if (!loaded) return null;

  return (
    <UserContext.Provider value={{ 
      profile, profiles, currentUserId, messages, sendMessage, updateMessage, deleteMessage, 
      switchUser, updateProfile, topupRequests, adminProfit, 
      submitTopup, approveTopup, rejectTopup, notifyLowBalance, transferCoins,
      error
    }}>
      {children}
    </UserContext.Provider>
  );
};
