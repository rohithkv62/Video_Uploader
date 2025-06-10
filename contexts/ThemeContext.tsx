
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void; // Manual toggle (optional, or remove if purely automatic)
  isAutoThemeApplied: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light'); // Default to light
  const [isAutoThemeApplied, setIsAutoThemeApplied] = useState<boolean>(false);
  const { locationInfo, isLoadingAuth, authStatus } = useAuth(); // Added authStatus

  useEffect(() => {
    // Wait for auth/location info AND for auth to be stable (not in loading state)
    if (isLoadingAuth || !locationInfo) return; 

    const determineTheme = () => {
      const currentHour = new Date().getHours();
      // Condition: 10 AM (10) to 12 PM (11:59:59, so < 12)
      const isSpecificTime = currentHour >= 10 && currentHour < 12; 
      
      if (isSpecificTime && locationInfo.isSouthIndia) {
        setTheme('light');
      } else {
        setTheme('dark');
      }
      setIsAutoThemeApplied(true);
      console.log(`Theme determined: ${isSpecificTime && locationInfo.isSouthIndia ? 'light' : 'dark'} (Time: ${currentHour}, South India: ${locationInfo.isSouthIndia})`);
    };

    determineTheme();
    
    const intervalId = setInterval(determineTheme, 60 * 1000 * 5); // Check every 5 minutes

    return () => clearInterval(intervalId);

  }, [locationInfo, isLoadingAuth, authStatus]); // Re-evaluate if authStatus changes, ensuring location is ready

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => { // Manual override, if needed
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    setIsAutoThemeApplied(false); // Manual override disables auto-logic indication
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isAutoThemeApplied }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
