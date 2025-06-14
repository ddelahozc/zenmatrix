import React, { useState, useEffect } from 'react';

function TaskForm({ onSubmit, initialTask = null, onCancelEdit }) {
  const [task, setTask] = useState({
    proyecto: '',
    responsable: '',
    titulo: '',
    descripcion: '',
    fechaVencimiento: '',
    prioridad: ''
  });

  // Si se pasa una tarea inicial (para edición), cargarla en el estado del formulario
  useEffect(() => {
    if (initialTask) {
      setTask({
        ...initialTask,
        // Formatear la fecha para el input type="date"
        fechaVencimiento: initialTask.fechaVencimiento ? new Date(initialTask.fechaVencimiento).toISOString().split('T')[0] : '',
        fechaTerminada: initialTask.fechaTerminada ? new Date(initialTask.fechaTerminada).toISOString().split('T')[0] : ''
      });
    } else {
      // Limpiar el formulario si no hay tarea inicial (modo creación)
      setTask({
        proyecto: '',
        responsable: '',
        titulo: '',
        descripcion: '',
        fechaVencimiento: '',
        prioridad: ''
      });
    }
  }, [initialTask]); // Se ejecuta cada vez que initialTask cambia

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(task); // Llamar a la función onSubmit que se pasa desde el componente padre
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h3>{initialTask ? 'Editar Tarea' : 'Crear Nueva Tarea'}</h3>
      <div className="form-group">
        <label>
          Título:
          <input type="text" name="titulo" value={task.titulo} onChange={handleChange} required />
        </label>
      </div>
      <div className="form-group">
        <label>
          Proyecto:
          <input type="text" name="proyecto" value={task.proyecto} onChange={handleChange} required />
        </label>
      </div>
      <div className="form-group">
        <label>
          Responsable:
          <input type="text" name="responsable" value={task.responsable} onChange={handleChange} required />
        </label>
      </div>
      <div className="form-group">
        <label>
          Prioridad:
          <select name="prioridad" value={task.prioridad} onChange={handleChange} required>
            <option value="">Selecciona una prioridad</option>
            <option value="Urgente-Importante">Urgente-Importante</option>
            <option value="No Urgente-Importante">No Urgente-Importante</option>
            <option value="Urgente-No Importante">Urgente-No Importante</option>
            <option value="No Urgente-No Importante">No Urgente-No Importante</option>
          </select>
        </label>
      </div>
      <div className="form-group">
        <label>
          Descripción:
          <textarea name="descripcion" value={task.descripcion || ''} onChange={handleChange}></textarea>
        </label>
      </div>
      <div className="form-group">
        <label>
          Fecha Vencimiento:
          <input type="date" name="fechaVencimiento" value={task.fechaVencimiento || ''} onChange={handleChange} />
        </label>
      </div>
      {initialTask && ( // Solo mostrar estos campos en modo edición
        <>
          <div className="form-group checkbox-group">
            <label>
              Completada:
              <input type="checkbox" name="isCompleted" checked={task.isCompleted} onChange={handleChange} />
            </label>
          </div>
          {task.isCompleted && (
            <div className="form-group">
              <label>
                Fecha Terminada:
                <input type="date" name="fechaTerminada" value={task.fechaTerminada || ''} onChange={handleChange} />
              </label>
            </div>
          )}
        </>
      )}
      <div className="form-actions">
        <button type="submit">{initialTask ? 'Actualizar Tarea' : 'Añadir Tarea'}</button>
        {initialTask && <button type="button" onClick={onCancelEdit}>Cancelar</button>}
      </div>
    </form>
  );
}

export default TaskForm;