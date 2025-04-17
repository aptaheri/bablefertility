import React, { useState, useEffect } from 'react';
import {
  ModalOverlay,
  ModalContent,
  ModalTitle,
  FormGroup,
  Input,
  TextArea,
  ModalActions,
  SaveButton,
  CancelButton,
} from './StyledComponents';

interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    recurrence?: string;
    recurrenceEndOffset?: number;
  }) => void;
  initialData?: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    recurrence?: string;
    recurrenceEndOffset?: number;
  };
}

const EventEditModal: React.FC<EventEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    recurrence: '',
    recurrenceEndOffset: 0,
  });

  // Convert UTC date string to local datetime-local format
  const convertToLocalDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Get the local date and time components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Convert local datetime-local format to UTC ISO string
  const convertToUTCString = (localDateTime: string) => {
    if (!localDateTime) return '';
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        startTime: convertToLocalDateTime(initialData.startTime),
        endTime: convertToLocalDateTime(initialData.endTime),
        recurrence: initialData.recurrence || '',
        recurrenceEndOffset: initialData.recurrenceEndOffset || 0,
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      startTime: convertToUTCString(formData.startTime),
      endTime: convertToUTCString(formData.endTime),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Edit Event</ModalTitle>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="title">Title</label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="description">Description</label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="startTime">Start Time</label>
            <Input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="endTime">End Time</label>
            <Input
              type="datetime-local"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="recurrence">Recurrence</label>
            <select
              id="recurrence"
              name="recurrence"
              value={formData.recurrence}
              onChange={handleChange}
            >
              <option value="">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </FormGroup>

          {formData.recurrence && (
            <FormGroup>
              <label htmlFor="recurrenceEndOffset">End After (days)</label>
              <Input
                type="number"
                id="recurrenceEndOffset"
                name="recurrenceEndOffset"
                value={formData.recurrenceEndOffset}
                onChange={handleChange}
                min="1"
              />
            </FormGroup>
          )}

          <ModalActions>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SaveButton type="submit">
              Save Changes
            </SaveButton>
          </ModalActions>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EventEditModal; 