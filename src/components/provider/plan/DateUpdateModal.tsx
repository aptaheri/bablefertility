import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format, parseISO, formatISO, fromUnixTime } from 'date-fns';
import {
  ModalOverlay,
  ModalContent,
  ModalTitle,
  ModalActions,
  CancelButton,
  SaveButton,
  FormGroup,
  Label,
  Input,
} from './StyledComponents';

interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface DateUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string, updateRelated: boolean) => Promise<void>;
  title: string;
  initialDate?: string | FirestoreTimestamp;
  showUpdateRelated?: boolean;
}

const DateUpdateModal: React.FC<DateUpdateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  initialDate,
  showUpdateRelated = false,
}) => {
  const [date, setDate] = useState('');
  const [updateRelated, setUpdateRelated] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset state when modal opens or initialDate changes
  useEffect(() => {
    if (isOpen && initialDate) {
      try {
        console.log('Initial date received:', initialDate);
        let parsedDate;
        
        // Handle Firestore Timestamp
        if (typeof initialDate === 'object' && '_seconds' in initialDate) {
          console.log('Handling Firestore timestamp');
          parsedDate = fromUnixTime(initialDate._seconds);
        } else if (typeof initialDate === 'string') {
          console.log('Handling string date');
          parsedDate = new Date(initialDate);
        } else {
          throw new Error('Unsupported date format');
        }

        if (!isNaN(parsedDate.getTime())) {
          // Format the date in the local timezone for the input
          // datetime-local inputs require the format: YYYY-MM-DDThh:mm
          const localDate = formatISO(parsedDate, { representation: 'complete' }).slice(0, 16);
          console.log('Setting date to:', localDate);
          setDate(localDate);
        } else {
          console.error('Invalid date:', parsedDate);
        }
      } catch (error) {
        console.error('Error parsing initial date:', error, initialDate);
      }
    } else if (!isOpen) {
      // Reset state when modal closes
      setDate('');
      setUpdateRelated(false);
      setSaving(false);
    }
  }, [isOpen, initialDate]);

  const handleSave = async () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    try {
      setSaving(true);
      // Convert the local date back to ISO string for the API
      const selectedDate = new Date(date);
      const isoDate = selectedDate.toISOString();
      await onSave(isoDate, updateRelated);
      onClose();
    } catch (error) {
      console.error('Error saving date:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
        <FormGroup>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </FormGroup>
        {showUpdateRelated && (
          <FormGroup>
            <Label>
              <input
                type="checkbox"
                checked={updateRelated}
                onChange={(e) => setUpdateRelated(e.target.checked)}
              />
              Update related tasks and events
            </Label>
          </FormGroup>
        )}
        <ModalActions>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SaveButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </SaveButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DateUpdateModal; 