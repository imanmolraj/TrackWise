export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#a4b6e5ff',
        card: '#d6dae3ff',
        ink: '#3a4f8c',
        muted: '#1c1f35ff',
        accent: '#07761fea'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(196, 181, 181, 0.4)'
      }
    }
  },
  plugins: []
}
