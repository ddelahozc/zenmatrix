import React, { useState, useEffect } from 'react';
import {
  TextField, // Componente de input de texto estilizado de MUI
  Button, // Componente de botón estilizado de MUI
  Select, // Componente de selector (dropdown) de MUI
  MenuItem, // Opciones para el componente Select
  FormControl, // Wrapper para inputs con label y helper text
  InputLabel, // Label para FormControl
  Checkbox, // Componente de checkbox
  FormControlLabel, // Para asociar un label a un Checkbox
  Box, // Componente genérico para organizar elementos con espaciado
  Typography // Para manejar títulos y textos dentro del formulario
} from '@mui/material';

function TaskForm({ onSubmit, initialTask = null, onCancelEdit }) {
  // Estado local del formulario para los datos de la tarea
  const [task, setTask] = useState({
    proyecto: '',
    responsable: '',
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    prioridad: '',
    isCompleted: false, // Añadir estado de completado para el formulario
    fechaTerminada: '' // Añadir fecha de terminada para el formulario
  });

  // useEffect se usa para cargar los datos de la tarea inicial si estamos en modo edición
  useEffect(() => {
    if (initialTask) {
      setTask({
        ...initialTask,
        // Formatear las fechas para que sean compatibles con el input type="date"
        fechaVencimiento: initialTask.fechaVencimiento ? new Date(initialTask.fechaVencimiento).toISOString().split('T')[0] : '',
        fechaTerminada: initialTask.fechaTerminada ? new Date(initialTask.fechaTerminada).toISOString().split('T')[0] : ''
      });
    } else {
      // Si no hay tarea inicial (modo creación), resetear el formulario
      setTask({
        proyecto: '',
        responsable: '',
        titulo: '',
        descripcion: '',
        fechaVencimiento: '',
        prioridad: '',
        isCompleted: false,
        fechaTerminada: ''
      });
    }
  }, [initialTask]); // Se ejecuta cada vez que initialTask cambia

  // Manejador de cambios para todos los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask(prev => ({
      ...prev,
      // Manejar el valor para checkboxes vs. otros inputs
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejador de envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario (recarga de página)
    onSubmit(task); // Llamar a la función onSubmit que se pasa desde el componente padre (App.js)
  };

  return (
    // Box es un componente de MUI que actúa como un div con más capacidades de estilo
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
      {/* Título del formulario que cambia entre 'Editar' y 'Crear' */}
      <Typography variant="h6" gutterBottom align="center">{initialTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}</Typography>

      {/* Campo de texto para el título de la tarea */}
      <TextField
        fullWidth // Ocupa todo el ancho disponible
        margin="normal" // Margen estándar superior e inferior
        label="Título" // Etiqueta del campo
        name="titulo" // Nombre para identificar el campo en el estado
        value={task.titulo} // Valor controlado por el estado
        onChange={handleChange} // Manejador de cambios
        required // Campo requerido
      />
      {/* Campo de texto para el proyecto */}
      <TextField
        fullWidth
        margin="normal"
        label="Proyecto"
        name="proyecto"
        value={task.proyecto}
        onChange={handleChange}
        required
      />
      {/* Campo de texto para el responsable */}
      <TextField
        fullWidth
        margin="normal"
        label="Responsable"
        name="responsable"
        value={task.responsable}
        onChange={handleChange}
        required
      />
      {/* Selector para la prioridad */}
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="prioridad-label">Prioridad</InputLabel>
        <Select
          labelId="prioridad-label"
          label="Prioridad" // Este label se muestra cuando el Select no está enfocado
          name="prioridad"
          value={task.prioridad}
          onChange={handleChange}
        >
          <MenuItem value="">Selecciona una prioridad</MenuItem>
          <MenuItem value="Urgente-Importante">Urgente-Importante</MenuItem>
          <MenuItem value="No Urgente-Importante">No Urgente-Importante</MenuItem>
          <MenuItem value="Urgente-No Importante">Urgente-No Importante</MenuItem>
          <MenuItem value="No Urgente-No Importante">No Urgente-No Importante</MenuItem>
        </Select>
      </FormControl>
      {/* Campo de texto multilinea para la descripción */}
      <TextField
        fullWidth
        margin="normal"
        label="Descripción"
        name="descripcion"
        value={task.descripcion || ''} // Usar cadena vacía si es null/undefined
        onChange={handleChange}
        multiline // Habilita múltiples líneas (textarea)
        rows={3} // Número inicial de filas
      />
      {/* Campo de fecha para la fecha de vencimiento */}
      <TextField
        fullWidth
        margin="normal"
        label="Fecha Vencimiento"
        type="date" // Tipo de input HTML5 para fecha
        name="fechaVencimiento"
        value={task.fechaVencimiento || ''}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }} // Asegura que el label se "encoge" siempre para fechas
      />

      {/* Campos adicionales que solo se muestran en modo edición */}
      {initialTask && (
        <>
          {/* Checkbox para indicar si la tarea está completada */}
          <FormControlLabel
            control={
              <Checkbox
                checked={task.isCompleted}
                onChange={handleChange}
                name="isCompleted"
              />
            }
            label="Completada"
            sx={{ mt: 1, mb: 1 }} // Margen superior e inferior
          />
          {/* Campo de fecha para la fecha de terminación (solo si la tarea está completada) */}
          {task.isCompleted && (
            <TextField
              fullWidth
              margin="normal"
              label="Fecha Terminada"
              type="date"
              name="fechaTerminada"
              value={task.fechaTerminada || ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </>
      )}

      {/* Botones de acción del formulario */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained" // Botón con fondo
          color="primary" // Color primario de tu tema MUI
        >
          {initialTask ? 'Actualizar Tarea' : 'Añadir Tarea'} {/* Texto dinámico del botón */}
        </Button>
        {initialTask && ( // Solo mostrar el botón "Cancelar" en modo edición
          <Button
            type="button"
            variant="outlined" // Botón con solo borde
            color="secondary" // Color secundario
            onClick={onCancelEdit} // Función para cancelar la edición
          >
            Cancelar
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default TaskForm;
