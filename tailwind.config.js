/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                void: '#050505',
                neon: {
                    cyan: '#00F3FF',
                    gold: '#FFD700',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            letterSpacing: {
                widest: '0.2em',
            },
            boxShadow: {
                'glow-cyan': '0 0 20px rgba(0, 243, 255, 0.5)',
                'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
