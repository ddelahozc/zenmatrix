import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import './App.css'; // Asegúrate de mantener esta importación para los estilos

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null); // null si no se edita ninguna

  // Función para cargar tareas desde la API (GET)
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
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

  // Se ejecuta al montar el componente para cargar las tareas iniciales
  useEffect(() => {
    fetchTasks();
  }, []);

  // Manejador para crear una nueva tarea (POST)
  const handleCreateTask = async (taskData) => {
    try {
      // Asegurar que las fechas se envíen en formato ISO para el backend
      const taskToSend = { ...taskData };
      if (taskToSend.fechaVencimiento) {
        taskToSend.fechaVencimiento = new Date(taskToSend.fechaVencimiento).toISOString();
      }

      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const createdTask = await response.json();
      setTasks(prevTasks => [...prevTasks, createdTask]);
      setError(null);
    } catch (e) {
      console.error("Error creating task:", e);
      setError(e);
      alert(`Error al crear la tarea: ${e.message}`);
    }
  };

  // Manejador para actualizar una tarea (PUT)
  const handleUpdateTask = async (taskData) => {
    try {
      const taskToSend = { ...taskData };
      // Convertir fechas a formato ISO si existen
      if (taskToSend.fechaVencimiento) {
        taskToSend.fechaVencimiento = new Date(taskToSend.fechaVencimiento).toISOString();
      }
      // Establecer fechaTerminada si se marca como completada y no la tenía
      if (taskToSend.isCompleted && !taskToSend.fechaTerminada) {
        taskToSend.fechaTerminada = new Date().toISOString();
      } else if (!taskToSend.isCompleted && taskToSend.fechaTerminada) {
        // Si se desmarca como completada, quitar la fecha de terminación
        taskToSend.fechaTerminada = null;
      } else if (taskToSend.fechaTerminada) {
        // Asegurar que si ya existe, esté en ISO
        taskToSend.fechaTerminada = new Date(taskToSend.fechaTerminada).toISOString();
      }


      const response = await fetch(`http://localhost:5000/api/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      setEditingTask(null); // Salir del modo de edición
      setError(null);
    } catch (e) {
      console.error("Error updating task:", e);
      setError(e);
      alert(`Error al actualizar la tarea: ${e.message}`);
    }
  };

  // Manejador para eliminar una tarea (DELETE)
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

  if (loading) {
    return <div className="app-container">Cargando tareas...</div>;
  }

  if (error) {
    return <div className="app-container error-message">Error: {error.message}</div>;
  }

  return (
    <div className="app-container">
      <h1>ZenMatrix - Matriz de Eisenhower</h1>

      {/* Formulario de edición/creación */}
      {editingTask ? (
        <TaskForm
          onSubmit={handleUpdateTask}
          initialTask={editingTask}
          onCancelEdit={() => setEditingTask(null)}
        />
      ) : (
        <TaskForm onSubmit={handleCreateTask} />
      )}

      <hr />

      <h2>Tus Tareas</h2>
      <TaskList
        tasks={tasks}
        onDelete={handleDeleteTask}
        onEdit={setEditingTask} // Pasa la función para iniciar la edición
      />
    </div>
  );
}

export default App;