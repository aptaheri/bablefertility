import React from 'react';
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
  onUpdateStageDate: (protocolId: string, stageId: string) => void;
  onUpdateTaskDate: (protocolId: string, stageId: string, taskId: string) => void;
  onUpdateEventDate: (protocolId: string, stageId: string, eventId: string) => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({
  patientProtocols,
  loading,
  onUpdateStageDate,
  onUpdateTaskDate,
  onUpdateEventDate,
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
          
          {protocol.stages.map((stage) => (
            <Stage
              key={stage.id}
              stage={stage}
              protocolId={protocol.protocolId}
              onUpdateStageDate={() => onUpdateStageDate(protocol.protocolId, stage.id)}
              onUpdateTaskDate={(taskId) => onUpdateTaskDate(protocol.protocolId, stage.id, taskId)}
              onUpdateEventDate={(eventId) => onUpdateEventDate(protocol.protocolId, stage.id, eventId)}
            />
          ))}
        </StageContainer>
      ))}
    </PlanDisplayStyled>
  );
};

export default PlanDisplay; 