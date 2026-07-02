/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#007AFF',
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          teal: '#5AC8FA',
          purple: '#AF52DE',
          pink: '#FF2D55',
          gray: '#8E8E93',
          bg: '#F2F2F7',
          card: '#FFFFFF',
          divider: '#E5E5EA',
          text: '#1C1C1E',
          secondary: '#8E8E93',
        },
      },
      borderRadius: {
        'apple': '16px',
        'apple-lg': '20px',
        'apple-xl': '24px',
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'apple-md': '0 4px 12px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
        'apple-lg': '0 8px 24px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"PingFang SC"', '"Helvetica Neue"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
