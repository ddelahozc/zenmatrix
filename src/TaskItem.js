import React from 'react';

function TaskItem({ task, onDelete, onEdit }) {
  return (
    <li className="task-item">
      <div className="task-info">
        <div className="task-title-priority">
          <strong>{task.titulo}</strong>
          <span className={`priority-tag ${task.prioridad.toLowerCase().replace(/ /g, '-')}`}>
            {task.prioridad}
          </span>
        </div>
        <p>Proyecto: {task.proyecto}</p>
        <p>Responsable: {task.responsable}</p>
        {task.descripcion && <p className="task-description">Descripción: {task.descripcion}</p>}
        {task.fechaVencimiento && (
          <p>Vencimiento: {new Date(task.fechaVencimiento).toLocaleDateString()}</p>
        )}
        <p>Completada: {task.isCompleted ? 'Sí' : 'No'}</p>
        {task.fechaTerminada && (
          <p>Terminada: {new Date(task.fechaTerminada).toLocaleDateString()}</p>
        )}
      </div>
      <div className="task-actions">
        <button onClick={() => onEdit(task)} className="edit-btn">Editar</button>
        <button onClick={() => onDelete(task.id)} className="delete-btn">Eliminar</button>
      </div>
    </li>
  );
}

export default TaskItem;