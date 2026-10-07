import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';
import { useStore } from './store/provider';
const light = {
  bg: '#F7F7F7',
  surface: '#FFFFFF',
  ink: '#1C1C1C',
  muted: '#8E8E93',
  border: '#EBEBED',
  primary: '#007AFF',
  onPrimary: '#FFFFFF',
  tint: '#EDF7FF',
  tintInk: '#258DCB',
  lavender: '#F5EDF9',
  lavenderInk: '#B67AC5',
  peach: '#FFF8DF',
  peachInk: '#B39B36',
  blue: '#E6F4FF',
  blueInk: '#359DD8',
  soft: '#F2F2F4',
  rail: '#FAFAFA',
  success: '#52B87D',
  successBg: '#E8F8EF',
  metricBlue: '#0085FF',
  metricBlueEnd: '#66C8F4',
  metricBlack: '#161616',
  metricBlackEnd: '#373737',
};
const dark: typeof light = {
  bg: '#111111',
  surface: '#1E1E1E',
  ink: '#F5F5F5',
  muted: '#9C9CA2',
  border: '#303033',
  primary: '#409CFF',
  onPrimary: '#FFFFFF',
  tint: '#172C40',
  tintInk: '#75C1F2',
  lavender: '#352739',
  lavenderInk: '#CE9DDD',
  peach: '#363120',
  peachInk: '#D6C46C',
  blue: '#1B3043',
  blueInk: '#7CC1F0',
  soft: '#28282A',
  rail: '#171717',
  success: '#7ECEA0',
  successBg: '#20362A',
  metricBlue: '#087DF0',
  metricBlueEnd: '#3BAEDA',
  metricBlack: '#222222',
  metricBlackEnd: '#3B3B3B',
};
const Context = createContext({
  colors: light,
  isDark: false,
  reducedMotion: false,
});
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useStore(),
    system = useColorScheme(),
    [reducedMotion, setReducedMotion] = useState(false);
  const isDark =
    state.preferences.theme === 'dark' ||
    (state.preferences.theme === 'system' && system === 'dark');
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    return () => sub.remove();
  }, []);
  return (
    <Context.Provider
      value={{ colors: isDark ? dark : light, isDark, reducedMotion }}
    >
      {children}
    </Context.Provider>
  );
}
export function useTheme() {
  return useContext(Context);
}
