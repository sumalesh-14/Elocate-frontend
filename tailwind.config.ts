import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22c55e', // emerald-500 equivalent to --go-green
        // Chatbot Colors
        eco: {
          50: '#f2fcf5',
          100: '#e1f8e8',
          200: '#c5efd4',
          300: '#9be2b8',
          400: '#6acc95',
          500: '#43b073',
          600: '#31925b',
          700: '#28754b',
          800: '#235d3d',
          900: '#1d4c33',
          950: '#0e2b1d',
        },
        tech: {
          lime: '#bef264', // lime-300
          teal: '#2dd4bf', // teal-400
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        cuprum: ['var(--ff-cuprum)', 'sans-serif'],
        poppins: ['var(--ff-poppins)', 'sans-serif'],
        display: ['var(--ff-poppins)', 'sans-serif'], // Mapping display font to Poppins for now
      },
      spacing: {

        '120': "30rem",
        '128': '32rem',
        '140': '35rem',
        '200': '50rem',
        '240': '60rem',
        '256': '64rem',
      },
      height: {
        '104': '26rem',
        '128': '32rem',
        '140': '35rem',
        '200': '50rem',
        '240': '60rem',
        '336': '84rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-top': 'slide-in-from-top 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
export default config
