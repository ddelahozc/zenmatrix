import React from 'react';
import { useTranslation } from 'react-i18next'; // Importa useTranslation
import {
  ListItem,
  ListItemText,
  Button,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function TaskItem({ task, onDelete, onEdit }) {
  const { t } = useTranslation(); // Inicializa la función de traducción

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgente-Importante': return 'error';
      case 'No Urgente-Importante': return 'warning';
      case 'Urgente-No Importante': return 'info';
      case 'No Urgente-No Importante': return 'success';
      default: return 'default';
    }
  };

  return (
    <ListItem
      sx={{
        mb: 2,
        p: 2,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        boxShadow: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
          <ListItemText
            primary={task.titulo}
            primaryTypographyProps={{ variant: 'h6', component: 'span', mr: 1 }}
            sx={{ m: 0, '& .MuiListItemText-primary': { fontWeight: 'bold' } }}
          />
          <Chip
            label={t(task.prioridad.replace(/ /g, '')) || task.prioridad} /* Traduce la prioridad si hay espacios */
            color={getPriorityColor(task.prioridad)}
            size="small"
            sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">{t('project')}: {task.proyecto}</Typography> {/* Usa traducción */}
        <Typography variant="body2" color="text.secondary">{t('responsible')}: {task.responsable}</Typography> {/* Usa traducción */}
        {task.descripcion && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
            {t('description')}: {task.descripcion} {/* Usa traducción */}
          </Typography>
        )}
        {task.fechaVencimiento && (
          <Typography variant="body2" color="text.secondary">
            {t('dueDate')}: {new Date(task.fechaVencimiento).toLocaleDateString()} {/* Usa traducción */}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {t('completed')}: {task.isCompleted ? t('yes') : t('no')} {/* Usa traducción para Sí/No */}
        </Typography>
        {task.fechaTerminada && (
          <Typography variant="body2" color="text.secondary">
            {t('finishedDate')}: {new Date(task.fechaTerminada).toLocaleDateString()} {/* Usa traducción */}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onEdit(task)}
          startIcon={<EditIcon />}
        >
          {t('editTask')} {/* Usa traducción */}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => onDelete(task.id)}
          startIcon={<DeleteIcon />}
        >
          {t('deleteTask')} {/* Usa traducción */}
        </Button>
      </Box>
    </ListItem>
  );
}

export default TaskItem;
