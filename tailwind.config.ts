import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sen: ['Sen'],
        quicksand: ['Quicksand'],
        poppins: ['Poppins'],
        consolas: ['Consolas'],
      }
    },
  },
  plugins: [],
} satisfies Config;
