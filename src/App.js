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
  ToggleButton,
  ToggleButtonGroup,
  AppBar, // Nuevo: para la barra de navegación
  Toolbar, // Nuevo: para la barra de herramientas dentro del AppBar
} from '@mui/material';
// Importaciones de react-toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importaciones de tus componentes locales
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import EisenhowerMatrix from './EisenhowerMatrix';
import AuthForm from './AuthForm'; // Nuevo: Importa el componente de autenticación
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

  const [viewMode, setViewMode] = useState('list');

  // --- NUEVOS ESTADOS PARA AUTENTICACIÓN ---
  const [user, setUser] = useState(null); // Almacena la información del usuario autenticado
  const [authFormType, setAuthFormType] = useState('login'); // 'login' o 'register'

  // Efecto para verificar si hay un token en localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Aquí, en una app real, verificarías la validez del token con el backend
      // Por ahora, simplemente asumimos que si hay token, el usuario está logueado
      // Puedes decodificar el token para obtener info del user si es necesario
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false); // Ya no es 'loading' la primera vez si solo verificamos token
  }, []);

  // Efecto para cargar tareas solo si el usuario está autenticado
  useEffect(() => {
    if (user) { // Solo cargar tareas si hay un usuario logueado
      fetchTasks();
    } else {
      setTasks([]); // Limpiar tareas si no hay usuario
      setLoading(false); // Asegurarse de que no esté en estado de carga si no hay usuario
    }
  }, [user, searchTerm, filterPriority, filterCompleted, filterProject, sortBy, currentPage, limitPerPage, viewMode]);


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
    const token = localStorage.getItem('token'); // Obtener token

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}` // Enviar el token en los headers
        }
      });
      if (!response.ok) {
        if (response.status === 401) { // Si no autorizado, desloguear
          handleLogout();
          toast.error('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
          return;
        }
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


  // --- NUEVAS FUNCIONES DE AUTENTICACIÓN ---
  const handleAuthSubmit = async (email, password) => {
    const endpoint = authFormType === 'register' ? '/api/register' : '/api/login';
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Credenciales inválidas.');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Guardar el token
      localStorage.setItem('user', JSON.stringify(data.user)); // Guardar info del usuario
      setUser(data.user); // Actualizar el estado del usuario
      toast.success(data.message || (authFormType === 'register' ? 'Registro exitoso!' : 'Inicio de sesión exitoso!'));
    } catch (e) {
      console.error(`Error en ${authFormType}:`, e);
      toast.error(`Error en ${authFormType}: ${e.message}`);
      throw e; // Re-lanzar para que AuthForm pueda mostrar su error local
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); // Limpiar el estado del usuario
    setTasks([]); // Limpiar tareas
    setEditingTask(null); // Limpiar cualquier tarea en edición
    toast.info('Sesión cerrada correctamente.');
  };
  // --- FIN NUEVAS FUNCIONES DE AUTENTICACIÓN ---


  const handleCreateTask = async (taskData) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('No autenticado. Por favor, inicia sesión.'); return; }

    try {
      const taskToSend = { ...taskData };
      if (taskToSend.fechaVencimiento) {
        taskToSend.fechaVencimiento = new Date(taskToSend.fechaVencimiento).toISOString();
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Enviar token
        },
        body: JSON.stringify(taskToSend),
      });

      if (!response.ok) {
        if (response.status === 401) { handleLogout(); toast.error('Sesión expirada o no autorizada. Inicia sesión.'); return; }
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
    const token = localStorage.getItem('token');
    if (!token) { toast.error('No autenticado. Por favor, inicia sesión.'); return; }

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Enviar token
        },
        body: JSON.stringify(taskToSend),
      });

      if (!response.ok) {
        if (response.status === 401) { handleLogout(); toast.error('Sesión expirada o no autorizada. Inicia sesión.'); return; }
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
    const token = localStorage.getItem('token');
    if (!token) { toast.error('No autenticado. Por favor, inicia sesión.'); return; }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Enviar token
        }
      });

      if (!response.ok) {
        if (response.status === 401) { handleLogout(); toast.error('Sesión expirada o no autorizada. Inicia sesión.'); return; }
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
    if (newMode !== null) {
      setViewMode(newMode);
      if (newMode === 'matrix') {
        setCurrentPage(1);
      }
    }
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 0, mb: 0, p: 0, bgcolor: 'background.default', boxShadow: 0, borderRadius: 0 }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* Barra de navegación */}
      <AppBar position="static" sx={{ bgcolor: 'primary.dark' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
            ZenMatrix
          </Typography>
          {user && ( // Mostrar nombre del usuario y botón de logout si está autenticado
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ color: 'white' }}>
                Hola, {user.email}
              </Typography>
              <Button color="inherit" onClick={handleLogout} sx={{ color: 'white', borderColor: 'white' }}>
                Cerrar Sesión
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}> {/* Contenido principal con padding */}
        {!user ? ( // Si no hay usuario autenticado, mostrar el formulario de autenticación
          <AuthForm
            type={authFormType}
            onSubmit={handleAuthSubmit}
            onToggleType={() => setAuthFormType(prev => prev === 'login' ? 'register' : 'login')}
          />
        ) : (
          // Si el usuario está autenticado, mostrar el contenido principal de la app
          <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
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

                {viewMode === 'list' && (
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

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  aria-label="text alignment"
                  sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}
                >
                  <ToggleButton value="list" aria-label="vista de lista">
                    <Typography>Lista</Typography>
                  </ToggleButton>
                  <ToggleButton value="matrix" aria-label="vista de matriz">
                    <Typography>Matriz</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

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
                {totalPages > 1 && (
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
                  tasks={tasks}
                  onDelete={handleDeleteTask}
                  onEdit={setEditingTask}
                />
              </>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default App;
