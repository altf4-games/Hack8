import { useEffect, useRef } from 'react';

interface SwipeNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  minSwipeDistance?: number;
}

export const useSwipeNavigation = ({
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  minSwipeDistance = 50
}: SwipeNavigationProps) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      touchStartX.current = event.touches[0].clientX;
    };

    const handleTouchMove = (event: TouchEvent) => {
      touchEndX.current = event.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (touchStartX.current === null || touchEndX.current === null) return;

      const swipeDistance = touchEndX.current - touchStartX.current;

      if (Math.abs(swipeDistance) >= minSwipeDistance) {
        if (swipeDistance > 0 && canGoPrev) {
          onPrev();
        } else if (swipeDistance < 0 && canGoNext) {
          onNext();
        }
      }

      // Reset touch coordinates
      touchStartX.current = null;
      touchEndX.current = null;
    };

    // Add event listeners
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onNext, onPrev, canGoNext, canGoPrev, minSwipeDistance]);
}; 