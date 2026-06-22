import { useState } from 'react';
import { motion } from 'motion/react';
import { X, ArrowUpRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useUser } from '../UserContext';

interface Props {
  onClose: () => void;
}

export default function TransferModal({ onClose }: Props) {
  const { profile, transferCoins } = useUser();
  const [recipientCode, setRecipientCode] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [status, setStatus] = useState<null | { success: boolean; message: string }>(null);

  const handleTransfer = async () => {
    setStatus(null);
    const amount = Number(amountStr);
    if (!recipientCode.trim() || !amountStr || isNaN(amount)) {
      setStatus({ success: false, message: 'Please enter a valid code and amount.' });
      return;
    }

    const result = await transferCoins(recipientCode, amount);
    setStatus(result);
    if (result.success) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden"
      >
        <div className="p-4 border-b flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-2 flex-1">
            <ArrowUpRight className="w-5 h-5 text-blue-600" /> Transfer
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl text-center mb-6">
            <p className="text-sm text-gray-500 font-medium">Available Balance</p>
            <p className="text-3xl font-bold text-gray-900">{profile.balance.toLocaleString()}c</p>
          </div>

          {status && (
            <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${status.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {status.message}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Receive Code</label>
            <input 
              type="text" 
              placeholder="e.g. GIG-1A2B3C" 
              value={recipientCode}
              onChange={e => setRecipientCode(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Amount to Send</label>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0" 
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">coins</span>
            </div>
          </div>

          <button 
            onClick={handleTransfer}
            disabled={status?.success}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50 mt-4"
          >
            Confirm Transfer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
