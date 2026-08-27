import sharedPreset from "@meiteimart/ui/tailwind-preset.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [sharedPreset],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
};
