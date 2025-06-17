import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Importaciones de Material UI para el tema
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Importaciones de i18n
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar los archivos de traducción
import translationES from './locales/es/translation.json';
import translationEN from './locales/en/translation.json';

// 1. Configura i18next
i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Pasa la instancia de i18n a react-i18next
  .init({
    fallbackLng: 'es', // Idioma de respaldo si el idioma detectado no está disponible
    debug: false, // Desactiva el modo debug en producción (true para depuración)
    interpolation: {
      escapeValue: false, // React ya se encarga de esto (escapa los valores de forma segura)
    },
    resources: {
      es: {
        translation: translationES, // Carga las traducciones en español
      },
      en: {
        translation: translationEN, // Carga las traducciones en inglés
      },
    },
    detection: {
      order: ['localStorage', 'navigator'], // Orden de detección de idioma
      caches: ['localStorage'], // Guarda el idioma detectado en localStorage
    }
  });

// Define tu tema personalizado de Material UI
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
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: ['Roboto', 'Inter', 'sans-serif'].join(','),
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 500 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem' },
    button: { fontSize: '0.85rem', textTransform: 'none' },
    caption: { fontSize: '0.75rem' },
    overline: { fontSize: '0.7rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Envuelve tu aplicación con ThemeProvider (MUI) y CssBaseline, y también con i18n */}
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
