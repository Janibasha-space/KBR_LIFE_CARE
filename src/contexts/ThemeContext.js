import React, { createContext, useContext } from 'react';

// Light Theme Colors
const lightTheme = {
  primary: '#4A90E2',
  secondary: '#6C757D',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#17A2B8',
  light: '#F8F9FA',
  dark: '#343A40',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#6C757D',
  lightGray: '#E9ECEF',
  mediumGray: '#DEE2E6',
  background: '#F5F5F5',
  cardBackground: '#FFFFFF',
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  border: '#DEE2E6',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  accent: '#FF6B6B',
  medical: '#00B4D8',
  gradientStart: '#4A90E2',
  gradientEnd: '#357ABD',
  
  // KBR specific colors
  kbrBlue: '#4A90E2',
  kbrRed: '#EF4444',
  kbrGreen: '#22C55E',
  kbrPurple: '#8B5CF6',
  kbrOrange: '#F97316',
  
  // Service card colors
  appointmentRed: '#EF4444',
  doctorsBlue: '#4A90E2',
  reportsGreen: '#22C55E',
  profilePurple: '#8B5CF6',
  
  // Status colors
  confirmed: '#22C55E',
  pending: '#F59E0B',
  completed: '#10B981',
  cancelled: '#EF4444',
  
  // Admin colors
  totalUsers: '#FEE2E2',
  appointments: '#DBEAFE',
  revenue: '#D1FAE5',
  activeDoctors: '#F3E8FF'
};

// Dark Theme Colors
const darkTheme = {
  primary: '#5BA3F5',
  secondary: '#8A929A',
  success: '#34D374',
  danger: '#F87171',
  warning: '#FBBF24',
  info: '#38BDF8',
  light: '#1F2937',
  dark: '#F9FAFB',
  white: '#111827',
  black: '#F9FAFB',
  gray: '#9CA3AF',
  lightGray: '#374151',
  mediumGray: '#4B5563',
  background: '#111827',
  cardBackground: '#1F2937',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#374151',
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  accent: '#FF8A80',
  medical: '#22D3EE',
  gradientStart: '#5BA3F5',
  gradientEnd: '#3B82F6',
  
  // KBR specific colors
  kbrBlue: '#5BA3F5',
  kbrRed: '#F87171',
  kbrGreen: '#34D374',
  kbrPurple: '#A78BFA',
  kbrOrange: '#FB923C',
  
  // Service card colors
  appointmentRed: '#F87171',
  doctorsBlue: '#5BA3F5',
  reportsGreen: '#34D374',
  profilePurple: '#A78BFA',
  
  // Status colors
  confirmed: '#34D374',
  pending: '#FBBF24',
  completed: '#22C55E',
  cancelled: '#F87171',
  
  // Admin colors
  totalUsers: '#374151',
  appointments: '#1E3A8A',
  revenue: '#166534',
  activeDoctors: '#4C1D95'
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Always use light theme
  const isDarkMode = false;
  const isLoading = false;

  // No-op function for theme toggle (disabled)
  const toggleTheme = () => {
    // Theme switching disabled - always light mode
  };

  const theme = lightTheme; // Always use light theme

  const contextValue = {
    isDarkMode,
    theme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;