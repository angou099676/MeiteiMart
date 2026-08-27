/** @type {import('tailwindcss').Config} */
export const sharedTailwindPreset = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf3",
          100: "#d6fadf",
          200: "#aef2c1",
          300: "#79e39d",
          400: "#43c977",
          500: "#22ad5c",
          600: "#158a49",
          700: "#136d3d",
          800: "#135634",
          900: "#11472c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default sharedTailwindPreset;
