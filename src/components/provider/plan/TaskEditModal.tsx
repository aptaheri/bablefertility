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

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    name: string;
    description: string;
    dueDate: string;
    type?: string;
    priority?: string;
    estimatedDuration?: number;
  }) => void;
  initialData?: {
    name: string;
    description?: string;
    dueDate: string | { _seconds: number; _nanoseconds: number };
    type?: string;
    priority?: string;
    estimatedDuration?: number;
  };
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    type: '',
    priority: '',
    estimatedDuration: 0,
  });

  // Convert Firestore timestamp or string to local datetime-local format
  const convertToLocalDateTime = (dateValue: any) => {
    if (!dateValue) return '';
    
    let date;
    if (dateValue && typeof dateValue === 'object' && '_seconds' in dateValue) {
      date = new Date(dateValue._seconds * 1000);
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        dueDate: convertToLocalDateTime(initialData.dueDate),
        type: initialData.type || '',
        priority: initialData.priority || '',
        estimatedDuration: initialData.estimatedDuration || 0,
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      dueDate: new Date(formData.dueDate).toISOString(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedDuration' ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Edit Task</ModalTitle>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label htmlFor="name">Name</label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
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
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="dueDate">Due Date</label>
            <Input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="type">Type</label>
            <Input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </FormGroup>

          <FormGroup>
            <label htmlFor="estimatedDuration">Estimated Duration (minutes)</label>
            <Input
              type="number"
              id="estimatedDuration"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>

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

export default TaskEditModal; 