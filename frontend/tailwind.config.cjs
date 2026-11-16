/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './ficha.html',
    './src/aplicacion/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        fondo: '#FAFAF9',
        superficie: '#FFFFFF',
        borde: '#E7E5E4',
        texto: '#1C1917',
        'texto-suave': '#78716C',
        primario: '#E4684F',
        'primario-suave': '#FDEBE6',
        'primario-oscuro': '#B84A34',
        'verde-profundo': '#2F5D50',
        exito: '#16A34A',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        tarjeta: '10px',
        control: '8px',
      },
      boxShadow: {
        sutil: '0 2px 8px rgb(28 25 23 / 4%)',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};
