import React from 'react';
import TaskItem from './TaskItem'; // Importa el componente TaskItem
import {
  List, // Componente de lista de Material UI
  Typography, // Para manejar textos
  Box // Para agrupar y aplicar espaciado
} from '@mui/material';

function TaskList({ tasks, onDelete, onEdit }) {
  // Si no hay tareas, mostrar un mensaje utilizando Typography de MUI
  if (tasks.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f8f8f8', borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No hay tareas aún. ¡Crea una!
        </Typography>
      </Box>
    );
  }

  // Si hay tareas, renderizar una lista de TaskItem utilizando el componente List de MUI
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {tasks.map(task => (
        <TaskItem
          key={task.id} // La key es crucial para el rendimiento y la identificación de elementos en listas
          task={task} // Pasa el objeto de la tarea
          onDelete={onDelete} // Pasa la función para eliminar tareas
          onEdit={onEdit} // Pasa la función para editar tareas
        />
      ))}
    </List>
  );
}

export default TaskList; // <<-- ¡Asegúrate de que esta línea esté presente!
