import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Mantener el CSS global si tienes
import App from './App';
import reportWebVitals from './reportWebVitals';

// Importaciones de Material UI para el tema
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // Para aplicar estilos base de CSS de forma consistente

// 1. Define tu tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#80DEEA', // Azul pastel claro (similar a un turquesa suave)
      light: '#B2EBF2', // Tono más claro
      dark: '#4DD0E1',  // Tono más oscuro
      contrastText: '#212121', // Texto oscuro para contraste en fondos claros
    },
    secondary: {
      main: '#E1BEE7', // Morado pastel claro (similar a lavanda)
      light: '#F3E5F5', // Tono más claro
      dark: '#CE93D8',  // Tono más oscuro
      contrastText: '#212121',
    },
    // Puedes definir otros colores como error, warning, info, success, etc.
    // O extender la paleta para colores personalizados
    background: {
      default: '#f8f9fa', // Un fondo muy claro para la aplicación
      paper: '#ffffff',   // Fondo para componentes como Paper, Card
    },
  },
  typography: {
    fontFamily: ['Roboto', 'Inter', 'sans-serif'].join(','), // Prioriza Roboto, luego Inter (si está cargado), luego genérico
    // Ajustes de tamaño de fuente para hacerlas más pequeñas y fáciles de leer
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 500 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '0.9rem' }, // Texto de cuerpo estándar
    body2: { fontSize: '0.8rem' }, // Texto de cuerpo secundario/pequeño
    button: { fontSize: '0.85rem', textTransform: 'none' }, // Botones con texto más pequeño y sin mayúsculas automáticas
    caption: { fontSize: '0.75rem' },
    overline: { fontSize: '0.7rem' },
  },
  components: {
    // Aquí puedes personalizar componentes específicos
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordes más redondeados para los botones
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordes más redondeados para Paper (usado en cuadrantes, contenedores)
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Hacer que todos los TextField sean outline por defecto
        size: 'small',       // Todos los TextField más pequeños por defecto
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'outlined', // Hacer que todos los Select sean outline por defecto
        size: 'small',       // Todos los Select más pequeños por defecto
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 'bold', // Hacer que el texto del Chip sea negrita
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. Envuelve tu aplicación con ThemeProvider y CssBaseline */}
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* CssBaseline: Resetea CSS para una consistencia entre navegadores y aplica el tema */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
