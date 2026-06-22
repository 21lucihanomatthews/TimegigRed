import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { useUser } from '../UserContext';

interface TourStep {
  targetId?: string;
  title: string;
  content: string;
  tab?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface Props {
  steps: TourStep[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onComplete: () => void;
}

export default function GuidanceTour({ steps, activeTab, setActiveTab, onComplete }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { profile, updateProfile } = useUser();

  const currentStep = steps[currentStepIndex];

  const updateTargetRect = useCallback(() => {
    if (currentStep?.targetId) {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep?.tab && activeTab !== currentStep.tab) {
      setActiveTab(currentStep.tab);
    }
    
    // Give time for layout to settle after tab change
    const timer = setTimeout(updateTargetRect, 300);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [currentStepIndex, activeTab, currentStep, setActiveTab, updateTargetRect]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    updateProfile({ hasSeenTour: true });
    onComplete();
  };

  if (profile.hasSeenTour || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Overlay Backdrop with cutout */}
      <div className="absolute inset-0 bg-black/60 pointer-events-auto overflow-hidden">
        {targetRect && (
          <motion.div
            layoutId="tour-highlight"
            className="absolute rounded-lg border-2 border-blue-400 bg-white/10"
            animate={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          />
        )}
      </div>

      {/* Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
          animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, scale: 0.9, y: 20, x: "-50%" }}
          className="absolute bg-white rounded-2xl shadow-2xl p-6 w-[calc(100vw-32px)] max-w-[340px] pointer-events-auto border border-gray-100"
          style={{
            left: '50%',
            bottom: targetRect && targetRect.top > window.innerHeight / 2 ? 'auto' : '110px',
            top: targetRect && targetRect.top <= window.innerHeight / 2 ? `${targetRect.bottom + 20}px` : 'auto',
            marginTop: !targetRect ? '20vh' : '0',
            position: !targetRect ? 'fixed' : 'absolute',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Sparkles size={18} />
            </div>
            <h3 className="font-black italic tracking-tighter uppercase text-lg">{currentStep.title}</h3>
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {currentStep.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all ${i === currentStepIndex ? 'w-4 bg-blue-600' : 'w-1.5 bg-gray-200'}`} 
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button 
                  onClick={handleBack} 
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <button 
                onClick={handleNext}
                className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-black italic tracking-tighter uppercase flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95"
              >
                {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStepIndex < steps.length - 1 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
          >
            <X size={18} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
