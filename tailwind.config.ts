import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)', 
				'gradient-warm': 'var(--gradient-warm)',
				'gradient-hero': 'var(--gradient-hero)'
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
				'warm': 'var(--shadow-warm)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
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
				"fade-in": {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				"fade-out": {
					"0%": {
						opacity: "1",
						transform: "translateY(0)"
					},
					"100%": {
						opacity: "0",
						transform: "translateY(10px)"
					}
				},
				"scale-in": {
					"0%": {
						transform: "scale(0.95)",
						opacity: "0"
					},
					"100%": {
						transform: "scale(1)",
						opacity: "1"
					}
				},
				"scale-out": {
					from: { transform: "scale(1)", opacity: "1" },
					to: { transform: "scale(0.95)", opacity: "0" }
				},
				"slide-in-right": {
					"0%": { transform: "translateX(100%)" },
					"100%": { transform: "translateX(0)" }
				},
				"slide-out-right": {
					"0%": { transform: "translateX(0)" },
					"100%": { transform: "translateX(100%)" }
				},
				"float": {
					"0%, 100%": { 
						transform: "translateY(0px)" 
					},
					"50%": { 
						transform: "translateY(-10px)" 
					}
				},
				"gentle-bounce": {
					"0%, 100%": { 
						transform: "translateY(0px) scale(1)" 
					},
					"50%": { 
						transform: "translateY(-5px) scale(1.02)" 
					}
				},
				"teaching-gesture": {
					"0%, 100%": { 
						transform: "translateY(0px) rotate(0deg)" 
					},
					"25%": { 
						transform: "translateY(-8px) rotate(2deg)" 
					},
					"50%": { 
						transform: "translateY(-12px) rotate(-1deg)" 
					},
					"75%": { 
						transform: "translateY(-6px) rotate(1deg)" 
					}
				},
				"gentle-wave": {
					"0%, 100%": { 
						transform: "translateX(0px) translateY(0px)" 
					},
					"33%": { 
						transform: "translateX(3px) translateY(-4px)" 
					},
					"66%": { 
						transform: "translateX(-2px) translateY(-8px)" 
					}
				},
				"subtle-nod": {
					"0%, 100%": { 
						transform: "translateY(0px) scale(1)" 
					},
					"50%": { 
						transform: "translateY(-3px) scale(1.01)" 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				"fade-in": "fade-in 0.3s ease-out",
				"fade-out": "fade-out 0.3s ease-out",
				"scale-in": "scale-in 0.2s ease-out",
				"scale-out": "scale-out 0.2s ease-out",
				"slide-in-right": "slide-in-right 0.3s ease-out",
				"slide-out-right": "slide-out-right 0.3s ease-out",
				"float": "float 3s ease-in-out infinite",
				"gentle-bounce": "gentle-bounce 2s ease-in-out infinite",
				"pulse-glow": "pulse-glow 2s ease-in-out infinite",
				"teaching-gesture": "teaching-gesture 4s ease-in-out infinite",
				"gentle-wave": "gentle-wave 3.5s ease-in-out infinite",
				"subtle-nod": "subtle-nod 2.5s ease-in-out infinite"
			},
			backgroundSize: {
				'gradient-radial': 'radial-gradient(circle, transparent 20%, slategray 20%, slategray 80%, transparent 80%, transparent)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
