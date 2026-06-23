import React from 'react';
import { motion } from 'motion/react';
import { PartyPopper, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useUser } from '../UserContext';

const WelcomeSuccess: React.FC = () => {
  const { completeRegistration, profile } = useUser();

  return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl shadow-blue-500/10 border border-blue-50 p-10 text-center relative overflow-hidden"
      >
        {/* Floating Sparks */}
        <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-blue-500/10"
                    animate={{ 
                        y: [-20, -100], 
                        x: [(i-3) * 60, (i-3) * 70],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        rotate: [0, 90]
                    }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 3 + i, 
                        delay: i * 0.5 
                    }}
                    style={{ left: `${30 + i * 10}%`, bottom: '20%' }}
                >
                    <Sparkles className="w-12 h-12" />
                </motion.div>
            ))}
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ y: 20 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500 rounded-[2rem] shadow-2xl shadow-emerald-500/20 mb-10 border-4 border-white"
          >
            <PartyPopper className="w-12 h-12 text-white" />
          </motion.div>

          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase mb-4 leading-none">
              Congratulations!
            </h1>
            <p className="text-xl font-bold text-gray-400 max-w-sm mx-auto leading-tight">
              Your account for <span className="text-blue-600 italic">"{profile.contact}"</span> has been created successfully.
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase text-emerald-700 tracking-widest">Verified</p>
                <p className="text-sm font-bold text-emerald-900">Email Address Confirmed</p>
              </div>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={completeRegistration}
            className="w-full bg-gray-900 text-white rounded-2xl py-6 px-4 flex items-center justify-center gap-4 text-lg font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all group"
          >
            Enter Workspace
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeSuccess;
