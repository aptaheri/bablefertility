import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedPatient } from './ProviderLayout';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const PlanContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  color: #374151;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #FFD900;
    box-shadow: 0 0 0 2px rgba(255, 217, 0, 0.2);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 1rem;
  color: #374151;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #FFD900;
    box-shadow: 0 0 0 2px rgba(255, 217, 0, 0.2);
  }
`;

const Button = styled.button`
  background-color: #FFD900;
  color: #1a1a1a;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e6c300;
  }
  
  &:disabled {
    background-color: #e5e7eb;
    cursor: not-allowed;
  }
`;

const PlanDisplay = styled.div`
  margin-top: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StageContainer = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const StageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StageTitle = styled.h3`
  margin: 0;
  color: #1e293b;
`;

const StageDescription = styled.p`
  color: #64748b;
  margin: 0.5rem 0;
`;

const TasksList = styled.div`
  margin-top: 1rem;
`;

const TaskItem = styled.div`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: #f8fafc;
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TaskTitle = styled.h4`
  margin: 0;
  color: #1e293b;
`;

const TaskDescription = styled.p`
  color: #64748b;
  margin: 0.25rem 0;
  font-size: 0.875rem;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #64748b;
`;

const EventsList = styled.div`
  margin-top: 1rem;
`;

const EventItem = styled.div`
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: #f0f9ff;
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const EventTitle = styled.h4`
  margin: 0;
  color: #0369a1;
`;

const EventDescription = styled.p`
  color: #64748b;
  margin: 0.25rem 0;
  font-size: 0.875rem;
`;

const EventTime = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const UpdateDateButton = styled.button`
  background-color: #FFD900;
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 1rem;
  
  &:hover {
    background-color: #e6c300;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const ModalTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #1e293b;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const CancelButton = styled.button`
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #d1d5db;
  }
`;

const SaveButton = styled.button`
  background-color: #FFD900;
  color: #1a1a1a;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #e6c300;
  }
  
  &:disabled {
    background-color: #e5e7eb;
    cursor: not-allowed;
  }
`;

interface Intervention {
  id: string;
  name: string;
  description: string;
}

interface Protocol {
  id: string;
  name: string;
  description: string;
  interventionId: string;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  isCompleted: boolean;
  type?: string;
  priority?: string;
  estimatedDuration?: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: string;
  recurrence?: string;
  recurrenceEndOffset?: number;
}

interface Stage {
  id: string;
  name: string;
  order: number;
  description?: string;
  startDate: string;
  isCompleted: boolean;
  tasks: Task[];
  events: Event[];
}

interface PatientProtocol {
  id: string;
  patientId: string;
  interventionId: string;
  protocolId: string;
  stages: Stage[];
  createdAt: string;
  updatedAt: string;
}

interface DateUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string, updateRelated: boolean) => Promise<void>;
  title: string;
  initialDate?: string;
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
  const [date, setDate] = useState(initialDate || '');
  const [updateRelated, setUpdateRelated] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    try {
      setSaving(true);
      await onSave(date, updateRelated);
      onClose();
    } catch (error) {
      console.error('Error saving date:', error);
    } finally {
      setSaving(false);
    }
  };

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

const Plan = () => {
  const { currentUser } = useAuth();
  const { selectedPatient } = useSelectedPatient();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [interventionsLoading, setInterventionsLoading] = useState(false);
  const [protocolsLoading, setProtocolsLoading] = useState(false);
  const [interventionsError, setInterventionsError] = useState<string | null>(null);
  const [protocolsError, setProtocolsError] = useState<string | null>(null);
  const [patientProtocols, setPatientProtocols] = useState<PatientProtocol[]>([]);
  const [loadingProtocols, setLoadingProtocols] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'stage' | 'task' | 'event' | null;
    itemId: string | null;
    protocolId: string | null;
    stageId: string | null;
  }>({
    isOpen: false,
    type: null,
    itemId: null,
    protocolId: null,
    stageId: null,
  });

  const fetchInterventions = useCallback(async () => {
    if (!currentUser) return;

    try {
      setInterventionsLoading(true);
      setInterventionsError(null);
      
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/interventions', {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to fetch interventions: ${errorData.error || response.statusText}`);
      }

      const rawResponse = await response.text();
      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      const interventionsData = Array.isArray(data) ? data : data?.data;
      
      if (Array.isArray(interventionsData)) {
        setInterventions(interventionsData);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching interventions:', error);
      setInterventionsError(error instanceof Error ? error.message : 'Failed to load interventions');
      toast.error(error instanceof Error ? error.message : 'Failed to load interventions');
    } finally {
      setInterventionsLoading(false);
    }
  }, [currentUser]);

  const fetchProtocols = useCallback(async () => {
    if (!currentUser) return;

    try {
      setProtocolsLoading(true);
      setProtocolsError(null);
      
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/protocols', {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to fetch protocols: ${errorData.error || response.statusText}`);
      }

      const rawResponse = await response.text();
      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      const protocolsData = Array.isArray(data) ? data : data?.data;
      
      if (Array.isArray(protocolsData)) {
        setProtocols(protocolsData);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching protocols:', error);
      setProtocolsError(error instanceof Error ? error.message : 'Failed to load protocols');
      toast.error(error instanceof Error ? error.message : 'Failed to load protocols');
    } finally {
      setProtocolsLoading(false);
    }
  }, [currentUser]);

  const fetchPatientProtocols = useCallback(async () => {
    if (!currentUser || !selectedPatient) return;

    try {
      setLoadingProtocols(true);
      console.log('Fetching patient protocols for patient:', selectedPatient.id);
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/patients/${selectedPatient.id}/protocols`, {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No protocols found for patient:', selectedPatient.id);
          setPatientProtocols([]);
          return;
        }
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error fetching patient protocols:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error('Failed to fetch patient protocols');
      }

      const data = await response.json();
      console.log('Fetched patient protocols:', data);
      console.log('Protocol IDs:', data.map((p: PatientProtocol) => ({
        id: p.id,
        protocolId: p.protocolId,
        idCharCodes: p.id.split('').map(c => c.charCodeAt(0)),
        protocolIdCharCodes: p.protocolId ? p.protocolId.split('').map(c => c.charCodeAt(0)) : null
      })));
      setPatientProtocols(data);
    } catch (error) {
      console.error('Error fetching patient protocols:', error);
      toast.error('Failed to load patient protocols');
    } finally {
      setLoadingProtocols(false);
    }
  }, [currentUser, selectedPatient]);

  useEffect(() => {
    fetchInterventions();
    fetchProtocols();
    fetchPatientProtocols();
  }, [currentUser, fetchInterventions, fetchProtocols, fetchPatientProtocols]);

  // Add effect to log patient protocols when they change
  useEffect(() => {
    console.log('Patient protocols updated:', {
      patientId: selectedPatient?.id,
      protocols: patientProtocols,
      protocolCount: patientProtocols.length
    });
  }, [patientProtocols, selectedPatient]);

  // Add effect to log modal state changes
  useEffect(() => {
    if (modalState.isOpen) {
      console.log('Modal state changed:', {
        type: modalState.type,
        protocolId: modalState.protocolId,
        stageId: modalState.stageId,
        itemId: modalState.itemId,
        currentProtocols: patientProtocols
      });
    }
  }, [modalState, patientProtocols]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPatient) return;

    try {
      setLoading(true);
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/stage-definitions/patient-stages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          interventionId: selectedIntervention,
          protocolId: selectedProtocol,
          startDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create patient stages');
      }

      toast.success('Patient stages created successfully');
      // Reset form
      setSelectedIntervention('');
      setSelectedProtocol('');
      setStartDate('');
      // Fetch the updated protocols
      await fetchPatientProtocols();
    } catch (error) {
      console.error('Error creating patient stages:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create patient stages');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Invalid Date';
    }
  };

  const updateStageDates = async (date: string, updateRelated: boolean) => {
    if (!currentUser || !selectedPatient || !modalState.protocolId || !modalState.stageId) return;

    try {
      // Log the current state for debugging
      console.log('Current patient protocols details:', patientProtocols.map(p => ({
        id: p.id,
        protocolId: p.protocolId,
        stages: p.stages.map(s => ({ id: s.id, name: s.name, startDate: s.startDate }))
      })));

      // Find the protocol that matches either by id or protocolId
      const protocol = patientProtocols.find(p => p.id === modalState.protocolId || p.protocolId === modalState.protocolId);
      console.log('Looking for protocol:', {
        requestedProtocolId: modalState.protocolId,
        foundProtocol: protocol ? {
          id: protocol.id,
          protocolId: protocol.protocolId,
          stageCount: protocol.stages.length,
          stages: protocol.stages.map(s => ({ id: s.id, name: s.name }))
        } : null
      });

      if (!protocol) {
        console.error('Protocol not found:', {
          requestedProtocolId: modalState.protocolId,
          availableProtocols: patientProtocols.map(p => ({
            id: p.id,
            protocolId: p.protocolId,
            stageCount: p.stages.length
          }))
        });
        throw new Error(`Protocol ${modalState.protocolId} not found`);
      }

      // Verify the stage exists in the protocol
      const stage = protocol.stages.find(s => s.id === modalState.stageId);
      console.log('Looking for stage:', {
        requestedStageId: modalState.stageId,
        foundStage: stage ? {
          id: stage.id,
          name: stage.name,
          startDate: stage.startDate
        } : null,
        availableStages: protocol.stages.map(s => ({
          id: s.id,
          name: s.name,
          startDate: s.startDate
        }))
      });

      if (!stage) {
        console.error('Stage not found in protocol:', {
          requestedStageId: modalState.stageId,
          protocolId: protocol.protocolId,
          availableStages: protocol.stages.map(s => ({
            id: s.id,
            name: s.name
          }))
        });
        throw new Error(`Stage ${modalState.stageId} not found in protocol ${modalState.protocolId}`);
      }

      console.log('Updating stage dates with:', {
        patientId: selectedPatient.id,
        protocolId: modalState.protocolId,
        stageId: modalState.stageId,
        date,
        updateRelated,
        stageName: stage.name,
        currentStartDate: stage.startDate
      });

      const url = `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${modalState.protocolId}/stages/${modalState.stageId}/dates`;
      console.log('Making request to:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: date,
          updateTasksAndEvents: updateRelated,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Update stage dates error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url,
          requestBody: {
            startDate: date,
            updateTasksAndEvents: updateRelated,
          },
          protocol: {
            id: protocol.id,
            protocolId: protocol.protocolId
          },
          stage: {
            id: stage.id,
            name: stage.name
          }
        });
        throw new Error(`Failed to update stage dates: ${errorData.error || response.statusText}`);
      }

      await fetchPatientProtocols();
      toast.success('Stage dates updated successfully');
    } catch (error) {
      console.error('Error updating stage dates:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update stage dates');
      throw error;
    }
  };

  const updateTask = async (date: string) => {
    if (!currentUser || !selectedPatient || !modalState.protocolId || !modalState.stageId || !modalState.itemId) return;

    try {
      const response = await fetch(
        `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${modalState.protocolId}/stages/${modalState.stageId}/tasks/${modalState.itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dueDate: date,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      await fetchPatientProtocols();
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      throw error;
    }
  };

  const updateEvent = async (date: string) => {
    if (!currentUser || !selectedPatient || !modalState.protocolId || !modalState.stageId || !modalState.itemId) return;

    try {
      const response = await fetch(
        `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${modalState.protocolId}/stages/${modalState.stageId}/events/${modalState.itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startTime: date,
            endTime: new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString(), // Add 1 hour to start time
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      await fetchPatientProtocols();
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  };

  const handleDateUpdate = async (date: string, updateRelated: boolean) => {
    switch (modalState.type) {
      case 'stage':
        await updateStageDates(date, updateRelated);
        break;
      case 'task':
        await updateTask(date);
        break;
      case 'event':
        await updateEvent(date);
        break;
    }
  };

  if (!selectedPatient) {
    return (
      <PlanContainer>
        <p>Please select a patient first</p>
      </PlanContainer>
    );
  }

  return (
    <PlanContainer>
      <h2>Create Treatment Plan</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="intervention">Intervention</Label>
          <Select
            id="intervention"
            value={selectedIntervention}
            onChange={(e) => setSelectedIntervention(e.target.value)}
            required
            disabled={interventionsLoading}
          >
            <option value="">
              {interventionsLoading 
                ? 'Loading interventions...' 
                : interventionsError 
                  ? 'Error loading interventions' 
                  : 'Select an Intervention'
              }
            </option>
            {interventions.map((intervention) => (
              <option key={intervention.id} value={intervention.id}>
                {intervention.name}
              </option>
            ))}
          </Select>
          {interventionsError && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {interventionsError}
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="protocol">Protocol</Label>
          <Select
            id="protocol"
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value)}
            required
            disabled={protocolsLoading}
          >
            <option value="">
              {protocolsLoading 
                ? 'Loading protocols...' 
                : protocolsError 
                  ? 'Error loading protocols' 
                  : 'Select a Protocol'
              }
            </option>
            {protocols
              .filter(protocol => !selectedIntervention || protocol.interventionId === selectedIntervention)
              .map((protocol) => (
                <option key={protocol.id} value={protocol.id}>
                  {protocol.name}
                </option>
              ))}
          </Select>
          {protocolsError && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {protocolsError}
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </FormGroup>

        <Button 
          type="submit" 
          disabled={loading || interventionsLoading || protocolsLoading || !selectedIntervention || !selectedProtocol || !startDate}
        >
          {loading ? 'Creating...' : 'Create Plan'}
        </Button>
      </Form>

      {loadingProtocols ? (
        <p>Loading plans...</p>
      ) : patientProtocols.length > 0 ? (
        <PlanDisplay>
          <h3>Current Treatment Plans</h3>
          {patientProtocols.map((protocol) => (
            <StageContainer key={protocol.id}>
              <StageHeader>
                <StageTitle>Protocol ID: {protocol.protocolId}</StageTitle>
                <div>Created: {formatDate(protocol.createdAt)}</div>
              </StageHeader>
              
              {protocol.stages.map((stage) => (
                <div key={stage.id} style={{ marginBottom: '2rem', padding: '1rem', borderLeft: '4px solid #e5e7eb' }}>
                  <StageHeader>
                    <StageTitle>Stage {stage.order}: {stage.name}</StageTitle>
                    <div>
                      Start Date: {formatDate(stage.startDate)}
                      <UpdateDateButton
                        onClick={() => setModalState({
                          isOpen: true,
                          type: 'stage',
                          itemId: stage.id,
                          protocolId: protocol.protocolId,
                          stageId: stage.id,
                        })}
                      >
                        Update Date
                      </UpdateDateButton>
                    </div>
                  </StageHeader>
                  {stage.description && (
                    <StageDescription>{stage.description}</StageDescription>
                  )}

                  <TasksList>
                    <h4>Tasks</h4>
                    {stage.tasks.map((task) => (
                      <TaskItem key={task.id}>
                        <TaskHeader>
                          <TaskTitle>{task.name}</TaskTitle>
                          <div>
                            Due: {formatDate(task.dueDate)}
                            <UpdateDateButton
                              onClick={() => setModalState({
                                isOpen: true,
                                type: 'task',
                                itemId: task.id,
                                protocolId: protocol.id,
                                stageId: stage.id,
                              })}
                            >
                              Update Date
                            </UpdateDateButton>
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
                    ))}
                  </TasksList>

                  <EventsList>
                    <h4>Events</h4>
                    {stage.events.map((event) => (
                      <EventItem key={event.id}>
                        <EventHeader>
                          <EventTitle>{event.title}</EventTitle>
                          <div>
                            {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}
                            <UpdateDateButton
                              onClick={() => setModalState({
                                isOpen: true,
                                type: 'event',
                                itemId: event.id,
                                protocolId: protocol.id,
                                stageId: stage.id,
                              })}
                            >
                              Update Date
                            </UpdateDateButton>
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
                    ))}
                  </EventsList>
                </div>
              ))}
            </StageContainer>
          ))}
        </PlanDisplay>
      ) : (
        <p>No treatment plans found for this patient.</p>
      )}

      <DateUpdateModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleDateUpdate}
        title={`Update ${modalState.type} Date`}
        initialDate={(() => {
          if (!modalState.type || !modalState.itemId) return undefined;
          const protocol = patientProtocols.find(p => p.id === modalState.protocolId);
          if (!protocol) return undefined;
          const stage = protocol.stages.find(s => s.id === modalState.stageId);
          if (!stage) return undefined;
          
          switch (modalState.type) {
            case 'stage':
              return stage.startDate;
            case 'task':
              return stage.tasks.find(t => t.id === modalState.itemId)?.dueDate;
            case 'event':
              return stage.events.find(e => e.id === modalState.itemId)?.startTime;
            default:
              return undefined;
          }
        })()}
        showUpdateRelated={modalState.type === 'stage'}
      />
    </PlanContainer>
  );
};

export default Plan; 