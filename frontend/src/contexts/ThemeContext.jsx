// src/contexts/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context
const ThemeContext = createContext();

// 2. Create a custom hook to easily use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 3. Create the ThemeProvider component
export const ThemeProvider = ({ children }) => {
  // State to manage the current theme mode ('light' or 'dark')
  const [theme, setTheme] = useState('light');

  // Effect to apply the theme class to the document body
  useEffect(() => {
    document.body.className = `${theme}-mode`; // Add/replace the class
    // console.log(`Theme changed to: ${theme}`); // For debugging
  }, [theme]);

  // Effect to load saved theme preference or detect system preference on initial mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      setTheme(savedTheme); // Load saved theme
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark'); // Detect system preference
    }
  }, []);

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('app-theme', newTheme); // Save preference
      return newTheme;
    });
  };

  // Provide the theme state and toggle function to children components
  const value = {
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
