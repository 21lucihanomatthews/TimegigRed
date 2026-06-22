import { BriefcaseBusiness, MessagesSquare, UserCheck, Store, Target } from 'lucide-react';
import { useUser } from '../UserContext';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCreatingGig: boolean;
  isCreatingSeeker: boolean;
  isCreatingSelling: boolean;
  isCreatingWanted: boolean;
  isViewingGig?: boolean;
  isViewingSeeker?: boolean;
  isViewingSelling?: boolean;
  isViewingWanted?: boolean;
  isToppingUp?: boolean;
}

export default function BottomNav({ 
  activeTab, 
  setActiveTab, 
  isCreatingGig, 
  isCreatingSeeker, 
  isCreatingSelling, 
  isCreatingWanted, 
  isViewingGig, 
  isViewingSeeker, 
  isViewingSelling, 
  isViewingWanted,
  isToppingUp
}: Props) {
  const { messages, profile } = useUser();

  const unreadCount = messages.filter(m => m.toId === profile.id && !m.isRead).length;

  const navItems = [
    { name: 'GiGs', icon: BriefcaseBusiness },
    { name: 'Seekers', icon: UserCheck },
    { name: 'Chat', icon: MessagesSquare, badge: unreadCount > 0 ? unreadCount : null },
    { name: 'Selling', icon: Store },
    { name: 'Wanted', icon: Target },
  ];

  if (activeTab === 'Chat' || isCreatingGig || isCreatingSeeker || isCreatingSelling || isCreatingWanted || isViewingGig || isViewingSeeker || isViewingSelling || isViewingWanted || isToppingUp) {
    return null;
  }

  const tourIds: Record<string, string> = {
    'GiGs': 'tour-tab-gigs',
    'Seekers': 'tour-tab-seekers',
    'Chat': 'tour-tab-chat',
    'Selling': 'tour-tab-selling',
    'Wanted': 'tour-tab-wanted'
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 bg-white border-t border-gray-200 flex justify-around items-center px-4 z-50 shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;
        return (
          <button
            key={item.name}
            id={tourIds[item.name]}
            onClick={() => setActiveTab(item.name)}
            className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="relative">
              <Icon size={24} />
              {item.badge !== undefined && item.badge !== null && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] border-2 border-white text-center shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
