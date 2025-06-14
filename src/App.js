import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Divider,
  Box,
  TextField, // Para el campo de búsqueda
  Select,    // Para el selector de prioridad
  MenuItem,  // Opciones del selector
  FormControl, // Para envolver el selector con su label
  InputLabel, // Label para el selector
  Button, // Para el botón de limpiar filtros
} from '@mui/material';

import TaskForm from './TaskForm';
import TaskList from './TaskList';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // --- Nuevos estados para filtros y búsqueda ---
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda
  const [filterPriority, setFilterPriority] = useState(''); // Estado para el filtro de prioridad
  const [filterCompleted, setFilterCompleted] = useState(''); // Estado para el filtro de completado (true/false/all)
  const [filterProject, setFilterProject] = useState(''); // Nuevo: Estado para el filtro de proyecto

  // Función para construir los parámetros de consulta URL
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    if (filterPriority) {
      params.append('priority', filterPriority);
    }
    if (filterCompleted !== '') { // Asegurarse de que 'false' o 'true' también se envíen
      params.append('isCompleted', filterCompleted);
    }
    if (filterProject) { // Nuevo: Añadir filtro de proyecto
      params.append('proyecto', filterProject);
    }
    return params.toString();
  };

  // Función asíncrona para cargar las tareas desde la API (actualizada para filtros)
  const fetchTasks = async () => {
    setLoading(true); // Indicar carga al iniciar la petición
    const queryParams = buildQueryParams();
    const url = `http://localhost:5000/api/tasks${queryParams ? `?${queryParams}` : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (e) {
      console.error("Error fetching tasks:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  // useEffect se ejecuta cuando el componente se monta O cuando los filtros cambian
  useEffect(() => {
    fetchTasks();
  }, [searchTerm, filterPriority, filterCompleted, filterProject]); // Nuevo: Añadir filterProject a las dependencias

  // Manejador para crear una nueva tarea (POST) - Sin cambios
  const handleCreateTask = async (taskData) => {
    try {
      const taskToSend = { ...taskData };
      if (taskToSend.fechaVencimiento) {
        taskToSend.fechaVencimiento = new Date(taskToSend.fechaVencimiento).toISOString();
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const createdTask = await response.json();
      setTasks(prevTasks => [...prevTasks, createdTask]);
      setError(null);
      // Después de crear, podríamos querer recargar la lista para aplicar filtros si los hubiera
      // fetchTasks();
    } catch (e) {
      console.error("Error creating task:", e);
      setError(e);
      alert(`Error al crear la tarea: ${e.message}`);
    }
  };

  // Manejador para actualizar una tarea (PUT) - Sin cambios
  const handleUpdateTask = async (taskData) => {
    try {
      const taskToSend = { ...taskData };
      if (taskToSend.fechaVencimiento) {
        taskToSend.fechaVencimiento = new Date(taskToSend.fechaVencimiento).toISOString();
      }
      if (taskToSend.isCompleted && !taskToSend.fechaTerminada) {
        taskToSend.fechaTerminada = new Date().toISOString();
      } else if (!taskToSend.isCompleted && taskToSend.fechaTerminada) {
        taskToSend.fechaTerminada = null;
      } else if (taskToSend.fechaTerminada) {
        taskToSend.fechaTerminada = new Date(taskToSend.fechaTerminada).toISOString();
      }

      const response = await fetch(`http://localhost:5000/api/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(prevTasks =>
        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
      setEditingTask(null);
      setError(null);
    } catch (e) {
      console.error("Error updating task:", e);
      setError(e);
      alert(`Error al actualizar la tarea: ${e.message}`);
    }
  };

  // Manejador para eliminar una tarea (DELETE) - Sin cambios
  const handleDeleteTask = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setError(null);
    } catch (e) {
      console.error("Error deleting task:", e);
      setError(e);
      alert(`Error al eliminar la tarea: ${e.message}`);
    }
  };

  // Manejador para limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterPriority('');
    setFilterCompleted('');
    setFilterProject(''); // Nuevo: Limpiar también el filtro de proyecto
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">Cargando tareas...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Error: {error.message}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, color: 'primary.main' }}>
        ZenMatrix - Matriz de Eisenhower
      </Typography>

      <Typography variant="body1" align="center" sx={{ mb: 3 }}>
        Bienvenido a tu gestor de tareas.
      </Typography>

      {editingTask ? (
        <TaskForm
          onSubmit={handleUpdateTask}
          initialTask={editingTask}
          onCancelEdit={() => setEditingTask(null)}
        />
      ) : (
        <TaskForm onSubmit={handleCreateTask} />
      )}

      <Divider sx={{ my: 4 }} />

      {/* --- Seccion de Filtrado y Búsqueda --- */}
      <Box sx={{ mb: 4, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Filtrar y Buscar Tareas</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <TextField
            label="Buscar por Título/Descripción"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <TextField // Nuevo: Campo de texto para filtrar por proyecto
            label="Filtrar por Proyecto"
            variant="outlined"
            size="small"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Prioridad</InputLabel>
            <Select
              value={filterPriority}
              label="Prioridad"
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="Urgente-Importante">Urgente-Importante</MenuItem>
              <MenuItem value="No Urgente-Importante">No Urgente-Importante</MenuItem>
              <MenuItem value="Urgente-No Importante">Urgente-No Importante</MenuItem>
              <MenuItem value="No Urgente-No Importante">No Urgente-No Importante</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Completado</InputLabel>
            <Select
              value={filterCompleted}
              label="Completado"
              onChange={(e) => setFilterCompleted(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="false">No Completadas</MenuItem>
              <MenuItem value="true">Completadas</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
            sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}
          >
            Limpiar Filtros
          </Button>
        </Box>
      </Box>
      {/* --- Fin Seccion de Filtrado y Búsqueda --- */}

      <Typography variant="h5" component="h2" gutterBottom>
        Tus Tareas
      </Typography>

      <TaskList
        tasks={tasks}
        onDelete={handleDeleteTask}
        onEdit={setEditingTask}
      />
    </Container>
  );
}

export default App;
