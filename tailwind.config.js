/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EFEBE2",
        "paper-raised": "#F6F3EC",
        ink: "#1C2B33",
        "ink-soft": "#4A5A61",
        rule: "#C9C2B4",
        "rule-soft": "#DAD4C6",
        ledger: {
          green: "#2F5233",
          "green-soft": "#E4E9DE",
          brick: "#8B3A2B",
          "brick-soft": "#F1E1DA",
          amber: "#C98A2C",
          "amber-soft": "#F3E4C8",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        "display-lg": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display-md": ["2rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
      },
    },
  },
  plugins: [],
};
