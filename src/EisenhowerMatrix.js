import React from 'react';
import {
  Box,
  Typography,
  Paper, // Para los contenedores de los cuadrantes
  List,  // Para la lista de tareas dentro de cada cuadrante
} from '@mui/material';
import TaskItem from './TaskItem'; // Importa el componente TaskItem para mostrar las tareas

function EisenhowerMatrix({ tasks, onDelete, onEdit }) {
  // Función para categorizar las tareas en los cuatro cuadrantes
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
        // En caso de que haya una prioridad no reconocida, ponerla en un default
        console.warn(`Prioridad desconocida: ${task.prioridad}. Tarea: ${task.titulo}`);
        categories['No Urgente-No Importante'].push(task);
      }
    });
    return categories;
  };

  const categorizedTasks = categorizeTasks();

  // Componente auxiliar para renderizar un cuadrante
  const Quadrant = ({ title, tasksInQuadrant, bgColor }) => (
    <Paper sx={{ p: 2, bgcolor: bgColor, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" align="center" gutterBottom sx={{ color: 'black', fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '300px' }}> {/* Área con scroll */}
        {tasksInQuadrant.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
            No hay tareas aquí.
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
        Matriz de Eisenhower
      </Typography>
      <Box className="eisenhower-grid">
        <Quadrant
          title="Urgente - Importante (Hacer)"
          tasksInQuadrant={categorizedTasks['Urgente-Importante']}
          bgColor="#FFCDD2" // Rojo/Rosa Pastel (MUI Red 100)
        />
        <Quadrant
          title="No Urgente - Importante (Planificar)"
          tasksInQuadrant={categorizedTasks['No Urgente-Importante']}
          bgColor="#FFECB3" // Amarillo/Naranja Pastel (MUI Amber 100)
        />
        <Quadrant
          title="Urgente - No Importante (Delegar)"
          tasksInQuadrant={categorizedTasks['Urgente-No Importante']}
          bgColor="#B3E5FC" // Azul Pastel (MUI Light Blue 100)
        />
        <Quadrant
          title="No Urgente - No Importante (Eliminar)"
          tasksInQuadrant={categorizedTasks['No Urgente-No Importante']}
          bgColor="#C8E6C9" // Verde Pastel (MUI Light Green 100)
        />
      </Box>
    </Box>
  );
}

export default EisenhowerMatrix;
