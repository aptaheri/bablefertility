import React from 'react';
import { format, fromUnixTime } from 'date-fns';
import {
  StageContainer,
  StageHeader,
  StageTitle,
  StageDescription,
  TasksList,
  EventsList,
  UpdateDateButton,
  DeleteStageButton,
} from './StyledComponents';
import Task from './Task';
import Event from './Event';

interface StageProps {
  stage: {
    id: string;
    name: string;
    order: number;
    description?: string;
    startDate: string | { _seconds: number; _nanoseconds: number };
    isCompleted: boolean;
    tasks: Array<{
      id: string;
      name: string;
      description?: string;
      dueDate: string | { _seconds: number; _nanoseconds: number };
      type?: string;
      priority?: string;
      estimatedDuration?: number;
    }>;
    events: Array<{
      id: string;
      title: string;
      description: string;
      startTime: string | { _seconds: number; _nanoseconds: number };
      endTime: string | { _seconds: number; _nanoseconds: number };
      recurrence?: string;
      recurrenceEndOffset?: number;
    }>;
  };
  protocol: {
    id: string;
    protocolId: string;
    createdAt: string | { _seconds: number; _nanoseconds: number };
    stages: Array<{
      id: string;
      name: string;
      order: number;
      description?: string;
      startDate: string | { _seconds: number; _nanoseconds: number };
      isCompleted: boolean;
      tasks: Array<{
        id: string;
        name: string;
        description?: string;
        dueDate: string | { _seconds: number; _nanoseconds: number };
        type?: string;
        priority?: string;
        estimatedDuration?: number;
      }>;
      events: Array<{
        id: string;
        title: string;
        description: string;
        startTime: string | { _seconds: number; _nanoseconds: number };
        endTime: string | { _seconds: number; _nanoseconds: number };
        recurrence?: string;
        recurrenceEndOffset?: number;
      }>;
    }>;
  };
  onUpdateStageDate: () => void;
  onUpdateTask: (taskId: string, taskData: {
    name: string;
    description: string;
    dueDate: string;
    type?: string;
    priority?: string;
    estimatedDuration?: number;
  }) => void;
  onEditEvent: (eventId: string) => void;
  onDeleteStage: () => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

const Stage: React.FC<StageProps> = ({
  stage,
  protocol,
  onUpdateStageDate,
  onUpdateTask,
  onEditEvent,
  onDeleteStage,
  onDeleteTask,
  onDeleteEvent,
}) => {
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
    <StageContainer>
      <StageHeader>
        <StageTitle>Stage {stage.order}: {stage.name}</StageTitle>
        <div>
          Start Date: {formatDate(stage.startDate)}
          <UpdateDateButton onClick={onUpdateStageDate}>
            Update Date
          </UpdateDateButton>
          <DeleteStageButton onClick={onDeleteStage}>
            Delete Stage
          </DeleteStageButton>
        </div>
      </StageHeader>
      {stage.description && (
        <StageDescription>{stage.description}</StageDescription>
      )}

      <TasksList>
        <h4>Tasks</h4>
        {stage.tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            onUpdate={(taskData) => onUpdateTask(task.id, taskData)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </TasksList>

      <EventsList>
        <h4>Events</h4>
        {stage.events.map((event) => (
          <Event
            key={event.id}
            event={event}
            onEdit={() => onEditEvent(event.id)}
            onDelete={() => onDeleteEvent(event.id)}
          />
        ))}
      </EventsList>
    </StageContainer>
  );
};

export default Stage; 