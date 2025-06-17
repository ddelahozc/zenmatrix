import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles'; // Importación clave para el layout
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
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ViewListIcon from '@mui/icons-material/ViewList';
import VideocamIcon from '@mui/icons-material/Videocam';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';


import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import TaskForm from './TaskForm';
import TaskList from './TaskList';
import EisenhowerMatrix from './EisenhowerMatrix';
import AuthForm from './AuthForm';
import VideoPlayer from './VideoPlayer';

import './App.css';

const drawerWidth = 240;

function App() {
  const { t, i18n } = useTranslation();
  const theme = useTheme(); // Accede a las propiedades del tema de Material UI

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

  const [user, setUser] = useState(null);
  const [authFormType, setAuthFormType] = useState('login');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMainView, setSelectedMainView] = useState('tasks');

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);


  // Efecto para verificar si hay un token en localStorage al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false); // Finaliza el estado de carga inicial de la app
  }, []);

  // Efecto para cargar tareas solo si el usuario está autenticado y la vista es 'tasks'
  useEffect(() => {
    if (user && selectedMainView === 'tasks') {
      fetchTasks();
    } else if (!user) { // Si no hay usuario, limpiar tareas y no estar en carga
      setTasks([]);
      setLoading(false);
    } else { // Si no es la vista de tareas, detener la carga y limpiar tareas por si acaso
      setLoading(false);
      setTasks([]);
    }
  }, [user, selectedMainView, searchTerm, filterPriority, filterCompleted, filterProject, sortBy, currentPage, limitPerPage, viewMode]);


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
    // La paginación solo se aplica a la vista de lista cuando la vista principal es 'tasks'
    if (selectedMainView === 'tasks' && viewMode === 'list') {
      params.append('page', currentPage);
      params.append('limit', limitPerPage);
    }
    return params.toString();
  };

  const fetchTasks = async () => {
    setLoading(true);
    const queryParams = buildQueryParams();
    const url = `http://localhost:5000/api/tasks${queryParams ? `?${queryParams}` : ''}`;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}` // Envía el token en los headers para autorización
        }
      });
      if (!response.ok) {
        // Manejo de errores de autenticación/autorización
        if (response.status === 401 || response.status === 403) {
          handleLogout(); // Desloguear si el token es inválido o expirado
          toast.error(t('sessionExpired')); // Mensaje traducido
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
      toast.error(`${t('errorLoadingTasks')} ${e.message}`); // Mensaje traducido
    } finally {
      setLoading(false);
    }
  };


  const handleAuthSubmit = async (email, password) => {
    const endpoint = authFormType === 'register' ? '/api/register' : '/api/login';
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('invalidCredentials')); // Mensaje traducido
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Guarda el token en localStorage
      localStorage.setItem('user', JSON.stringify(data.user)); // Guarda info del usuario
      setUser(data.user); // Actualiza el estado del usuario en la app
      toast.success(data.message || (authFormType === 'register' ? t('registerSuccess') : t('loginSuccess'))); // Mensaje traducido
      setSelectedMainView('tasks'); // Al iniciar sesión, lleva a la vista de tareas
    } catch (e) {
      console.error(`Error en ${authFormType}:`, e);
      toast.error(`${t('error')} en ${authFormType}: ${e.message}`); // Mensaje traducido
      throw e; // Re-lanzar para que AuthForm pueda mostrar su error local
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Limpia el token de localStorage
    localStorage.removeItem('user'); // Limpia info del usuario de localStorage
    setUser(null); // Limpia el estado del usuario
    setTasks([]); // Limpia las tareas
    setEditingTask(null); // Limpia cualquier tarea en edición
    setSelectedMainView('tasks'); // Vuelve a la vista por defecto al cerrar sesión
    toast.info(t('logout')); // Mensaje traducido
  };


  const handleCreateTask = async (taskData) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error(t('notAuthenticated')); return; } // Mensaje traducido

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Envía el token
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        // Manejo de errores de autenticación/autorización
        if (response.status === 401 || response.status === 403) { handleLogout(); toast.error(t('sessionExpired')); return; } // Mensaje traducido
        const errorData = await response.json();
        throw new Error(errorData.error || `${t('error')}! status: ${response.status}`);
      }

      fetchTasks(); // Recarga la lista para reflejar la nueva tarea
      setError(null);
      toast.success(t('taskCreatedSuccess')); // Mensaje traducido
      setSelectedMainView('tasks'); // Vuelve a la vista de tareas después de crear
    } catch (e) {
      console.error("Error creating task:", e);
      setError(e);
      toast.error(`${t('errorCreatingTask')} ${e.message}`); // Mensaje traducido
    }
  };

  const handleUpdateTask = async (taskData) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error(t('notAuthenticated')); return; } // Mensaje traducido

    try {
      const taskToSend = { ...taskData };
      // Ajusta las fechas a ISO string si existen y son válidas
      if (taskToSend.fechaVencimiento) {
        taskToSend.fechaVencimiento = new Date(taskToSend.fechaVencimiento).toISOString();
      }
      if (taskToSend.isCompleted && !taskToSend.fechaTerminada) {
        taskToSend.fechaTerminada = new Date().toISOString();
      } else if (!taskToSend.isCompleted && taskToSend.fechaTerminada) {
        taskToSend.fechaTerminada = null; // Elimina fecha terminada si se desmarca completada
      } else if (taskToSend.fechaTerminada) {
        taskToSend.fechaTerminada = new Date(taskToSend.fechaTerminada).toISOString();
      }

      const response = await fetch(`http://localhost:5000/api/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Envía el token
        },
        body: JSON.stringify(taskToSend),
      });

      if (!response.ok) {
        // Manejo de errores de autenticación/autorización
        if (response.status === 401 || response.status === 403) { handleLogout(); toast.error(t('sessionExpired')); return; } // Mensaje traducido
        const errorData = await response.json();
        throw new Error(errorData.error || `${t('error')}! status: ${response.status}`);
      }

      fetchTasks(); // Recarga la lista para reflejar los cambios
      setEditingTask(null); // Sale del modo edición
      setError(null);
      toast.success(t('taskUpdatedSuccess')); // Mensaje traducido
      setSelectedMainView('tasks'); // Vuelve a la vista de tareas después de actualizar
    } catch (e) {
      console.error("Error updating task:", e);
      setError(e);
      toast.error(`${t('errorUpdatingTask')} ${e.message}`); // Mensaje traducido
    }
  };

  const handleDeleteTask = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error(t('notAuthenticated')); return; } // Mensaje traducido

    // Confirmación antes de eliminar (traducida)
    if (!window.confirm(t('confirmDeleteTask'))) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}` // Envía el token
        }
      });

      if (!response.ok) {
        // Manejo de errores de autenticación/autorización
        if (response.status === 401 || response.status === 403) { handleLogout(); toast.error(t('sessionExpired')); return; } // Mensaje traducido
        throw new Error(`${t('error')}! status: ${response.status}`);
      }

      fetchTasks(); // Recarga la lista para que la tarea eliminada desaparezca
      setError(null);
      toast.success(t('taskDeletedSuccess')); // Mensaje traducido
    } catch (e) {
      console.error("Error deleting task:", e);
      setError(e);
      toast.error(`${t('errorDeletingTask')} ${e.message}`); // Mensaje traducido
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterPriority('');
    setFilterCompleted('');
    setFilterProject('');
    setSortBy('createdAt_desc');
    setCurrentPage(1);
    toast.info(t('filtersCleared')); // Mensaje traducido
  };

  // Calcula el número total de páginas para la paginación
  const totalPages = Math.ceil(totalTasks / limitPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleLimitChange = (event) => {
    setLimitPerPage(parseInt(event.target.value));
    setCurrentPage(1); // Siempre vuelve a la primera página al cambiar el límite
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) { // Asegura que se haya seleccionado un modo
      setViewMode(newMode);
      if (newMode === 'matrix') {
        setCurrentPage(1); // Si cambia a matriz, reinicia la paginación por si vuelve a lista
      }
    }
  };

  // Manejador para abrir/cerrar el Drawer en móvil
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Manejador para los clics en los ítems del menú
  const handleMenuItemClick = (view) => {
    setSelectedMainView(view); // Cambia la vista principal
    setMobileOpen(false); // Cierra el drawer en móvil
    handleClearFilters(); // Limpia los filtros al cambiar de vista para empezar limpio
    if (view !== 'tasks') {
      setViewMode('list'); // Asegura que la vista de tarea se reinicie a 'list' si no es la vista de tareas
    }
  };

  // Manejador para cambiar el idioma
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng); // Cambia el idioma en i18next
    setSelectedLanguage(lng); // Actualiza el estado del selector de idioma
  };

  // Contenido del Drawer (menú lateral)
  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        {t('menuTitle')} {/* Título del menú traducido */}
      </Typography>
      <Divider />
      <List>
        <ListItem button onClick={() => handleMenuItemClick('create')}>
          <AddCircleOutlineIcon sx={{ mr: 2 }} />
          <ListItemText primary={t('createTask')} /> {/* Opción "Crear Tarea" traducida */}
        </ListItem>
        <ListItem button onClick={() => handleMenuItemClick('tasks')}>
          <ViewListIcon sx={{ mr: 2 }} />
          <ListItemText primary={t('viewTasksListMatrix')} /> {/* Opción "Ver Tareas" traducida */}
        </ListItem>
        <ListItem button onClick={() => handleMenuItemClick('videos')}>
          <VideocamIcon sx={{ mr: 2 }} />
          <ListItemText primary={t('explanatoryVideos')} /> {/* Opción "Videos" traducida */}
        </ListItem>
        {/* Selector de Idioma en el menú */}
        <ListItem>
            <LanguageIcon sx={{ mr: 2 }} />
            <FormControl fullWidth size="small">
                <InputLabel>{t('language')}</InputLabel> {/* Etiqueta "Idioma" traducida */}
                <Select
                    value={selectedLanguage}
                    label={t('language')}
                    onChange={(e) => changeLanguage(e.target.value)}
                >
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                </Select>
            </FormControl>
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem button onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 2 }} />
          <ListItemText primary={t('logout')} /> {/* Opción "Cerrar Sesión" traducida */}
        </ListItem>
      </List>
    </Box>
  );


  // Renderizado condicional para la pantalla de login/registro
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 0, mb: 0, p: 0, bgcolor: 'background.default', boxShadow: 0, borderRadius: 0, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <AppBar position="static" sx={{ bgcolor: 'primary.dark' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              ZenMatrix
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <AuthForm
            type={authFormType}
            onSubmit={handleAuthSubmit}
            onToggleType={() => setAuthFormType(prev => prev === 'login' ? 'register' : 'login')}
          />
        </Box>
      </Container>
    );
  }

  // Si el usuario está autenticado, mostrar la aplicación principal con el layout del menú
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline /> {/* Resetea CSS para una consistencia entre navegadores */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* AppBar (barra superior fija) */}
      <AppBar
        position="fixed" // Fija la barra en la parte superior
        sx={{
          // Ancho adaptable: 100% menos el ancho del drawer en pantallas grandes
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          // Margen a la izquierda para acomodar el drawer fijo
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'primary.dark' // Color de fondo del tema
        }}
      >
        <Toolbar>
          {/* Botón de menú (hamburguesa) - visible solo en móviles */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }} // Oculta en escritorio, muestra en móvil
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'white' }}>
            {t('appTitle')} {/* Título de la app traducido */}
          </Typography>
          {user && ( // Muestra información del usuario y botón de logout si está autenticado
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ color: 'white' }}>
                {t('hello')}, {user.email} {/* Saludo traducido */}
              </Typography>
              <Button color="inherit" onClick={handleLogout} sx={{ color: 'white', borderColor: 'white' }}>
                {t('logout')} {/* Botón "Cerrar Sesión" traducido */}
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer (menú lateral) */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} // Ancho fijo en escritorio, permite reducir en móvil
        aria-label="mailbox folders"
      >
        {/* Drawer para móvil (se abre/cierra temporalmente) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Para mejor rendimiento en móvil
          sx={{
            display: { xs: 'block', sm: 'none' }, // Visible solo en móviles
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent} {/* Contenido del menú */}
        </Drawer>
        {/* Drawer para escritorio (permanente) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' }, // Visible solo en escritorio
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent} {/* Contenido del menú */}
        </Drawer>
      </Box>

      {/* Contenido principal de la aplicación */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // Permite que ocupe el espacio restante
          p: 3, // Padding alrededor del contenido
          width: { sm: `calc(100% - ${drawerWidth}px)` }, // Ancho adaptable en escritorio
          // **AJUSTE CRUCIAL:** margin-top para dejar espacio al AppBar fijo
          mt: theme.mixins.toolbar, // Utiliza la altura del toolbar definida en el tema de MUI
          // **AJUSTE CRUCIAL:** Altura mínima para que el contenido ocupe el espacio restante
          minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - ${theme.spacing(3 * 2)})`,
          // 100vh - altura del toolbar - (padding top + padding bottom del main Box)
        }}
      >
        {/* Renderizado condicional del contenido según la opción del menú seleccionada */}
        {selectedMainView === 'create' && (
          <>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('createTaskFormTitle')} {/* Título traducido */}
            </Typography>
            <TaskForm onSubmit={handleCreateTask} />
          </>
        )}

        {selectedMainView === 'tasks' && (
          <>
            {loading ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h5" color="text.secondary">{t('tasksLoading')}</Typography> {/* Mensaje de carga traducido */}
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h5" color="error">{t('error')}: {error.message}</Typography> {/* Mensaje de error traducido */}
              </Box>
            ) : (
              <>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, color: 'primary.main' }}>
                  {t('appTitle')} {/* Título de la app traducido */}
                </Typography>

                <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                  {t('welcomeMessage')} {/* Mensaje de bienvenida traducido */}
                </Typography>

                {/* Sección de Filtros, Búsqueda, Ordenamiento y Selección de Vista */}
                <Box sx={{ mb: 4, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>{t('viewOptions')}</Typography> {/* Título traducido */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'flex-end' }}>
                    <TextField
                      label={t('searchByTitleDescription')} // Etiqueta traducida
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ flexGrow: 1 }}
                    />
                    <TextField
                      label={t('filterByProject')} // Etiqueta traducida
                      variant="outlined"
                      size="small"
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                      sx={{ flexGrow: 1 }}
                    />
                    <FormControl sx={{ minWidth: 180 }} size="small">
                      <InputLabel>{t('priority')}</InputLabel> {/* Etiqueta traducida */}
                      <Select
                        value={filterPriority}
                        label={t('priority')}
                        onChange={(e) => setFilterPriority(e.target.value)}
                      >
                        <MenuItem value="">{t('all')}</MenuItem> {/* Opción "Todas" traducida */}
                        <MenuItem value="Urgente-Importante">{t('urgentImportant')}</MenuItem> {/* Opción traducida */}
                        <MenuItem value="No Urgente-Importante">{t('notUrgentImportant')}</MenuItem> {/* Opción traducida */}
                        <MenuItem value="Urgente-No Importante">{t('urgentNotImportant')}</MenuItem> {/* Opción traducida */}
                        <MenuItem value="No Urgente-No Importante">{t('notUrgentNotImportant')}</MenuItem> {/* Opción traducida */}
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 150 }} size="small">
                      <InputLabel>{t('completed')}</InputLabel> {/* Etiqueta traducida */}
                      <Select
                        value={filterCompleted}
                        label={t('completed')}
                        onChange={(e) => setFilterCompleted(e.target.value)}
                      >
                        <MenuItem value="">{t('all')}</MenuItem> {/* Opción "Todos" traducida */}
                        <MenuItem value="false">{t('notCompleted')}</MenuItem> {/* Opción "No Completadas" traducida */}
                        <MenuItem value="true">{t('completed')}</MenuItem> {/* Opción "Completadas" traducida */}
                      </Select>
                    </FormControl>

                    {viewMode === 'list' && ( // Solo muestra el ordenamiento en vista de lista
                      <FormControl sx={{ minWidth: 180 }} size="small">
                        <InputLabel>{t('orderBy')}</InputLabel> {/* Etiqueta traducida */}
                        <Select
                          value={sortBy}
                          label={t('orderBy')}
                          onChange={(e) => setSortBy(e.target.value)}
                        >
                          <MenuItem value="createdAt_desc">{t('creationDateDesc')}</MenuItem> {/* Opción traducida */}
                          <MenuItem value="createdAt_asc">{t('creationDateAsc')}</MenuItem> {/* Opción traducida */}
                          <MenuItem value="fechaVencimiento_asc">{t('dueDateAsc')}</MenuItem> {/* Opción traducida */}
                          <MenuItem value="fechaVencimiento_desc">{t('dueDateDesc')}</MenuItem> {/* Opción traducida */}
                          <MenuItem value="prioridad_asc">{t('priorityAsc')}</MenuItem> {/* Opción traducida */}
                          <MenuItem value="prioridad_desc">{t('priorityDesc')}</MenuItem> {/* Opción traducida */}
                          <MenuItem value="titulo_asc">{t('titleAsc')}</MenuItem> {/* Opción traducida */}
                          <MenuItem value="titulo_desc">{t('titleDesc')}</MenuItem> {/* Opción traducida */}
                        </Select>
                      </FormControl>
                    )}

                    {viewMode === 'list' && ( // Solo muestra "Tareas por Pág." en vista de lista
                      <FormControl sx={{ minWidth: 120 }} size="small">
                        <InputLabel>{t('tasksPerPage')}</InputLabel> {/* Etiqueta traducida */}
                        <Select
                          value={limitPerPage}
                          label={t('tasksPerPage')}
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
                      {t('clearFilters')} {/* Botón "Limpiar Filtros" traducido */}
                    </Button>

                    {/* Toggle para cambiar la vista (Lista/Matriz) */}
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={handleViewModeChange}
                      aria-label="text alignment"
                      sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}
                    >
                      <ToggleButton value="list" aria-label="vista de lista">
                        <Typography>{t('list')}</Typography> {/* Etiqueta "Lista" traducida */}
                      </ToggleButton>
                      <ToggleButton value="matrix" aria-label="vista de matriz">
                        <Typography>{t('matrix')}</Typography> {/* Etiqueta "Matriz" traducida */}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>

                {/* Renderizado condicional de la lista o la matriz de tareas */}
                {viewMode === 'list' ? (
                  <>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {t('tasksListView')} {/* Título traducido */}
                    </Typography>
                    <TaskList
                      tasks={tasks}
                      onDelete={handleDeleteTask}
                      onEdit={setEditingTask}
                    />
                    {totalPages > 1 && ( // Muestra paginación solo si hay más de una página
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
                      {t('tasksMatrixView')} {/* Título traducido */}
                    </Typography>
                    <EisenhowerMatrix
                      tasks={tasks}
                      onDelete={handleDeleteTask}
                      onEdit={setEditingTask}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}

        {selectedMainView === 'videos' && (
        <VideoPlayer /> 
        )}

      </Box>
    </Box>
  );
}

export default App;
