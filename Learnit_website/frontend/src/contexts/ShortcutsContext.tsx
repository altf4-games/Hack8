import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ShortcutsContextType {
  hasUsedPrevShortcut: boolean;
  hasUsedNextShortcut: boolean;
  markPrevShortcutUsed: () => void;
  markNextShortcutUsed: () => void;
  shouldShowShortcuts: boolean;
}

const ShortcutsContext = createContext<ShortcutsContextType | undefined>(undefined);

export const ShortcutsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasUsedPrevShortcut, setHasUsedPrevShortcut] = useState(false);
  const [hasUsedNextShortcut, setHasUsedNextShortcut] = useState(false);
  
  const markPrevShortcutUsed = () => setHasUsedPrevShortcut(true);
  const markNextShortcutUsed = () => setHasUsedNextShortcut(true);
  
  // Show shortcuts only if both shortcuts haven't been used yet
  const shouldShowShortcuts = !(hasUsedPrevShortcut && hasUsedNextShortcut);
  
  return (
    <ShortcutsContext.Provider 
      value={{ 
        hasUsedPrevShortcut, 
        hasUsedNextShortcut, 
        markPrevShortcutUsed, 
        markNextShortcutUsed,
        shouldShowShortcuts
      }}
    >
      {children}
    </ShortcutsContext.Provider>
  );
};

export const useShortcuts = (): ShortcutsContextType => {
  const context = useContext(ShortcutsContext);
  if (context === undefined) {
    throw new Error('useShortcuts must be used within a ShortcutsProvider');
  }
  return context;
}; 