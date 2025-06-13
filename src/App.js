import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para el formulario de nueva tarea
  const [newTask, setNewTask] = useState({
    proyecto: '',
    responsable: '',
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    prioridad: ''
  });

  // Estado para la tarea que se está editando
  const [editingTask, setEditingTask] = useState(null); // null si no se edita ninguna, objeto de la tarea si sí

  // Función para cargar tareas desde la API
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

  // Manejador de cambios en los campos del formulario de nueva tarea
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prevTask => ({
      ...prevTask,
      [name]: value
    }));
  };

  // Manejador del envío del formulario para crear una nueva tarea
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const taskToSend = { ...newTask };
      if (taskToSend.fechaVencimiento) {
        // Asegurarse de que la fecha se envíe en formato ISO para el backend
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
      setNewTask({
        proyecto: '',
        responsable: '',
        titulo: '',
        descripcion: '',
        fechaVencimiento: '',
        prioridad: ''
      });
      setError(null);
    } catch (e) {
      console.error("Error creating task:", e);
      setError(e);
      alert(`Error al crear la tarea: ${e.message}`);
    }
  };

  // --- Funciones para Eliminar y Actualizar Tareas ---

  // Manejador para eliminar una tarea
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return; // El usuario canceló la eliminación
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Filtrar la tarea eliminada de la lista local
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setError(null); // Limpiar cualquier error previo
    } catch (e) {
      console.error("Error deleting task:", e);
      setError(e);
      alert(`Error al eliminar la tarea: ${e.message}`);
    }
  };

  // Iniciar el modo de edición para una tarea
  const startEditing = (task) => {
    setEditingTask({
      ...task,
      // Formatear la fecha para el input type="date"
      fechaVencimiento: task.fechaVencimiento ? new Date(task.fechaVencimiento).toISOString().split('T')[0] : ''
    });
  };

  // Manejador de cambios en el formulario de edición
  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingTask(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejador para enviar la actualización de una tarea
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const taskToSend = { ...editingTask };
      // Convertir fechaVencimiento y fechaTerminada a formato ISO si existen
      if (taskToSend.fechaVencimiento) {
        taskToSend.fechaVencimiento = new Date(taskToSend.fechaVencimiento).toISOString();
      }
      if (taskToSend.fechaTerminada) {
        taskToSend.fechaTerminada = new Date(taskToSend.fechaTerminada).toISOString();
      } else {
        // Si no hay fechaTerminada y la tarea se marca como completada, establecerla ahora
        if (taskToSend.isCompleted && !editingTask.fechaTerminada) {
          taskToSend.fechaTerminada = new Date().toISOString();
        }
      }


      const response = await fetch(`http://localhost:5000/api/tasks/${editingTask.id}`, {
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

  if (loading) {
    return <div className="App">Cargando tareas...</div>;
  }

  if (error) {
    return <div className="App">Error: {error.message}</div>;
  }

  return (
    <div className="App">
      <h1>ZenMatrix - Matriz de Eisenhower</h1>
      <p>Bienvenido a tu gestor de tareas.</p>

      {/* Formulario para Crear Nueva Tarea */}
      <h2>Crear Nueva Tarea</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Título:
          <input type="text" name="titulo" value={newTask.titulo} onChange={handleInputChange} required />
        </label>
        <br />
        <label>
          Proyecto:
          <input type="text" name="proyecto" value={newTask.proyecto} onChange={handleInputChange} required />
        </label>
        <br />
        <label>
          Responsable:
          <input type="text" name="responsable" value={newTask.responsable} onChange={handleInputChange} required />
        </label>
        <br />
        <label>
          Prioridad:
          <select name="prioridad" value={newTask.prioridad} onChange={handleInputChange} required>
            <option value="">Selecciona una prioridad</option>
            <option value="Urgente-Importante">Urgente-Importante</option>
            <option value="No Urgente-Importante">No Urgente-Importante</option>
            <option value="Urgente-No Importante">Urgente-No Importante</option>
            <option value="No Urgente-No Importante">No Urgente-No Importante</option>
          </select>
        </label>
        <br />
        <label>
          Descripción:
          <textarea name="descripcion" value={newTask.descripcion} onChange={handleInputChange}></textarea>
        </label>
        <br />
        <label>
          Fecha Vencimiento:
          <input type="date" name="fechaVencimiento" value={newTask.fechaVencimiento} onChange={handleInputChange} />
        </label>
        <br />
        <button type="submit">Añadir Tarea</button>
      </form>

      <hr />

      {/* Formulario para Editar Tarea (aparece condicionalmente) */}
      {editingTask && (
        <>
          <h2>Editar Tarea</h2>
          <form onSubmit={handleUpdate}>
            <label>
              Título:
              <input type="text" name="titulo" value={editingTask.titulo} onChange={handleEditInputChange} required />
            </label>
            <br />
            <label>
              Proyecto:
              <input type="text" name="proyecto" value={editingTask.proyecto} onChange={handleEditInputChange} required />
            </label>
            <br />
            <label>
              Responsable:
              <input type="text" name="responsable" value={editingTask.responsable} onChange={handleEditInputChange} required />
            </label>
            <br />
            <label>
              Prioridad:
              <select name="prioridad" value={editingTask.prioridad} onChange={handleEditInputChange} required>
                <option value="">Selecciona una prioridad</option>
                <option value="Urgente-Importante">Urgente-Importante</option>
                <option value="No Urgente-Importante">No Urgente-Importante</option>
                <option value="Urgente-No Importante">Urgente-No Importante</option>
                <option value="No Urgente-No Importante">No Urgente-No Importante</option>
              </select>
            </label>
            <br />
            <label>
              Descripción:
              <textarea name="descripcion" value={editingTask.descripcion || ''} onChange={handleEditInputChange}></textarea>
            </label>
            <br />
            <label>
              Fecha Vencimiento:
              <input type="date" name="fechaVencimiento" value={editingTask.fechaVencimiento || ''} onChange={handleEditInputChange} />
            </label>
            <br />
            <label>
              Completada:
              <input type="checkbox" name="isCompleted" checked={editingTask.isCompleted} onChange={handleEditInputChange} />
            </label>
            <br />
            {editingTask.isCompleted && (
              <label>
                Fecha Terminada:
                <input type="date" name="fechaTerminada" value={editingTask.fechaTerminada ? new Date(editingTask.fechaTerminada).toISOString().split('T')[0] : ''} onChange={handleEditInputChange} />
              </label>
            )}
            <br />
            <button type="submit">Actualizar Tarea</button>
            <button type="button" onClick={() => setEditingTask(null)}>Cancelar</button>
          </form>
          <hr />
        </>
      )}

      {/* Lista de Tareas */}
      <h2>Tus Tareas</h2>
      {tasks.length === 0 ? (
        <p>No hay tareas aún. ¡Crea una!</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              <strong>{task.titulo}</strong> (Proyecto: {task.proyecto}, Responsable: {task.responsable})
              <br />
              Prioridad: {task.prioridad} - Completada: {task.isCompleted ? 'Sí' : 'No'}
              {task.descripcion && <><br />Descripción: {task.descripcion}</>}
              {task.fechaVencimiento && <><br />Vencimiento: {new Date(task.fechaVencimiento).toLocaleDateString()}</>}
              {task.fechaTerminada && <><br />Terminada: {new Date(task.fechaTerminada).toLocaleDateString()}</>}
              <br />
              <button onClick={() => startEditing(task)}>Editar</button>
              <button onClick={() => handleDelete(task.id)} style={{ marginLeft: '10px' }}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;