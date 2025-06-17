import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';

function AuthForm({ type, onSubmit, onToggleType }) {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('emailRequired'));
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(err.message || t('unexpectedError'));
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 4, mx: 'auto', borderRadius: 2, boxShadow: 3, maxWidth: 400, mb: 2 }}> {/* Añadido mb: 2 aquí */}
      <Typography variant="h5" component="h2" align="center" gutterBottom>
        {type === 'register' ? t('register') : t('login')}
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
          label={t('password')}
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
          {type === 'register' ? t('register') : t('login')}
        </Button>
        <Button
          fullWidth
          variant="text"
          color="secondary"
          onClick={onToggleType}
        >
          {type === 'register'
            ? t('alreadyHaveAccount')
            : t('noAccountYet')
          }
        </Button>
      </Box>
    </Paper>
  );
}

export default AuthForm;
