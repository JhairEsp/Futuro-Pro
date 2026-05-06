import React from 'react';
import { motion } from 'framer-motion';

const FloatingBrain: React.FC = () => {
  return (
    <div className="h-40 w-full flex items-center justify-center bg-indigo-50/50 rounded-2xl mb-6 overflow-hidden relative">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10"
      >
        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/40">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/>
          </svg>
        </div>
      </motion.div>
      
      {/* Decorative particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-indigo-300 rounded-full"
          animate={{
            y: [0, -40, 0],
            x: [0, (i % 2 === 0 ? 20 : -20), 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          style={{
            left: `${20 + (i * 12)}%`,
            top: '60%',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingBrain;
