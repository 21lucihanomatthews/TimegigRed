import React from 'react';
import { motion } from 'motion/react';
import SafeImage from './SafeImage';

interface ConnectionRopeProps {
  ownerAvatar: string;
  seekerAvatar: string;
  progress: number; // 0 to 1
}

const ConnectionRope: React.FC<ConnectionRopeProps> = ({ ownerAvatar, seekerAvatar, progress }) => {
  // progress 0 = maximum distance
  // progress 1 = minimum distance (meeting)
  
  // We use a relative container width and animate the distance
  const maxGap = 160; // max gap in pixels
  const minGap = 10;   // min gap when meeting
  
  const currentGap = maxGap - (maxGap - minGap) * progress;

  return (
    <div id="connection-rope-container" className="flex flex-col items-center justify-center py-8 px-6 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 mb-6 shadow-2xl relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[100%] bg-emerald-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-50%] right-[-20%] w-[100%] h-[100%] bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="flex items-center justify-center w-full relative h-24">
        {/* Owner (Static position on left) */}
        <div className="flex flex-col items-center z-10 shrink-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-[3px] border-emerald-500 p-1 shadow-2xl shadow-emerald-500/30 bg-white ring-4 ring-emerald-500/10">
              <SafeImage src={ownerAvatar} className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-700 mt-2 uppercase tracking-[0.2em]">Gig Owner</span>
        </div>

        {/* The Animated Rope */}
        <div className="flex-grow flex items-center justify-center relative min-w-[20px]" style={{ width: currentGap }}>
          <svg className="w-full h-12 overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <filter id="ropeGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* The Slack in the rope (Bezier curve) */}
            {/* When progress is low, curve is deep. When progress is high, curve is flat. */}
            <motion.path
                animate={{ 
                    d: `M 0 24 Q ${currentGap / 2} ${24 + (1 - progress) * 40} ${currentGap} 24`,
                    strokeOpacity: 0.8 + (progress * 0.2)
                }}
                transition={{ type: 'spring', stiffness: 40, damping: 12 }}
                fill="none"
                stroke="url(#ropeGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="1, 8"
                className="filter-[ropeGlow]"
            />
            
            {/* Tension accents */}
            <motion.path
                animate={{ 
                    d: `M 0 24 Q ${currentGap / 2} ${24 + (1 - progress) * 40} ${currentGap} 24`,
                    pathLength: [0, 1]
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                fill="none"
                stroke="white"
                strokeWidth="1"
                strokeOpacity="0.3"
                strokeLinecap="round"
            />
          </svg>
          
          {/* Heart icon that appears when they get close */}
          {progress > 0.85 && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
              >
                  <div className="text-rose-500 text-xl font-bold">❤️</div>
              </motion.div>
          )}
        </div>

        {/* Seeker */}
        <div className="flex flex-col items-center z-10 shrink-0">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-[3px] border-blue-500 p-1 shadow-2xl shadow-blue-500/30 bg-white ring-4 ring-blue-500/10">
              <SafeImage src={seekerAvatar} className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <span className="text-[10px] font-black text-blue-700 mt-2 uppercase tracking-[0.2em]">Gig Seeker</span>
        </div>
      </div>
      
      {/* Connection Info */}
      <div className="mt-8 w-full max-w-[240px]">
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Connection Milestone</span>
            <span className="text-xs font-bold text-gray-800">
                {progress < 0.3 ? 'Introducing...' : 
                 progress < 0.6 ? 'Establishing Trust' :
                 progress < 0.9 ? 'Finalizing Details' : 'Deal Reached!'}
            </span>
          </div>
          <span className="text-sm font-mono text-emerald-600 font-black italic">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="h-2 w-full bg-gray-100/50 rounded-full p-0.5 overflow-hidden border border-gray-200">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 1 }}
          />
        </div>
      </div>
      
      {/* Floating Sparkles for High Progress */}
      {progress > 0.7 && (
          <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-400 opacity-50"
                    animate={{ 
                        y: [-20, -100], 
                        x: [(i-2) * 50, (i-2) * 60],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                    }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 1.5 + i * 0.5, 
                        delay: i * 0.2 
                    }}
                    style={{ left: `${40 + i * 5}%`, bottom: '10%' }}
                  >
                      ✨
                  </motion.div>
              ))}
          </div>
      )}
    </div>
  );
};

export default ConnectionRope;
