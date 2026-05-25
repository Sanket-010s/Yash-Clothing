/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./store/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A1A1A",
        accent: "#F5A623",
        accentHover: "#FFB94D",
        success: "#27AE60",
        warning: "#F5A623",
        danger: "#C0392B",
        background: "#FFFFFF",
        surface: "#F5F5F5",
        muted: "#999999",
        sold: "#CCCCCC",
        text: {
          primary: "#1A1A1A",
          secondary: "#666666"
        },
        border: "#E0E0E0"
      },
      maxWidth: {
        container: "1280px"
      },
      boxShadow: {
        nav: "0 -3px 10px rgba(0, 0, 0, 0.08)",
        card: "0 1px 4px rgba(0, 0, 0, 0.08)"
      }
    }
  },
  plugins: []
};
