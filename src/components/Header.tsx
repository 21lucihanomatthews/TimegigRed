import { useState, useEffect, useRef } from 'react';
import { Bell, Wallet, User, Check, Settings, X, PlusCircle, ArrowUpRight, ArrowDownLeft, LogOut, Coins, CheckCircle2, ShieldAlert, Info, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../UserContext';
import TopupOverlay from './TopupOverlay';
import AdminDashboard from './AdminDashboard';
import TransferModal from './TransferModal';
import ReceiveModal from './ReceiveModal';
import SafeImage from './SafeImage';
import { storage } from '../lib/storage';
import { UserNotification } from '../types';

interface Props {
  activeTab: string;
  onOpenProfile: () => void;
  showTopup: boolean;
  setShowTopup: (show: boolean) => void;
}

export default function Header({ activeTab, onOpenProfile, showTopup, setShowTopup }: Props) {
  const { profile, updateProfile, topupRequests, switchUser, currentUserId, messages } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [userNotifications, setUserNotifications] = useState<UserNotification[]>([]);

  const notificationRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await storage.getNotifications();
      setUserNotifications(data);
    };
    
    // Initial fetch
    fetchNotifications();

    // Simple polling for a "live" feel in dev
    const interval = setInterval(fetchNotifications, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
      setShowNotifications(false);
    }
    if (showWallet && walletRef.current && !walletRef.current.contains(event.target as Node)) {
      setShowWallet(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showWallet]);

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const handleMarkRead = async (id: string) => {
    await storage.markAsRead(id);
    const data = await storage.getNotifications();
    setUserNotifications(data);
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await storage.deleteNotification(id);
    const data = await storage.getNotifications();
    setUserNotifications(data);
  };
  
  const [notificationPrefs, setNotificationPrefs] = useState({
    gigs: true,
    seekers: true,
    selling: false,
    wanted: false,
  });

  const togglePref = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const pendingAdminCount = profile.isAdmin ? topupRequests.filter(r => r.status === 'pending').length : 0;
  const isLowBalance = profile.balance <= 50;

  const { logout } = useUser();

  if (activeTab === 'Chat') return null;

  return (
    <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shrink-0 relative z-50">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h1>
        <span className="bg-gray-100 text-[10px] font-bold text-gray-400 px-1.5 py-0.5 rounded border border-gray-200">RSA</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div ref={notificationRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowWallet(false); }} 
            className="p-2 relative rounded-full hover:bg-gray-100"
          >
            <motion.div
              animate={unreadCount > 0 ? {
                rotate: [0, -15, 15, -15, 15, 0],
                transition: {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }
              } : {}}
            >
              <Bell className="w-6 h-6 text-gray-700" />
            </motion.div>
            {(isLowBalance || pendingAdminCount > 0 || unreadCount > 0) ? (
              <span className="absolute top-1 right-2 flex items-center justify-center min-w-[12px] h-[12px] bg-red-500 rounded-full border border-white text-[8px] text-white font-bold px-0.5">
                {unreadCount > 0 ? unreadCount : ''}
              </span>
            ) : null}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-4 top-[70px] w-[90vw] max-w-[320px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
              >
                {!showNotificationSettings ? (
                  <>
                    <div className="p-2.5 border-b flex justify-between items-center bg-gray-50">
                      <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                      <button 
                        onClick={() => setShowNotificationSettings(true)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {userNotifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-3 border-b text-xs flex flex-col gap-1 cursor-pointer transition-colors ${notif.read ? 'text-gray-500 bg-white' : 'text-gray-900 bg-red-50 hover:bg-red-100'}`}
                          onClick={() => handleMarkRead(notif.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1">
                              <Info size={12} className={notif.read ? 'text-gray-400' : 'text-[#FF0000]'} />
                              {notif.title}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {!notif.read && <span className="w-1.5 h-1.5 bg-[#FF0000] rounded-full" />}
                              <button
                                onClick={(e) => handleDeleteNotification(notif.id, e)}
                                className="text-gray-400 hover:text-red-500 p-1 hover:bg-gray-100/80 rounded transition-colors"
                                title="Delete Notification"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="line-clamp-2">{notif.message}</p>
                          <span className="text-[9px] text-gray-400 mt-0.5">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                      {isLowBalance && (
                        <div className="p-3 border-b text-xs text-red-600 bg-red-50 flex items-start gap-2 cursor-pointer hover:bg-red-100" onClick={() => {setShowNotifications(false); setShowTopup(true);}}>
                           <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                           <span><span className="font-bold">Low Balance Alert!</span> Your coin balance is low. Tap here to top up and continue using premium features.</span>
                        </div>
                      )}
                      {pendingAdminCount > 0 && (
                        <div className="p-3 border-b text-xs text-blue-600 bg-blue-50 flex items-start gap-2 cursor-pointer hover:bg-blue-100" onClick={() => {setShowNotifications(false); setShowAdmin(true);}}>
                           <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                           <span><span className="font-bold">Admin Alert:</span> You have {pendingAdminCount} pending topup applications to review.</span>
                        </div>
                      )}
                      <div className="p-3 text-xs text-center text-gray-400">
                        No more notifications
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 border-b flex justify-between items-center bg-gray-50">
                      <h3 className="font-semibold text-gray-800 text-sm">Alert Settings</h3>
                      <button 
                        onClick={() => setShowNotificationSettings(false)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3 flex flex-col gap-2.5">
                      <p className="text-[11px] text-gray-500 mb-1">Select which alerts you want to receive.</p>
                      
                      {Object.keys(notificationPrefs).map((key) => {
                        const k = key as keyof typeof notificationPrefs;
                        const isOn = notificationPrefs[k];
                        return (
                          <div key={k} className="flex justify-between items-center py-0.5" >
                            <span className="capitalize text-xs font-medium text-gray-700">{k}</span>
                            <button 
                              onClick={() => togglePref(k)}
                              className={`w-8 h-4.5 rounded-full relative transition-colors ${isOn ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${isOn ? 'left-4' : 'left-0.5'}`} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global User Profile Indicator inside Wallet */}
        <div ref={walletRef}>
          <div className="flex items-center gap-2">
            {/* Display user profile image right before wallet */}
            <div id="tour-profile" className="relative cursor-pointer" onClick={() => { setShowWallet(!showWallet); setShowNotifications(false); }}>
               <SafeImage src={profile.avatarUrl} alt="User Avatar" className="w-9 h-9 rounded-full object-cover shadow-sm border-2 border-white" />
               {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[1px]">
                     <CheckCircle2 className="w-3.5 h-3.5 text-red-500 fill-red-500 stroke-white" />
                  </div>
               )}
            </div>
            
            <button 
              id="tour-wallet"
              onClick={() => { setShowWallet(!showWallet); setShowNotifications(false); }} 
              className={`flex items-center gap-2 transition-colors px-3 py-1.5 rounded-full border ${isLowBalance ? 'bg-red-50 hover:bg-red-100 border-red-200' : 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'}`}
            >
              <Coins className={`w-5 h-5 ${isLowBalance ? 'text-red-500' : 'text-yellow-600'}`} />
              <span className={`font-semibold text-sm ${isLowBalance ? 'text-red-600' : 'text-yellow-700'}`}>{profile.balance.toLocaleString()}</span>
            </button>
          </div>

          <AnimatePresence>
            {showWallet && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-4 top-[70px] w-[90vw] max-w-[320px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                        <SafeImage src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      {profile.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[1px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-red-500 fill-red-500 stroke-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{profile.name} {profile.surname}</h3>
                      <p className="text-xs text-gray-500">{profile.contact || '@user'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={() => {
                          onOpenProfile();
                          setShowWallet(false);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                </div>
                
                <div className="p-5 text-center border-b bg-gradient-to-br from-yellow-50 to-white">
                  <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Coin Balance</p>
                  <p className={`text-4xl font-bold flex items-center justify-center gap-2 ${isLowBalance ? 'text-red-500' : 'text-gray-900'}`}>
                    <Coins className={`w-6 h-6 ${isLowBalance ? 'text-red-500' : 'text-yellow-500'}`} />
                    {profile.balance.toLocaleString()}
                  </p>
                  {isLowBalance && <p className="text-xs text-red-500 mt-2 font-medium">Balance running low!</p>}
                </div>

                <div className="p-3 border-b flex gap-2">
                  <button onClick={() => {setShowWallet(false); setShowTopup(true);}} className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <PlusCircle className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium text-gray-700">Topup</span>
                  </button>
                  <button onClick={() => {setShowWallet(false); setShowTransfer(true);}} className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowUpRight className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-medium text-gray-700">Transfer</span>
                  </button>
                  <button onClick={() => {setShowWallet(false); setShowReceive(true);}} className="flex-1 flex flex-col items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowDownLeft className="w-5 h-5 text-yellow-600" />
                    <span className="text-xs font-medium text-gray-700">Receive</span>
                  </button>
                </div>

                <div className="p-0">
                  <div className="px-4 py-2 bg-gray-50 border-b">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">Recent Transactions</h4>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {profile.transactions.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="p-3 border-b flex justify-between items-center hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-full ${tx.type === 'receive' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {tx.type === 'receive' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{tx.title}</p>
                            <p className="text-xs text-gray-500">{tx.date}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${tx.type === 'receive' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.type === 'receive' ? '+' : '-'}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2 border-t bg-gray-50 flex flex-col gap-1">
                  {profile.isAdmin ? (
                     <button onClick={() => {setShowWallet(false); setShowAdmin(true);}} className="flex w-full items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-gray-900 font-medium hover:bg-gray-800 rounded-lg transition-colors">
                       <ShieldAlert className="w-4 h-4" /> Open Admin Dashboard
                     </button>
                  ) : (
                     <button onClick={() => updateProfile({ isAdmin: true, balance: 1000 })} className="flex w-full items-center justify-center gap-2 px-3 py-2 text-xs text-gray-500 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                       Request Admin Access
                     </button>
                  )}
                  <button 
                    onClick={() => {
                        setShowWallet(false);
                        logout();
                    }}
                    className="flex w-full items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showTopup && <TopupOverlay onClose={() => setShowTopup(false)} />}
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      {showTransfer && <TransferModal onClose={() => setShowTransfer(false)} />}
      {showReceive && <ReceiveModal onClose={() => setShowReceive(false)} />}
    </header>
  );
}
