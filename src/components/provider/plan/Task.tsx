import React, { useState } from 'react';
import { format, fromUnixTime } from 'date-fns';
import {
  TaskItem,
  TaskHeader,
  TaskTitle,
  TaskDescription,
  TaskMeta,
  EditButton,
  DeleteButton,
} from './StyledComponents';
import TaskEditModal from './TaskEditModal';

interface TaskProps {
  task: {
    id: string;
    name: string;
    description?: string;
    dueDate: string | { _seconds: number; _nanoseconds: number };
    type?: string;
    priority?: string;
    estimatedDuration?: number;
  };
  onUpdate: (taskData: {
    name: string;
    description: string;
    dueDate: string;
    type?: string;
    priority?: string;
    estimatedDuration?: number;
  }) => void;
  onDelete: () => void;
}

const Task: React.FC<TaskProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatDate = (dateValue: any) => {
    try {
      let date;
      
      // Handle Firestore Timestamp
      if (dateValue && typeof dateValue === 'object' && '_seconds' in dateValue) {
        date = fromUnixTime(dateValue._seconds);
      }
      // Handle string dates
      else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      // Handle Date objects
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      
      if (date && !isNaN(date.getTime())) {
        return format(date, 'MMM d, yyyy h:mm a');
      }
      
      return 'Date not set';
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'Date not set';
    }
  };

  return (
    <>
      <TaskItem>
        <TaskHeader>
          <TaskTitle>{task.name}</TaskTitle>
          <div>
            Due: {formatDate(task.dueDate)}
            <EditButton onClick={() => setIsEditModalOpen(true)}>
              Edit
            </EditButton>
            <DeleteButton onClick={onDelete}>
              Delete
            </DeleteButton>
          </div>
        </TaskHeader>
        {task.description && (
          <TaskDescription>{task.description}</TaskDescription>
        )}
        <TaskMeta>
          {task.type && <span>Type: {task.type}</span>}
          {task.priority && <span>Priority: {task.priority}</span>}
          {task.estimatedDuration && <span>Duration: {task.estimatedDuration} minutes</span>}
        </TaskMeta>
      </TaskItem>

      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(taskData) => {
          onUpdate(taskData);
          setIsEditModalOpen(false);
        }}
        initialData={task}
      />
    </>
  );
};

export default Task; 