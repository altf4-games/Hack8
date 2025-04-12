'use client'
import React, { useState, useEffect } from 'react';
import { Glasses, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ARVRNavButtonProps {
  isARVRPage: boolean;
}

const ARVRNavButton: React.FC<ARVRNavButtonProps> = ({ isARVRPage }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSparkleVisible, setIsSparkleVisible] = useState<boolean>(false);

  useEffect(() => {
    if (isHovered) {
      setIsSparkleVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsSparkleVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <motion.a
      href="/arvr"
      className={`relative font-medium flex items-center space-x-2 px-3 py-2 rounded-lg ${
        isARVRPage
          ? 'text-amber-800 hover:text-amber-900 bg-amber-100/40'
          : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
      }`}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative">
        <Glasses className={`h-5 w-5 ${
          isARVRPage ? 'text-amber-800' : 'text-gray-600 dark:text-gray-300'
        }`} />
        
        {isSparkleVisible && (
          <motion.div 
            className="absolute -top-1 -right-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
          </motion.div>
        )}
      </div>
      
      <span>AR/VR</span>
      
      {/* "Coming Soon" tag */}
      <motion.div 
        className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
        initial={{ scale: 0.9, opacity: 0.9 }}
        animate={{ 
          scale: [0.9, 1, 0.9],
          opacity: [0.9, 1, 0.9]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        Soon
      </motion.div>
      
      {/* Highlight effect for current page */}
      {isARVRPage && (
        <motion.div 
          className="absolute inset-0 rounded-lg bg-amber-200/20 -z-10"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.2, 0.4, 0.2],
            boxShadow: [
              "0 0 0px rgba(251, 191, 36, 0)",
              "0 0 8px rgba(251, 191, 36, 0.3)",
              "0 0 0px rgba(251, 191, 36, 0)"
            ]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      )}
    </motion.a>
  );
};

export default ARVRNavButton;