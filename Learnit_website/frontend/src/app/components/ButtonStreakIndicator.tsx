import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Award } from 'lucide-react';
import { getConsecutiveCorrectCount } from '@/utils/soundEffects';

interface ButtonStreakIndicatorProps {
  className?: string;
}

/**
 * A streak indicator designed to be displayed next to Generate More buttons
 * Styled similarly to the main StreakIndicator but optimized for button areas
 */
export const ButtonStreakIndicator: React.FC<ButtonStreakIndicatorProps> = ({ className = '' }) => {
  const [streak, setStreak] = useState(0);
  const [animateStreak, setAnimateStreak] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  
  // Update streak periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentStreak = getConsecutiveCorrectCount();
      
      if (currentStreak !== streak) {
        setStreak(currentStreak);
        
        // Trigger animation if streak increased
        if (currentStreak > streak) {
          setAnimateStreak(true);
          setTimeout(() => setAnimateStreak(false), 700);
        }
      }
    }, 300);
    
    return () => clearInterval(intervalId);
  }, [streak]);
  
  // Add continuous pulsing animation for high streaks
  useEffect(() => {
    if (streak >= 5) {
      setPulsing(true);
    } else {
      setPulsing(false);
    }
  }, [streak]);
  
  // Don't show anything for streak of 0
  if (streak === 0) return null;
  
  // Different colors based on streak level
  const getStreakColor = () => {
    if (streak >= 20) return 'from-purple-600 to-pink-600 text-white border border-yellow-300';
    if (streak >= 15) return 'from-yellow-500 to-red-500 text-white border border-yellow-300';
    if (streak >= 10) return 'from-yellow-400 to-orange-500 text-white';
    if (streak >= 7) return 'from-orange-400 to-red-500 text-white';
    if (streak >= 5) return 'from-purple-400 to-pink-500 text-white';
    if (streak >= 3) return 'from-indigo-400 to-blue-500 text-white';
    return 'from-blue-400 to-teal-500 text-white';
  };
  
  // Get streak text with additional flair for high streaks
  const getStreakText = () => {
    // Mobile-optimized text (shorter for small screens)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    
    if (streak >= 20) return isMobile ? `${streak}🔥` : `UNSTOPPABLE! ${streak}`;
    if (streak >= 15) return isMobile ? `${streak}🔥` : `AMAZING! ${streak}`;
    if (streak >= 10) return isMobile ? `${streak}🔥` : `EXCELLENT! ${streak}`;
    if (streak >= 7) return isMobile ? `${streak}🔥` : `Awesome! ${streak}`;
    if (streak >= 5) return isMobile ? `${streak}🔥` : `Great! ${streak}`;
    if (streak >= 3) return `Streak: ${streak}`;
    return `Streak: ${streak}`;
  };
  
  // Get streak fire emojis based on streak count
  const getStreakFire = () => {
    if (streak >= 20) return '🔥🔥🔥';
    if (streak >= 10) return '🔥🔥';
    if (streak >= 5) return '🔥';
    return '';
  };
  
  // Hide fire emoji on small screens since we incorporate it into the text
  const shouldShowFireEmoji = () => {
    return typeof window !== 'undefined' && window.innerWidth >= 640 && streak >= 5;
  };
  
  return (
    <div className="relative">
      <motion.div
        className={`rounded-full px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-1 sm:gap-2 bg-gradient-to-r shadow-md ${getStreakColor()} ${className}`}
        animate={animateStreak ? { 
          scale: [1, 1.1, 1], 
          rotate: [0, 3, -3, 0],
        } : pulsing ? {
          scale: [1, 1.03, 1],
          boxShadow: [
            '0 0 0 rgba(255,255,255,0)', 
            '0 0 10px rgba(255,255,255,0.5)', 
            '0 0 0 rgba(255,255,255,0)'
          ]
        } : {}}
        transition={pulsing ? { 
          repeat: Infinity, 
          duration: 1.5
        } : { 
          duration: 0.4 
        }}
      >
        {streak >= 10 ? <Award className="h-3 w-3 sm:h-4 sm:w-4" /> : <Zap className="h-3 w-3 sm:h-4 sm:w-4" />}
        <span className={`font-bold ${streak >= 10 ? 'text-[10px] sm:text-sm' : 'text-[10px] sm:text-xs'} whitespace-nowrap`}>
          {getStreakText()}
        </span>
        
        {/* Fire effect for high streaks - only on larger screens */}
        {shouldShowFireEmoji() && (
          <motion.div 
            className="absolute -top-1 -right-0.5 text-xs sm:text-sm hidden sm:block"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {getStreakFire()}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}; 