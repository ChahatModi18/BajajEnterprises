import React, { createContext, useContext, useState, useEffect } from 'react';

interface HelpContextType {
  isHelpMode: boolean;
  toggleHelpMode: () => void;
}

const HelpContext = createContext<HelpContextType>({
  isHelpMode: true,
  toggleHelpMode: () => {},
});

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHelpMode, setIsHelpMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bajaj_admin_help_mode');
    return saved !== null ? saved === 'true' : true; // Default ON for non-tech friendly guidance
  });

  const toggleHelpMode = () => {
    setIsHelpMode((prev) => {
      const next = !prev;
      localStorage.setItem('bajaj_admin_help_mode', String(next));
      return next;
    });
  };

  return (
    <HelpContext.Provider value={{ isHelpMode, toggleHelpMode }}>
      {children}
    </HelpContext.Provider>
  );
};

export const useHelp = () => useContext(HelpContext);
