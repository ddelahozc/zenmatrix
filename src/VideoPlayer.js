import React from 'react';
import { useTranslation } from 'react-i18next'; // Importa useTranslation
import { Box, Typography, Paper, Grid } from '@mui/material';

function VideoPlayer() {
  const { t } = useTranslation(); // Inicializa la función de traducción

  // Scripts para los videos (inspirados en la estética de monje oriental)
  // Ahora las claves de los scripts son las claves de traducción
  const videoScripts = {
    appExplanation: {
      titleKey: "video1Title", // Clave de traducción para el título
      scriptKeys: [ // Claves de traducción para cada línea del script
        "video1Line1", "video1Line2", "video1Line3", "video1Line4",
        "video1Line5", "video1Line6", "video1Line7"
      ],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=abcdefgh" // URL de video placeholder
    },
    eisenhowerMatrix: {
      titleKey: "video2Title", // Clave de traducción para el título
      scriptKeys: [ // Claves de traducción para cada línea del script
        "video2Line1", "video2Line2", "video2Line3", "video2Line4",
        "video2Line5", "video2Line6", "video2Line7"
      ],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=12345678" // URL de video placeholder
    }
  };

  return (
    <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
        {t('videoPlayerTitle')} {/* Usa traducción para el título principal */}
      </Typography>

      <Grid container spacing={4}>
        {/* Video 1: Explicación de la Aplicación */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom align="center">
              {t(videoScripts.appExplanation.titleKey)} {/* Usa traducción para el título del video */}
            </Typography>
            <Box sx={{ width: '100%', height: 0, paddingBottom: '56.25%', position: 'relative', mb: 2 }}>
              <iframe
                src={videoScripts.appExplanation.videoUrl}
                title={t(videoScripts.appExplanation.titleKey)} // Usa traducción para el título del iframe
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              ></iframe>
            </Box>
            <Box sx={{ maxHeight: '150px', overflowY: 'auto', p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
              {videoScripts.appExplanation.scriptKeys.map((key, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  {t(key)} {/* Usa traducción para cada línea del script */}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Video 2: Explicación de la Matriz de Eisenhower */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom align="center">
              {t(videoScripts.eisenhowerMatrix.titleKey)} {/* Usa traducción para el título del video */}
            </Typography>
            <Box sx={{ width: '100%', height: 0, paddingBottom: '56.25%', position: 'relative', mb: 2 }}>
              <iframe
                src={videoScripts.eisenhowerMatrix.videoUrl}
                title={t(videoScripts.eisenhowerMatrix.titleKey)} // Usa traducción para el título del iframe
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              ></iframe>
            </Box>
            <Box sx={{ maxHeight: '150px', overflowY: 'auto', p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
              {videoScripts.eisenhowerMatrix.scriptKeys.map((key, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  {t(key)} {/* Usa traducción para cada línea del script */}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default VideoPlayer;
