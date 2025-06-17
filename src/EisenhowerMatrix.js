import React from 'react';
import { useTranslation } from 'react-i18next'; // Importa useTranslation
import {
  Box,
  Typography,
  Paper,
  List,
} from '@mui/material';
import TaskItem from './TaskItem';

function EisenhowerMatrix({ tasks, onDelete, onEdit }) {
  const { t } = useTranslation(); // Inicializa la función de traducción

  const categorizeTasks = () => {
    const categories = {
      'Urgente-Importante': [],
      'No Urgente-Importante': [],
      'Urgente-No Importante': [],
      'No Urgente-No Importante': [],
    };

    tasks.forEach(task => {
      if (categories[task.prioridad]) {
        categories[task.prioridad].push(task);
      } else {
        console.warn(`Prioridad desconocida: ${task.prioridad}. Tarea: ${task.titulo}`);
        categories['No Urgente-No Importante'].push(task);
      }
    });
    return categories;
  };

  const categorizedTasks = categorizeTasks();

  const Quadrant = ({ title, tasksInQuadrant, bgColor }) => (
    <Paper sx={{ p: 2, bgcolor: bgColor, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" align="center" gutterBottom sx={{ color: 'black', fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '300px' }}>
        {tasksInQuadrant.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
            {t('noTasksHere')}
          </Typography>
        ) : (
          <List>
            {tasksInQuadrant.map(task => (
              <TaskItem key={task.id} task={task} onDelete={onDelete} onEdit={onEdit} />
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
        {t('eisenhowerMatrixTitle')}
      </Typography>
      <Box className="eisenhower-grid" sx={{ mb: 2 }}> {/* Añadido mb: 2 aquí para forzar la reevaluación */}
        <Quadrant
          title={t('urgentImportantDo')}
          tasksInQuadrant={categorizedTasks['Urgente-Importante']}
          bgColor="#FFCDD2"
        />
        <Quadrant
          title={t('notUrgentImportantPlan')}
          tasksInQuadrant={categorizedTasks['No Urgente-Importante']}
          bgColor="#FFECB3"
        />
        <Quadrant
          title={t('urgentNotImportantDelegate')}
          tasksInQuadrant={categorizedTasks['Urgente-No Importante']}
          bgColor="#B3E5FC"
        />
        <Quadrant
          title={t('notUrgentNotImportantEliminate')}
          tasksInQuadrant={categorizedTasks['No Urgente-No Importante']}
          bgColor="#C8E6C9"
        />
      </Box>
    </Box>
  );
}

export default EisenhowerMatrix;
