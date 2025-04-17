import React from 'react';
import { format, fromUnixTime } from 'date-fns';
import {
  EventItem,
  EventHeader,
  EventTitle,
  EventDescription,
  EventTime,
  EditButton,
  DeleteButton,
} from './StyledComponents';

interface EventProps {
  event: {
    id: string;
    title: string;
    description: string;
    startTime: string | { _seconds: number; _nanoseconds: number };
    endTime: string | { _seconds: number; _nanoseconds: number };
    recurrence?: string;
    recurrenceEndOffset?: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const Event: React.FC<EventProps> = ({ event, onEdit, onDelete }) => {
  const formatDateTime = (dateValue: any) => {
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
    <EventItem>
      <EventHeader>
        <EventTitle>{event.title}</EventTitle>
        <div>
          {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}
          <EditButton onClick={onEdit}>
            Edit
          </EditButton>
          <DeleteButton onClick={onDelete}>
            Delete
          </DeleteButton>
        </div>
      </EventHeader>
      <EventDescription>{event.description}</EventDescription>
      {event.recurrence && (
        <EventTime>
          Recurrence: {event.recurrence}
          {event.recurrenceEndOffset && ` (ends after ${event.recurrenceEndOffset} days)`}
        </EventTime>
      )}
    </EventItem>
  );
};

export default Event; 