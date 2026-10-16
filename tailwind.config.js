// Config de Tailwind para generar tailwind.css (antes iba inline con el CDN).
// Tras tocar clases en index.html: npx tailwindcss@3.4.17 -i tailwind.input.css -o tailwind.css
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      // Override de paleta semántica para alinear con Technical Intelligence Narrative.
      // Sobrescribe los tonos -200/-300 que ya están en uso por la UI: emerald (success),
      // amber (warning), rose (critical). Mantenemos violet (IA) y slate (neutrals) intactos.
      colors: {
        emerald: { 200: '#6ffbbe', 300: '#4edea3', 500: '#00a572', 900: '#003824' },
        amber:   { 200: '#ffdcc6', 300: '#ffb786', 500: '#df7412', 900: '#502400' },
        rose:    { 200: '#ffdad6', 300: '#ffb4ab', 500: '#93000a', 900: '#690005' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      }
    }
  }
};
