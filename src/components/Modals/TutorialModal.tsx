import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TutorialModalProps {
  activeTutorial: {
    icon: React.ReactNode;
    title: string;
    description: string;
  } | null;
  setActiveTutorial: (tutorial: any | null) => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({
  activeTutorial,
  setActiveTutorial
}) => {
  return (
    <AnimatePresence>
      {activeTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl relative overflow-hidden mx-4"
          >
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
            
            <div className="mb-6 inline-flex p-4 bg-zinc-800 rounded-2xl text-cyan-400 shadow-inner">
              {activeTutorial.icon}
            </div>
            
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">
              {activeTutorial.title}
            </h2>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              {activeTutorial.description}
            </p>
            
            <button
              onClick={() => setActiveTutorial(null)}
              className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs shadow-lg shadow-white/10"
            >
              Begrepen!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TutorialModal;
