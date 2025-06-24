/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        bannerImg: "url(/public/bg1.gif)",
        phoneimg: "url(/public/smbg.gif)",
        tabletimg: "url(/public/md.gif)",
        contimg: "url(/public/paper.jpg)",
      },
      fontFamily: {
        bitter: ['Bitter', 'serif'],
      },
    },
  },
  plugins: [],
};
