import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper, // Para el contenedor del formulario
} from '@mui/material';

function AuthForm({ type, onSubmit, onToggleType }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para errores específicos de autenticación

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiar errores previos

    if (!email || !password) {
      setError('Por favor, ingresa tu email y contraseña.');
      return;
    }

    try {
      // type será 'register' o 'login'
      await onSubmit(email, password);
      // Si onSubmit tiene éxito, los errores se manejarán en App.js
    } catch (err) {
      // Errores de red o si onSubmit arroja un error que no sea handled por Toast
      setError(err.message || 'Ocurrió un error inesperado.');
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 4, maxWidth: 400, mx: 'auto', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" component="h2" align="center" gutterBottom>
        {type === 'register' ? 'Registrarse' : 'Iniciar Sesión'}
      </Typography>
      {error && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 2 }}
        >
          {type === 'register' ? 'Registrarse' : 'Iniciar Sesión'}
        </Button>
        <Button
          fullWidth
          variant="text"
          color="secondary"
          onClick={onToggleType}
        >
          {type === 'register'
            ? '¿Ya tienes una cuenta? Inicia Sesión'
            : '¿No tienes una cuenta? Regístrate'
          }
        </Button>
      </Box>
    </Paper>
  );
}

export default AuthForm;
