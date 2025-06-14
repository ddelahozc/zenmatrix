import React from 'react';
import {
  ListItem, // Representa un elemento de una lista de Material UI
  ListItemText, // Para el texto principal y secundario dentro de un ListItem
  Button, // Componente de botón estilizado de Material UI
  Chip, // Componente de etiqueta (tag) para la prioridad
  Box, // Componente genérico para agrupar y aplicar espaciado/estilos
  Typography, // Para manejar textos con variantes tipográficas
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Icono para eliminar
import EditIcon from '@mui/icons-material/Edit';   // Icono para editar

function TaskItem({ task, onDelete, onEdit }) {
  // Función para obtener el color de la prioridad de Material UI
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgente-Importante': return 'error'; // Rojo (MUI color)
      case 'No Urgente-Importante': return 'warning'; // Naranja (MUI color)
      case 'Urgente-No Importante': return 'info'; // Azul (MUI color)
      case 'No Urgente-No Importante': return 'success'; // Verde (MUI color)
      default: return 'default'; // Color por defecto
    }
  };

  return (
    // ListItem actúa como un contenedor para cada elemento de la lista.
    // Los props 'sx' permiten aplicar estilos de Material UI (sistema de spacing, colores, etc.).
    <ListItem
      sx={{
        mb: 2, // margin-bottom de 2 unidades MUI (por defecto 8px por unidad)
        p: 2,  // padding de 2 unidades MUI
        border: '1px solid #e0e0e0', // Borde ligero
        borderRadius: 2, // Bordes redondeados
        boxShadow: 1, // Sombra sutil
        bgcolor: 'background.paper', // Color de fondo del tema MUI
        display: 'flex', // Usar flexbox para el layout
        flexDirection: { xs: 'column', sm: 'row' }, // Columnas en pantallas pequeñas, filas en grandes
        alignItems: { xs: 'flex-start', sm: 'center' }, // Alineación de ítems
        gap: 2, // Espacio entre ítems en flexbox
      }}
    >
      {/* Contenedor para la información de la tarea, que ocupa el espacio restante */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Contenedor para el título y la etiqueta de prioridad */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
          {/* Texto principal (título de la tarea) */}
          <ListItemText
            primary={task.titulo}
            primaryTypographyProps={{ variant: 'h6', component: 'span', mr: 1 }} // Estilos de tipografía
            sx={{ m: 0, '& .MuiListItemText-primary': { fontWeight: 'bold' } }} // Eliminar margen predeterminado y poner negrita
          />
          {/* Chip para mostrar la prioridad con color dinámico */}
          <Chip
            label={task.prioridad}
            color={getPriorityColor(task.prioridad)} // Color basado en la prioridad
            size="small" // Tamaño pequeño
            sx={{ textTransform: 'uppercase', fontWeight: 'bold' }} // Estilos de texto
          />
        </Box>
        {/* Información adicional de la tarea con tipografía de Material UI */}
        <Typography variant="body2" color="text.secondary">Proyecto: {task.proyecto}</Typography>
        <Typography variant="body2" color="text.secondary">Responsable: {task.responsable}</Typography>
        {task.descripcion && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
            Descripción: {task.descripcion}
          </Typography>
        )}
        {task.fechaVencimiento && (
          <Typography variant="body2" color="text.secondary">
            Vencimiento: {new Date(task.fechaVencimiento).toLocaleDateString()}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          Completada: {task.isCompleted ? 'Sí' : 'No'}
        </Typography>
        {task.fechaTerminada && (
          <Typography variant="body2" color="text.secondary">
            Terminada: {new Date(task.fechaTerminada).toLocaleDateString()}
          </Typography>
        )}
      </Box>
      {/* Contenedor para los botones de acción (Editar y Eliminar) */}
      <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
        <Button
          variant="outlined" // Botón con solo borde
          color="primary" // Color primario del tema
          onClick={() => onEdit(task)} // Función para iniciar la edición
          startIcon={<EditIcon />} // Icono al inicio del botón
        >
          Editar
        </Button>
        <Button
          variant="outlined" // Botón con solo borde
          color="error" // Color de error (rojo)
          onClick={() => onDelete(task.id)} // Función para eliminar la tarea
          startIcon={<DeleteIcon />} // Icono al inicio del botón
        >
          Eliminar
        </Button>
      </Box>
    </ListItem>
  );
}

export default TaskItem;