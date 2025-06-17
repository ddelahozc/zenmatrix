import React from 'react';
import { useTranslation } from 'react-i18next'; // Importa useTranslation
import TaskItem from './TaskItem';
import {
  List,
  Typography,
  Box
} from '@mui/material';

function TaskList({ tasks, onDelete, onEdit }) {
  const { t } = useTranslation(); // Inicializa la función de traducción

  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f8f8', borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {t('noTasksYet')} {/* Usa traducción */}
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </List>
  );
}

export default TaskList;
