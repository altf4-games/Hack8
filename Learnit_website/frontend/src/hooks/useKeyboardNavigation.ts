import { useEffect } from 'react';
import { useShortcuts } from '../contexts/ShortcutsContext';

interface KeyboardNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  nextKey?: string;
  prevKey?: string;
}

export const useKeyboardNavigation = ({
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  nextKey = 'Shift+D',
  prevKey = 'Shift+A'
}: KeyboardNavigationProps) => {
  // Get the shortcuts context
  const { markPrevShortcutUsed, markNextShortcutUsed } = useShortcuts();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if the key combination matches
      const isNextKey = event.shiftKey && event.key.toLowerCase() === 'd';
      const isPrevKey = event.shiftKey && event.key.toLowerCase() === 'a';

      if (isNextKey && canGoNext) {
        event.preventDefault();
        onNext();
        // Mark next shortcut as used
        markNextShortcutUsed();
      } else if (isPrevKey && canGoPrev) {
        event.preventDefault();
        onPrev();
        // Mark prev shortcut as used
        markPrevShortcutUsed();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onNext, onPrev, canGoNext, canGoPrev, markPrevShortcutUsed, markNextShortcutUsed]);
}; 