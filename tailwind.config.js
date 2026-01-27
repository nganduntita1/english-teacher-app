module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#065f46',
        'primary-dark': '#064e3b',
        'primary-light': '#10b981',
        secondary: '#34d399',
        'secondary-light': '#6ee7b7',
        accent: '#14b8a6',
      },
      borderRadius: {
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};
