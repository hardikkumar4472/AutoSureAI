import React from 'react';
import { motion } from 'framer-motion';
import Logo from '../Assets/AutoSureAI_Logo_New.png';

const Loader = ({ fullScreen = true, size = 'medium', text }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm transition-colors duration-300'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Spinning Outer Ring */}
        <motion.div
           className={`absolute rounded-full border-t-2 border-r-2 border-indigo-500 dark:border-indigo-400 ${
             size === 'small' ? 'w-full h-full' : 'w-[120%] h-[120%]'
           }`}
           animate={{ rotate: 360 }}
           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Counter-Spinning Inner Ring */}
         <motion.div
           className={`absolute rounded-full border-b-2 border-l-2 border-purple-500 dark:border-purple-400 ${
             size === 'small' ? 'w-3/4 h-3/4' : 'w-[140%] h-[140%]'
           } opacity-60`}
           animate={{ rotate: -360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulsing Logo */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`${sizeClasses[size]} rounded-2xl bg-white p-2 shadow-lg z-10`}
        >
          <img 
            src={Logo} 
            alt="Loading..." 
            className="w-full h-full object-contain" 
          />
        </motion.div>
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default Loader;
