import React, { useEffect } from 'react';
import { format, fromUnixTime } from 'date-fns';
import {
  PlanDisplay as PlanDisplayStyled,
  StageContainer,
  StageHeader,
  StageTitle,
} from './StyledComponents';
import Stage from './Stage';

interface PatientProtocol {
  id: string;
  patientId: string;
  interventionId: string;
  protocolId: string;
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
  createdAt: string | { _seconds: number; _nanoseconds: number };
  updatedAt: string | { _seconds: number; _nanoseconds: number };
}

interface PlanDisplayProps {
  patientProtocols: PatientProtocol[];
  loading: boolean;
  onUpdateStageDate: (protocol: PatientProtocol, stageId: string) => void;
  onUpdateTask: (protocolId: string, stageId: string, taskId: string, taskData: {
    name: string;
    description: string;
    dueDate: string;
    type?: string;
    priority?: string;
    estimatedDuration?: number;
  }) => void;
  onEditEvent: (eventId: string) => void;
  onDeleteStage: (protocolId: string, stageId: string) => void;
  onDeleteTask: (protocolId: string, stageId: string, taskId: string) => void;
  onDeleteEvent: (protocolId: string, stageId: string, eventId: string) => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({
  patientProtocols,
  loading,
  onUpdateStageDate,
  onUpdateTask,
  onEditEvent,
  onDeleteStage,
  onDeleteTask,
  onDeleteEvent,
}) => {
  useEffect(() => {
    console.log('PlanDisplay received protocols:', patientProtocols.map(protocol => ({
      id: protocol.id,
      protocolId: protocol.protocolId,
      stages: protocol.stages.map(stage => ({
        id: stage.id,
        name: stage.name,
        order: stage.order,
        startDate: stage.startDate
      }))
    })));

    // Log a summary of all stage IDs
    const allStageIds = patientProtocols.flatMap(p => p.stages.map(s => s.id));
    console.log('All stage IDs in the system:', allStageIds);
  }, [patientProtocols]);

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

  if (loading) {
    return <p>Loading plans...</p>;
  }

  if (patientProtocols.length === 0) {
    return <p>No treatment plans found for this patient.</p>;
  }

  return (
    <PlanDisplayStyled>
      <h3>Current Treatment Plans</h3>
      {patientProtocols.map((protocol) => (
        <StageContainer key={protocol.id}>
          <StageHeader>
            <StageTitle>Protocol ID: {protocol.protocolId}</StageTitle>
            <div>Created: {formatDate(protocol.createdAt)}</div>
          </StageHeader>
          
          {protocol.stages
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((stage) => (
            <Stage
              key={stage.id}
              stage={stage}
              protocol={protocol}
              onUpdateStageDate={() => onUpdateStageDate(protocol, stage.id)}
              onUpdateTask={(taskId, taskData) => onUpdateTask(protocol.id, stage.id, taskId, taskData)}
              onEditEvent={onEditEvent}
              onDeleteStage={() => onDeleteStage(protocol.id, stage.id)}
              onDeleteTask={(taskId) => onDeleteTask(protocol.id, stage.id, taskId)}
              onDeleteEvent={(eventId) => onDeleteEvent(protocol.id, stage.id, eventId)}
            />
          ))}
        </StageContainer>
      ))}
    </PlanDisplayStyled>
  );
};

export default PlanDisplay; 