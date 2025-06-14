import React from 'react';
import TaskItem from './TaskItem';

function TaskList({ tasks, onDelete, onEdit }) {
  if (tasks.length === 0) {
    return <p className="no-tasks">No hay tareas aún. ¡Crea una!</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
}

export default TaskList;