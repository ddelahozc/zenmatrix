import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Box,
  Typography
} from '@mui/material';

function TaskForm({ onSubmit, initialTask = null, onCancelEdit }) {
  const [task, setTask] = useState({
    proyecto: '',
    responsable: '',
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    prioridad: '',
    isCompleted: false,
    fechaTerminada: ''
  });

  // Nuevo estado para los errores de validación
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialTask) {
      setTask({
        ...initialTask,
        fechaVencimiento: initialTask.fechaVencimiento ? new Date(initialTask.fechaVencimiento).toISOString().split('T')[0] : '',
        fechaTerminada: initialTask.fechaTerminada ? new Date(initialTask.fechaTerminada).toISOString().split('T')[0] : ''
      });
    } else {
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
    setErrors({}); // Limpiar errores al cambiar de modo (creación/edición)
  }, [initialTask]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar el error específico del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Nueva función para validar el formulario
  const validate = () => {
    let tempErrors = {};
    // Validación para el campo 'titulo'
    if (!task.titulo) {
      tempErrors.titulo = "El título es obligatorio.";
    } else if (task.titulo.length < 3) {
      tempErrors.titulo = "El título debe tener al menos 3 caracteres.";
    }

    // Validación para el campo 'proyecto'
    if (!task.proyecto) {
      tempErrors.proyecto = "El proyecto es obligatorio.";
    } else if (task.proyecto.length < 3) {
      tempErrors.proyecto = "El proyecto debe tener al menos 3 caracteres.";
    }

    // Validación para el campo 'responsable'
    if (!task.responsable) {
      tempErrors.responsable = "El responsable es obligatorio.";
    } else if (task.responsable.length < 3) {
      tempErrors.responsable = "El responsable debe tener al menos 3 caracteres.";
    }

    // Validación para el campo 'prioridad'
    if (!task.prioridad) {
      tempErrors.prioridad = "La prioridad es obligatoria.";
    }

    // Validación para fecha de vencimiento (opcional, pero si se pone, debe ser válida)
    if (task.fechaVencimiento && isNaN(new Date(task.fechaVencimiento).getTime())) {
      tempErrors.fechaVencimiento = "Fecha de vencimiento inválida.";
    }

    // Validación para fecha terminada (opcional, pero si se pone, debe ser válida)
    if (initialTask && task.isCompleted && task.fechaTerminada && isNaN(new Date(task.fechaTerminada).getTime())) {
      tempErrors.fechaTerminada = "Fecha terminada inválida.";
    }


    setErrors(tempErrors); // Actualizar el estado de errores
    return Object.keys(tempErrors).length === 0; // Devolver true si no hay errores
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) { // Ejecutar validación antes de enviar
      onSubmit(task); // Si la validación pasa, llamar a la función onSubmit del padre
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom align="center">{initialTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}</Typography>

      <TextField
        fullWidth
        margin="normal"
        label="Título"
        name="titulo"
        value={task.titulo}
        onChange={handleChange}
        required
        error={!!errors.titulo} // Pone el campo en estado de error si errors.titulo existe
        helperText={errors.titulo} // Muestra el mensaje de error
      />
      <TextField
        fullWidth
        margin="normal"
        label="Proyecto"
        name="proyecto"
        value={task.proyecto}
        onChange={handleChange}
        required
        error={!!errors.proyecto}
        helperText={errors.proyecto}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Responsable"
        name="responsable"
        value={task.responsable}
        onChange={handleChange}
        required
        error={!!errors.responsable}
        helperText={errors.responsable}
      />
      <FormControl fullWidth margin="normal" required error={!!errors.prioridad}>
        <InputLabel id="prioridad-label">Prioridad</InputLabel>
        <Select
          labelId="prioridad-label"
          label="Prioridad"
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
        {errors.prioridad && <Typography color="error" variant="caption">{errors.prioridad}</Typography>}
      </FormControl>
      <TextField
        fullWidth
        margin="normal"
        label="Descripción"
        name="descripcion"
        value={task.descripcion || ''}
        onChange={handleChange}
        multiline
        rows={3}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Fecha Vencimiento"
        type="date"
        name="fechaVencimiento"
        value={task.fechaVencimiento || ''}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        error={!!errors.fechaVencimiento}
        helperText={errors.fechaVencimiento}
      />

      {initialTask && (
        <>
          <FormControlLabel
            control={
              <Checkbox
                checked={task.isCompleted}
                onChange={handleChange}
                name="isCompleted"
              />
            }
            label="Completada"
            sx={{ mt: 1, mb: 1 }}
          />
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
              error={!!errors.fechaTerminada}
              helperText={errors.fechaTerminada}
            />
          )}
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
        >
          {initialTask ? 'Actualizar Tarea' : 'Añadir Tarea'}
        </Button>
        {initialTask && (
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            onClick={onCancelEdit}
          >
            Cancelar
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default TaskForm;
