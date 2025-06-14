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
  Pagination,
  Stack,
  ToggleButton, // Nuevo: para alternar vista
  ToggleButtonGroup, // Nuevo: para agrupar ToggleButtons
} from '@mui/material';
// Importaciones de react-toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importaciones de tus componentes locales
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import EisenhowerMatrix from './EisenhowerMatrix'; // Nuevo: Importa el componente de la matriz
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
  const [sortBy, setSortBy] = useState('createdAt_desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(5);
  const [totalTasks, setTotalTasks] = useState(0);

  // Nuevo estado para controlar la vista: 'list' o 'matrix'
  const [viewMode, setViewMode] = useState('list'); // Por defecto, mostrar la lista

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
    if (sortBy) {
      const [field, direction] = sortBy.split('_');
      params.append('sortBy', field);
      params.append('sortDirection', direction);
    }
    // La paginación solo se aplica a la vista de lista
    if (viewMode === 'list') {
      params.append('page', currentPage);
      params.append('limit', limitPerPage);
    }
    return params.toString();
  };

  const fetchTasks = async () => {
    setLoading(true);
    const queryParams = buildQueryParams();
    const url = `http://localhost:5000/api/tasks${queryParams ? `?${queryParams}` : ''}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data.tasks);
      setTotalTasks(data.totalCount);
      setError(null);
    } catch (e) {
      console.error("Error fetching tasks:", e);
      setError(e);
      toast.error(`Error al cargar las tareas: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // useEffect ahora depende de viewMode también para ajustar la query params
  useEffect(() => {
    fetchTasks();
  }, [searchTerm, filterPriority, filterCompleted, filterProject, sortBy, currentPage, limitPerPage, viewMode]);

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
    setSortBy('createdAt_desc');
    setCurrentPage(1);
    toast.info('Filtros y ordenamiento limpiados.');
  };

  const totalPages = Math.ceil(totalTasks / limitPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleLimitChange = (event) => {
    setLimitPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) { // Asegurarse de que no sea null (cuando se deselecciona un toggle)
      setViewMode(newMode);
      // Cuando cambias a la vista de matriz, no tiene sentido la paginación,
      // así que cargamos todas las tareas (el backend lo manejará sin 'page'/'limit')
      if (newMode === 'matrix') {
        setCurrentPage(1); // Resetear a página 1 si vuelves a la lista
      }
    }
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
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

      {/* --- Seccion de Filtrado, Búsqueda, Ordenamiento y Selección de Vista --- */}
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

          {/* Selector de Ordenamiento */}
          {viewMode === 'list' && ( // Solo mostrar el ordenamiento en vista de lista
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
          )}

          {/* Selector de Tareas por Página (solo en vista de lista) */}
          {viewMode === 'list' && (
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Tareas por Pág.</InputLabel>
              <Select
                value={limitPerPage}
                label="Tareas por Pág."
                onChange={handleLimitChange}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
            sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}
          >
            Limpiar Filtros
          </Button>

          {/* Toggle para cambiar la vista */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="text alignment"
            sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}
          >
            <ToggleButton value="list" aria-label="vista de lista">
              <Typography>Vista de Lista</Typography>
            </ToggleButton>
            <ToggleButton value="matrix" aria-label="vista de matriz">
              <Typography>Vista de Matriz</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      {/* --- Fin Seccion de Filtrado, Búsqueda y Ordenamiento --- */}

      {/* Renderizado condicional de la lista o la matriz */}
      {viewMode === 'list' ? (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            Tus Tareas (Vista de Lista)
          </Typography>
          <TaskList
            tasks={tasks}
            onDelete={handleDeleteTask}
            onEdit={setEditingTask}
          />
          {totalPages > 1 && ( // Mostrar paginación solo si hay más de una página y es vista de lista
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Stack spacing={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            </Box>
          )}
        </>
      ) : (
        <>
          <Typography variant="h5" component="h2" gutterBottom>
            Tus Tareas (Vista de Matriz)
          </Typography>
          <EisenhowerMatrix
            tasks={tasks} // Pasa todas las tareas para que la matriz las categorice
            onDelete={handleDeleteTask}
            onEdit={setEditingTask}
          />
        </>
      )}
    </Container>
  );
}

export default App;
