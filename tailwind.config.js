module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F7F7F7',
        foreground: '#1C1C1C',
        primary: '#007AFF',
        'primary-foreground': '#FFFFFF',
        secondary: '#EDF7FF',
        muted: '#F2F2F4',
        'muted-foreground': '#8E8E93',
        border: '#EBEBED',
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: { xl: '16px', '2xl': '18px' },
    },
  },
  plugins: [],
};
