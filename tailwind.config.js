/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        doodle: ["Comic Sans MS", "Comic Neue", "ui-rounded", "system-ui"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"]
      },
      colors: {
        paper: "#f8f1d8",
        ink: "#1d1b18",
        rule: "#c8d7dd",
        player: "#2368c4",
        enemy: "#c33832"
      },
      boxShadow: {
        doodle: "3px 4px 0 rgba(29, 27, 24, 0.2)"
      }
    }
  },
  plugins: []
};
