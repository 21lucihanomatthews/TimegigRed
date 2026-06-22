import { motion } from 'motion/react';
import { X, ArrowDownLeft, Copy, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../UserContext';

interface Props {
  onClose: () => void;
}

export default function ReceiveModal({ onClose }: Props) {
  const { profile } = useUser();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.receiveCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden"
      >
        <div className="p-4 border-b flex items-center gap-3 bg-gray-50">
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-2 flex-1">
            <ArrowDownLeft className="w-5 h-5 text-yellow-600" /> Receive
          </h2>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
             <ArrowDownLeft className="w-10 h-10 text-yellow-600" />
          </div>
          
          <div>
            <p className="text-gray-600 text-sm mb-1">Share this code with the sender</p>
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 relative group cursor-pointer" onClick={handleCopy}>
               <p className="text-3xl font-mono font-black text-gray-900 tracking-wider">
                 {profile.receiveCode}
               </p>
               <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center pointer-events-none">
                  {copied ? <CheckCircle2 className="w-8 h-8 text-blue-600" /> : <Copy className="w-8 h-8 text-blue-600" />}
               </div>
            </div>
            {copied && <p className="text-xs font-bold text-green-600 mt-2">Copied to clipboard!</p>}
          </div>

          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            Other users can enter this code in their Transfer feature to instantly send coins to your wallet.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
