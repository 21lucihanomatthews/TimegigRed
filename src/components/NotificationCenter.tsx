import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, Trash2, ArrowLeft } from 'lucide-react';
import { storage } from '../lib/storage';
import { UserNotification } from '../types';

interface NotificationCenterProps {
  notifications: UserNotification[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function NotificationCenter({ notifications, onClose, onRefresh }: NotificationCenterProps) {
  const handleMarkRead = async (id: string) => {
    await storage.markAsRead(id);
    onRefresh();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await storage.deleteNotification(id);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[600px] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="px-4 h-16 flex items-center gap-3 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2 flex-grow">
            <Bell className="text-[#FF0000]" size={18} />
            <h2 className="font-black italic tracking-tighter uppercase text-lg text-black underline decoration-[#FF0000] decoration-2 underline-offset-4">Notifications</h2>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
              <Bell size={48} className="mb-4 opacity-10" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {notifications.map((notif) => (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-2xl border ${notif.read ? 'bg-white border-gray-100' : 'bg-red-50/50 border-red-100'} relative transition-colors pr-10`}
                  onClick={() => !notif.read && handleMarkRead(notif.id)}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {!notif.read && (
                      <div className="w-2 h-2 bg-[#FF0000] rounded-full" />
                    )}
                    <button
                      onClick={(e) => handleDelete(e, notif.id)}
                      className="text-gray-400 hover:text-red-500 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${notif.read ? 'bg-gray-100' : 'bg-red-100 text-[#FF0000]'} h-fit`}>
                      <Info size={18} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-black ${notif.read ? 'opacity-70' : ''}`}>{notif.title}</h3>
                      <p className={`text-sm text-gray-600 mt-1 leading-relaxed ${notif.read ? 'opacity-70' : ''}`}>{notif.message}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block uppercase tracking-wider font-medium">
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
}
