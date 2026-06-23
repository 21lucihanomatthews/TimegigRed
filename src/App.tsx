/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MessageSquare, Store, Wallet, Users, ArrowUpCircle, Search, Clock } from 'lucide-react';
import GigsPage from './components/GigsPage';
import SeekersPage from './components/SeekersPage';
import SellingPage from './components/SellingPage';
import WantedPage from './components/WantedPage';
import ChatPage from './components/ChatPage';
import ProfileEditor from './components/ProfileEditor';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import { DataProvider, useData } from './DataContext';
import { UserProvider, useUser } from './UserContext';
import GuidanceTour from './components/GuidanceTour';
import ErrorBanner from './components/ErrorBanner';
import AuthScreen from './components/AuthScreen';
import WelcomeSuccess from './components/WelcomeSuccess';

const TOUR_STEPS: { targetId?: string; title: string; content: string; tab?: string; position?: 'top' | 'bottom' | 'left' | 'right' | 'center' }[] = [
  {
    title: "Welcome to GigFix!",
    content: "The ultimate platform for finding fast jobs, professional services, and local marketplace deals.",
    tab: "GiGs"
  },
  {
    targetId: "tour-wallet",
    title: "Your Wallet",
    content: "Manage your GigCoins here. You'll need them to promote your posts or use premium features.",
    position: "bottom"
  },
  {
    targetId: "tour-profile",
    title: "Your Profile",
    content: "Keep your professional details updated to build trust and get verified.",
    position: "bottom"
  },
  {
    targetId: "tour-tab-gigs",
    title: "Find Gigs",
    content: "Browse current work opportunities or post a task you need help with.",
    tab: "GiGs",
    position: "top"
  },
  {
    targetId: "tour-post-gig",
    title: "Post a Gig",
    content: "Need something done? Simply tap here to create a new gig post.",
    tab: "GiGs",
    position: "top"
  },
  {
    targetId: "tour-tab-seekers",
    title: "Service Providers",
    content: "Looking for a professional? Browse profiles of talented individuals ready to work.",
    tab: "Seekers",
    position: "top"
  },
  {
    targetId: "tour-tab-selling",
    title: "Marketplace",
    content: "Buy and sell equipment, tools, or anything else you need for your projects.",
    tab: "Selling",
    position: "top"
  },
  {
    targetId: "tour-tab-chat",
    title: "Secure Messaging",
    content: "Chat directly with buyers, sellers, and service providers to finalize deals.",
    tab: "Chat",
    position: "top"
  },
  {
    targetId: "tour-tab-wanted",
    title: "Wanted Section",
    content: "Can't find what you need? Post a 'Wanted' ad to let others know what you are looking for.",
    tab: "Wanted",
    position: "top"
  }
];

function AppMain() {
  const { error: dataError } = useData();
  const { error: userError, isAuthenticated, isRegistered } = useUser() || { error: null, isAuthenticated: false, isRegistered: false };
  const databaseError = dataError || userError;

  const [activeTab, setActiveTab] = useState('GiGs');
  const [chatTarget, setChatTarget] = useState<string | null>(null);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);
  const [isCreatingGig, setIsCreatingGig] = useState(false);
  const [isCreatingSeeker, setIsCreatingSeeker] = useState(false);
  const [isCreatingSelling, setIsCreatingSelling] = useState(false);
  const [isCreatingWanted, setIsCreatingWanted] = useState(false);
  const [isViewingGig, setIsViewingGig] = useState(false);
  const [isViewingSeeker, setIsViewingSeeker] = useState(false);
  const [isViewingSelling, setIsViewingSelling] = useState(false);
  const [isViewingWanted, setIsViewingWanted] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTopup, setShowTopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleChatRequest = (id: string, initialMessage?: string) => {
    setChatTarget(id);
    if (initialMessage) {
      setChatInitialMessage(initialMessage);
    }
    setActiveTab('Chat');
  };

  const switchTab = (tab: string) => {
    if (tab === 'Chat') {
      setChatTarget(null);
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (!isAuthenticated) return <AuthScreen />;
    if (!isRegistered) return <WelcomeSuccess />;

    switch (activeTab) {
      case 'GiGs':
        return <GigsPage onNavigate={switchTab} onChatRequest={handleChatRequest} onToggleForm={setIsCreatingGig} onToggleView={setIsViewingGig} />;
      case 'Seekers':
        return <SeekersPage onToggleForm={setIsCreatingSeeker} onChatRequest={handleChatRequest} onToggleView={setIsViewingSeeker} />;
      case 'Selling':
        return <SellingPage onToggleForm={setIsCreatingSelling} onChatRequest={handleChatRequest} onToggleView={setIsViewingSelling} />;
      case 'Wanted':
        return <WantedPage onToggleForm={setIsCreatingWanted} onChatRequest={handleChatRequest} onToggleView={setIsViewingWanted} />;
      case 'Chat':
        return <ChatPage onNavigate={switchTab} preSelectedContactId={chatTarget} initialMessage={chatInitialMessage} onInitialMessageSent={() => setChatInitialMessage(null)} />;
      default:
        return <p className="mt-2 text-gray-600">Content for {activeTab} goes here.</p>;
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-white flex items-center justify-center text-black select-none overflow-hidden"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-0.5">
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-4xl font-black tracking-tighter"
                >
                  Time
                </motion.span>

                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  className="inline-block"
                >
                  <span className="text-4xl font-black tracking-tighter text-[#FF0000]">
                    GiG
                  </span>
                </motion.div>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100"
              >
                <div className="flex gap-0.5 h-3">
                  <div className="w-4 bg-[#007A4D]"></div>
                  <div className="w-4 bg-[#FFB612]"></div>
                  <div className="w-4 bg-[#002395]"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Exclusive to South Africa</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(!isAuthenticated || !isRegistered) ? (
          <div className="h-screen overflow-y-auto">
            {renderContent()}
          </div>
      ) : (
      <div 
        className={`h-screen flex flex-col relative overflow-hidden ${activeTab !== 'Chat' ? 'pb-24' : ''}`}
        style={{
          backgroundImage: 'url("/src/assets/images/app_wallpaper_1782057480412.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Subtle white overlay for better readability of content */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] pointer-events-none" />
        
        <div className="relative flex flex-col h-full overflow-hidden">
          <Header 
            activeTab={activeTab} 
            onOpenProfile={() => setShowProfileEditor(true)} 
            showTopup={showTopup}
            setShowTopup={setShowTopup}
          />
          <main className={`flex-grow flex flex-col relative ${isViewingGig || isViewingSeeker || isViewingSelling || isViewingWanted || isCreatingGig || isCreatingSeeker || isCreatingSelling || isCreatingWanted ? 'z-[60]' : 'z-10'} ${activeTab === 'Chat' ? 'h-full' : 'px-6 pt-2 pb-6'} overflow-y-auto`}>
            {renderContent()}
          </main>

          <BottomNav 
            activeTab={activeTab} 
            setActiveTab={switchTab}
            isCreatingGig={isCreatingGig}
            isCreatingSeeker={isCreatingSeeker}
            isCreatingSelling={isCreatingSelling}
            isCreatingWanted={isCreatingWanted}
            isViewingGig={isViewingGig}
            isViewingSeeker={isViewingSeeker}
            isViewingSelling={isViewingSelling}
            isViewingWanted={isViewingWanted}
            isToppingUp={showTopup}
          />
        </div>
        
        {showProfileEditor && <ProfileEditor onClose={() => setShowProfileEditor(false)} />}
        
        {databaseError && <ErrorBanner error={databaseError} />}

        {!showSplash && !databaseError && (
          <GuidanceTour 
            steps={TOUR_STEPS} 
            activeTab={activeTab} 
            setActiveTab={switchTab}
            onComplete={() => {}}
          />
        )}
      </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <DataProvider>
      <UserProvider>
        <AppMain />
      </UserProvider>
    </DataProvider>
  );
}


