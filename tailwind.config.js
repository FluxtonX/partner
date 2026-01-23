/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      // ============================================
      // EXISTING: Keep your current shadcn/ui colors
      // ============================================
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          // NEW: Add landing page primary colors (Partner green)
          50: '#e8fdf1',
          100: '#c1fbdb',
          200: '#8ef8bf',
          300: '#5bf5a3',
          400: '#35f38e',
          500: '#00f074', // Main vibrant green
          600: '#00d968',
          700: '#00c05c',
          800: '#00a750',
          900: '#008540',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          // NEW: Add landing page secondary colors
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          // NEW: Add landing page accent colors
          orange: '#ff8c42',
          yellow: '#ffd23f',
          purple: '#8b5cf6',
          blue: '#3b82f6',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        // NEW: Add landing page neutral colors
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // NEW: Add landing page status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },

      // ============================================
      // EXISTING: Keep your current border radius
      // ============================================
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // NEW: Add landing page border radius
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // ============================================
      // NEW: Add landing page typography
      // ============================================
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-sm': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-xl': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-lg': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
      },

      // ============================================
      // NEW: Add landing page spacing
      // ============================================
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ============================================
      // NEW: Add landing page shadows
      // ============================================
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.08)',
        'primary': '0 8px 30px -5px rgba(0, 196, 106, 0.3)',
        'glow': '0 0 30px rgba(0, 196, 106, 0.15)',
      },

      // ============================================
      // NEW: Add landing page background gradients
      // ============================================
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00c46a 0%, #00b35f 100%)',
        'gradient-accent': 'linear-gradient(135deg, #00c46a 0%, #0ea5e9 100%)',
      },

      // ============================================
      // MERGED: Combine animations from both configs
      // ============================================
      keyframes: {
        // Existing shadcn/ui animations
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        // NEW: Landing page animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        // Existing shadcn/ui animations
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // NEW: Landing page animations
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
}