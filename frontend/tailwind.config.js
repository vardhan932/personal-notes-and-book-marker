/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#6366f1", // indigo-500
                secondary: "#ec4899", // pink-500
                background: "#0f172a", // slate-900
                surface: "#1e293b", // slate-800
            }
        },
    },
    plugins: [],
}
