import type { Config } from "tailwindcss";
import resolveConfig from 'tailwindcss/resolveConfig'

const theme = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'daintree': '#011F26',
        'zircon': '#eef3ff',
        'ship-cove': '#748dc1',
        'metallic': '#2d4b81',
      }
    },
    fontFamily: {
      'sans': ['Outfit', 'sans-serif'],
    }
  },
  plugins: [],
} satisfies Config;

export const useTW = () => {
  return resolveConfig(theme);
}

export const useColors = () => {
  return useTW().theme.colors;
}

export default theme;