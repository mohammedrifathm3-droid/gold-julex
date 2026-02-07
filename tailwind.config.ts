import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        // Gen-Z Fast Fashion Color Palette
                        background: '#FFFFFF',
                        foreground: '#0F0F0F',
                        
                        // Golden finish colors
                        gold: {
                                50: '#FFFEF7',
                                100: '#FEFCE8',
                                200: '#FEF9C3',
                                300: '#FEF08A',
                                400: '#FDE047',
                                500: '#FACC15',
                                600: '#EAB308',
                                700: '#CA8A04',
                                800: '#A16207',
                                900: '#854D0E',
                                950: '#713F12'
                        },
                        
                        // Neon accents for Gen-Z vibe
                        neon: {
                                pink: '#FF10F0',
                                purple: '#A855F7',
                            blue: '#3B82F6',
                                green: '#10B981'
                        },
                        
                        // Holographic silver
                        holographic: {
                                50: '#F8FAFC',
                                100: '#F1F5F9',
                                200: '#E2E8F0',
                                300: '#CBD5E1',
                                400: '#94A3B8',
                                500: '#64748B',
                                600: '#475569',
                                700: '#334155',
                                800: '#1E293B',
                                900: '#0F172A'
                        },
                        
                        // Deep blacks for contrast
                        deep: {
                                50: '#F8FAFC',
                                100: '#F1F5F9',
                                200: '#E2E8F0',
                                300: '#CBD5E1',
                                400: '#94A3B8',
                                500: '#64748B',
                                600: '#475569',
                                700: '#334155',
                                800: '#1E293B',
                                900: '#0F172A',
                                950: '#020617'
                        },
                        
                        // Keep existing shadcn colors for compatibility
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: '#FACC15', // Gold primary
                                foreground: '#0F0F0F'
                        },
                        secondary: {
                                DEFAULT: '#F1F5F9',
                                foreground: '#0F172A'
                        },
                        muted: {
                                DEFAULT: '#F8FAFC',
                                foreground: '#64748B'
                        },
                        accent: {
                                DEFAULT: '#FF10F0', // Neon pink accent
                                foreground: '#FFFFFF'
                        },
                        destructive: {
                                DEFAULT: '#EF4444',
                                foreground: '#FFFFFF'
                        },
                        border: '#E2E8F0',
                        input: '#E2E8F0',
                        ring: '#FACC15',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                        display: ['Poppins', 'system-ui', 'sans-serif']
                },
                borderRadius: {
                        lg: '1rem',
                        md: '0.75rem',
                        sm: '0.5rem',
                        xl: '1.5rem',
                        '2xl': '2rem'
                },
                boxShadow: {
                        'gold': '0 4px 20px -4px rgba(250, 204, 21, 0.3)',
                        'gold-lg': '0 10px 40px -8px rgba(250, 204, 21, 0.4)',
                        'neon': '0 0 20px rgba(255, 16, 240, 0.3)',
                        'neon-lg': '0 0 40px rgba(255, 16, 240, 0.4)'
                },
                animation: {
                        'float': 'float 3s ease-in-out infinite',
                        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
                        'glow': 'glow 2s ease-in-out infinite'
                },
                keyframes: {
                        float: {
                                '0%, 100%': { transform: 'translateY(0px)' },
                                '50%': { transform: 'translateY(-10px)' }
                        },
                        'pulse-gold': {
                                '0%, 100%': { boxShadow: '0 4px 20px -4px rgba(250, 204, 21, 0.3)' },
                                '50%': { boxShadow: '0 4px 30px -4px rgba(250, 204, 21, 0.6)' }
                        },
                        glow: {
                                '0%, 100%': { opacity: '1' },
                                '50%': { opacity: '0.8' }
                        }
                }
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
