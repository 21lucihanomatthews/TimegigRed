import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, X, ShieldAlert, ArrowLeft } from 'lucide-react';
import { storage } from '../lib/storage';

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title || !description) return;
    
    setIsSending(true);
    try {
      await storage.savePromotion({
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        createdAt: Date.now(),
      });
      setTitle('');
      setDescription('');
      alert('Promotion sent successfully!');
    } catch (err) {
      console.error('Failed to send promotion', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="bg-red-600 px-4 h-16 flex items-center gap-3 text-white">
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <ShieldAlert size={20} />
            <h2 className="font-black italic tracking-tighter uppercase text-lg">Admin Panel</h2>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">Create a new promotion to send to all users as a notification.</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Discount Unleashed"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell your users why they should be excited..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
          
          <button 
            onClick={handleSend}
            disabled={!title || !description || isSending}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Send Notification
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
