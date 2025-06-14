import React, { useState, useEffect } from 'react';
// Importaciones de Material UI
import {
  Container,
  Typography,
  Divider,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
// Importaciones de react-toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // ¡IMPORTANTE: importar los estilos CSS de react-toastify!

// Importaciones de tus componentes locales
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('');
  const [filterProject, setFilterProject] = useState('');

  // --- Nuevo estado para ordenamiento ---
  const [sortBy, setSortBy] = useState('createdAt_desc'); // Campo por el que ordenar y dirección

  // Función para construir los parámetros de consulta URL
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    if (filterPriority) {
      params.append('priority', filterPriority);
    }
    if (filterCompleted !== '') {
      params.append('isCompleted', filterCompleted);
    }
    if (filterProject) {
      params.append('proyecto', filterProject);
    }
    // Nuevo: Añadir parámetros de ordenamiento
    if (sortBy) {
      const [field, direction] = sortBy.split('_');
      params.append('sortBy', field);
      params.append('sortDirection', direction);
    }
    return params.toString();
  };

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
      toast.error(`Error al cargar las tareas: ${e.message}`); // Mensaje toast de error
    } finally {
      setLoading(false);
    }
  };

  // useEffect se ejecuta cuando el componente se monta O cuando los filtros u ordenamiento cambian
  useEffect(() => {
    fetchTasks();
  }, [searchTerm, filterPriority, filterCompleted, filterProject, sortBy]); // Nuevo: sortBy en dependencias

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
      // En lugar de añadir directamente, recargar la lista para asegurar el orden correcto
      fetchTasks();
      setError(null);
      toast.success('¡Tarea creada con éxito!');
    } catch (e) {
      console.error("Error creating task:", e);
      setError(e);
      toast.error(`Error al crear la tarea: ${e.message}`);
    }
  };

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
      // Recargar la lista para asegurar que el ordenamiento se mantenga correcto
      fetchTasks();
      setEditingTask(null);
      setError(null);
      toast.success('¡Tarea actualizada con éxito!');
    } catch (e) {
      console.error("Error updating task:", e);
      setError(e);
      toast.error(`Error al actualizar la tarea: ${e.message}`);
    }
  };

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

      // Recargar la lista para asegurar que el ordenamiento se mantenga correcto
      fetchTasks();
      setError(null);
      toast.success('¡Tarea eliminada con éxito!');
    } catch (e) {
      console.error("Error deleting task:", e);
      setError(e);
      toast.error(`Error al eliminar la tarea: ${e.message}`);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterPriority('');
    setFilterCompleted('');
    setFilterProject('');
    toast.info('Filtros limpiados.');
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

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

      {/* --- Seccion de Filtrado, Búsqueda y Ordenamiento --- */}
      <Box sx={{ mb: 4, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>Opciones de Visualización</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'flex-end' }}>
          <TextField
            label="Buscar por Título/Descripción"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <TextField
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

          {/* Nuevo: Selector de Ordenamiento */}
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              label="Ordenar por"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="createdAt_desc">Fecha Creación (desc)</MenuItem>
              <MenuItem value="createdAt_asc">Fecha Creación (asc)</MenuItem>
              <MenuItem value="fechaVencimiento_asc">Fecha Vencimiento (asc)</MenuItem>
              <MenuItem value="fechaVencimiento_desc">Fecha Vencimiento (desc)</MenuItem>
              <MenuItem value="prioridad_asc">Prioridad (asc)</MenuItem>
              <MenuItem value="prioridad_desc">Prioridad (desc)</MenuItem>
              <MenuItem value="titulo_asc">Título (A-Z)</MenuItem>
              <MenuItem value="titulo_desc">Título (Z-A)</MenuItem>
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
      {/* --- Fin Seccion de Filtrado, Búsqueda y Ordenamiento --- */}

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
