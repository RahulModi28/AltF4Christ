/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "electric-blue": "#007AFF",
                "acid-green": "#CCFF00",
                "neon-violet": "#BF00FF",
                "dark-grey": "#121212",
                "pitch-black": "#050505",
                "glass-white": "rgba(255, 255, 255, 0.05)",
                "glass-border": "rgba(255, 255, 255, 0.12)",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "sans": ["Inter", "sans-serif"]
            },
        },
    },
    plugins: [],
}
