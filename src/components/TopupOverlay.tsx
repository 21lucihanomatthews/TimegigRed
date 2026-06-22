import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coins, Upload, CheckCircle2, ChevronRight, Copy, RefreshCw, ArrowLeft } from 'lucide-react';
import { useUser } from '../UserContext';

const OPTIONS = [
  { coins: 50, price: 'R5,00' },
  { coins: 100, price: 'R10,00' },
  { coins: 200, price: 'R20,00' },
  { coins: 500, price: 'R39,99' },
  { coins: 1500, price: 'R59,99' },
  { coins: 2500, price: 'R79,99' },
];

interface Props {
  onClose: () => void;
}

export default function TopupOverlay({ onClose }: Props) {
  const { submitTopup } = useUser();
  const [step, setStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<{coins: number, price: string} | null>(null);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [proofDataUrl, setProofDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Read actual file content to base64 so admin can view it in local storage mock 
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image object to resize
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 800px to avoid large base64 strings in localStorage
          const MAX_DIMENSION = 800;
          if (width > height && width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          } else if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setProofDataUrl(dataUrl);
          setProofUploaded(true);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
  };

  const handleSubmit = () => {
    if (!selectedOption || !proofDataUrl) return;
    setIsSubmitting(true);
    setTimeout(() => {
      submitTopup(selectedOption.coins, selectedOption.price, proofDataUrl);
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b bg-white flex justify-between items-center sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Topup Coins</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4 text-center">Select a package to refill your wallet balance.</p>
              <div className="grid grid-cols-2 gap-3">
                {OPTIONS.map(opt => (
                  <button 
                    key={opt.coins}
                    onClick={() => { setSelectedOption(opt); setStep(2); }}
                    className="bg-white border-2 border-gray-200 hover:border-yellow-400 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition"
                  >
                    <Coins className="w-8 h-8 text-yellow-500" />
                    <span className="font-bold text-lg text-gray-900">{opt.coins}c</span>
                    <span className="text-sm font-medium text-gray-500">{opt.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && selectedOption && !submitted && (
            <div className="space-y-5">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-center">
                <p className="text-sm text-yellow-800 font-medium mb-1">You are purchasing</p>
                <p className="text-2xl font-bold text-gray-900">{selectedOption.coins} Coins</p>
                <p className="text-lg font-semibold text-gray-600">{selectedOption.price}</p>
              </div>

              <div className="bg-white p-5 rounded-xl border shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-center">Bank Transfer Details</h3>
                <p className="text-xs text-gray-500 text-center mb-4">Please make a payment to the account below, then upload the proof of payment.</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Bank</p>
                      <p className="font-semibold text-gray-800">Capitec</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Account Name</p>
                      <p className="font-semibold text-gray-800">Matthews</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Account Number</p>
                      <p className="font-semibold text-gray-800 tracking-wider">1334067366</p>
                    </div>
                    <button onClick={() => copyToClipboard('1334067366')} className="p-1.5 bg-white shadow-sm border rounded text-blue-600 hover:bg-blue-50">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Reference (Important)</p>
                      <p className="font-semibold text-gray-800">{selectedOption.coins}c</p>
                    </div>
                    <button onClick={() => copyToClipboard(`${selectedOption.coins}c`)} className="p-1.5 bg-white shadow-sm border rounded text-blue-600 hover:bg-blue-50">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border shadow-sm relative overflow-hidden">
                 <h3 className="font-bold text-gray-900 mb-3 text-sm">Upload Proof of Payment</h3>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 cursor-pointer relative">
                   <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                   {proofUploaded ? (
                     <>
                       <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                         <CheckCircle2 className="w-6 h-6 text-green-600" />
                       </div>
                       <p className="font-semibold text-green-700 text-sm">Proof Uploaded</p>
                       <p className="text-xs text-gray-500 mt-1">Tap to change file</p>
                     </>
                   ) : (
                     <>
                       <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                         <Upload className="w-6 h-6 text-blue-500" />
                       </div>
                       <p className="font-medium text-gray-800 text-sm">Tap to browse</p>
                       <p className="text-xs text-gray-500 mt-1">JPG, PNG</p>
                     </>
                   )}
                 </div>
              </div>
            </div>
          )}

          {submitted && (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
              <p className="text-gray-600 max-w-sm text-sm">Your proof of payment has been sent for review. Coins will be transferred to your wallet automatically once approved.</p>
            </div>
          )}
        </div>

        {step === 2 && !submitted && (
          <div className="p-4 border-t bg-white flex gap-3 sticky bottom-0 shrink-0">
             <button onClick={() => setStep(1)} className="p-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition flex items-center justify-center">
               <ArrowLeft size={18} />
             </button>
             <button 
              onClick={handleSubmit} 
              disabled={!proofUploaded || isSubmitting}
              className="flex-[2] py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {isSubmitting ? (
                 <RefreshCw className="w-5 h-5 animate-spin" />
               ) : (
                 <>Submit Application <ChevronRight className="w-4 h-4" /></>
               )}
             </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
