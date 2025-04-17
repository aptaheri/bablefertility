import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedPatient } from './ProviderLayout';
import { toast } from 'react-toastify';
import { PlanContainer } from './plan/StyledComponents';
import PlanForm from './plan/PlanForm';
import PlanDisplay from './plan/PlanDisplay';
import DateUpdateModal from './plan/DateUpdateModal';
import EventEditModal from './plan/EventEditModal';
import { User } from 'firebase/auth';

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
    startDate: string;
    isCompleted: boolean;
    tasks: Array<{
      id: string;
      name: string;
      description?: string;
      dueDate: string;
      type?: string;
      priority?: string;
      estimatedDuration?: number;
    }>;
    events: Array<{
      id: string;
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      recurrence?: string;
      recurrenceEndOffset?: number;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Add custom user type that includes role
interface CustomUser extends User {
  role?: string;
}

const Plan = () => {
  const { currentUser } = useAuth();
  const { selectedPatient } = useSelectedPatient();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
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
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    recurrence?: string;
    recurrenceEndOffset?: number;
  }>({
    isOpen: false,
    type: null,
    itemId: null,
    protocolId: null,
    stageId: null,
  });

  const [eventModalState, setEventModalState] = useState<{
    isOpen: boolean;
    eventId: string | null;
    protocolId: string | null;
    stageId: string | null;
    initialData?: {
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      recurrence?: string;
      recurrenceEndOffset?: number;
    };
  }>({
    isOpen: false,
    eventId: null,
    protocolId: null,
    stageId: null,
  });

  const currentUserWithRole = currentUser as CustomUser | null;

  const fetchInterventions = useCallback(async () => {
    if (!currentUserWithRole) return;

    try {
      setInterventionsLoading(true);
      setInterventionsError(null);
      
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/interventions', {
        headers: {
          'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
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
  }, [currentUserWithRole]);

  const fetchProtocols = useCallback(async () => {
    if (!currentUserWithRole) return;

    try {
      setProtocolsLoading(true);
      setProtocolsError(null);
      
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/protocols', {
        headers: {
          'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
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
  }, [currentUserWithRole]);

  const fetchPatientProtocols = useCallback(async () => {
    if (!currentUserWithRole || !selectedPatient) return;

    try {
      setLoadingProtocols(true);
      console.log('Fetching patient protocols for patient:', selectedPatient.id);
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/patients/${selectedPatient.id}/protocols`, {
        headers: {
          'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
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
      setPatientProtocols(data);
    } catch (error) {
      console.error('Error fetching patient protocols:', error);
      toast.error('Failed to load patient protocols');
    } finally {
      setLoadingProtocols(false);
    }
  }, [currentUserWithRole, selectedPatient]);

  useEffect(() => {
    if (currentUserWithRole) {
      fetchInterventions();
      fetchProtocols();
      fetchPatientProtocols();
    }
  }, [currentUserWithRole, fetchInterventions, fetchProtocols, fetchPatientProtocols]);

  const updateStageDates = async (date: string, updateRelated: boolean) => {
    if (!currentUserWithRole || !selectedPatient || !modalState.protocolId || !modalState.stageId) return;

    try {
      console.log('Updating stage dates with:', {
        patientId: selectedPatient.id,
        protocolId: modalState.protocolId,
        stageId: modalState.stageId,
        date,
        updateRelated
      });

      // Find the protocol that contains the stage we're looking for
      const protocol = patientProtocols.find(p => 
        p.stages.some(s => s.id === modalState.stageId)
      );
      
      if (!protocol) {
        throw new Error('Protocol not found');
      }

      const url = `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${modalState.stageId}/dates`;
      console.log('Making request to URL:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: date,
          updateTasksAndEvents: updateRelated,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
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

  const updateTask = async (
    protocolId: string,
    stageId: string,
    taskId: string,
    taskData: {
      name: string;
      description: string;
      dueDate: string;
      type?: string;
      priority?: string;
      estimatedDuration?: number;
    }
  ) => {
    if (!currentUserWithRole || !selectedPatient) return;

    try {
      // Find the protocol that contains the stage we're looking for
      const protocol = patientProtocols.find(p => 
        p.stages.some(s => s.id === stageId)
      );
      
      if (!protocol) {
        throw new Error('Protocol not found');
      }

      const response = await fetch(
        `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${stageId}/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to update task: ${errorData.error || response.statusText}`);
      }

      await fetchPatientProtocols();
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  const updateEvent = async (date: string) => {
    if (!currentUserWithRole || !selectedPatient || !modalState.protocolId || !modalState.stageId || !modalState.itemId) return;

    try {
      // Find the protocol that contains the stage we're looking for
      const protocol = patientProtocols.find(p => 
        p.stages.some(s => s.id === modalState.stageId)
      );
      
      if (!protocol) {
        throw new Error('Protocol not found');
      }

      const response = await fetch(
        `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${modalState.stageId}/events/${modalState.itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startTime: date,
            endTime: new Date(new Date(date).getTime() + 60 * 60 * 1000).toISOString(), // Add 1 hour to start time
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to update event: ${errorData.error || response.statusText}`);
      }

      await fetchPatientProtocols();
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update event');
      throw error;
    }
  };

  const handleDateUpdate = async (date: string, updateRelated: boolean) => {
    switch (modalState.type) {
      case 'stage':
        await updateStageDates(date, updateRelated);
        break;
      case 'task':
        await updateTask(modalState.protocolId as string, modalState.stageId as string, modalState.itemId as string, {
          name: '',
          description: '',
          dueDate: date,
          type: '',
          priority: '',
          estimatedDuration: 0,
        });
        break;
      case 'event':
        await updateEvent(date);
        break;
    }
  };

  const getInitialDate = () => {
    if (!modalState.type || !modalState.itemId) return undefined;
    const protocol = patientProtocols.find(p => p.id === modalState.protocolId || p.protocolId === modalState.protocolId);
    if (!protocol) return undefined;
    const stage = protocol.stages.find(s => s.id === modalState.stageId);
    if (!stage) return undefined;
    
    switch (modalState.type) {
      case 'stage':
        return stage.startDate;
      case 'task': {
        const task = stage.tasks.find(t => t.id === modalState.itemId);
        return task?.dueDate;
      }
      case 'event': {
        const event = stage.events.find(e => e.id === modalState.itemId);
        return event?.startTime;
      }
      default:
        return undefined;
    }
  };

  const handleEditEvent = (eventId: string) => {
    if (!selectedPatient) return;
    
    const protocol = patientProtocols.find(p => 
      p.stages.some(s => s.events.some(e => e.id === eventId))
    );
    if (!protocol) return;

    const stage = protocol.stages.find(s => s.events.some(e => e.id === eventId));
    if (!stage) return;

    const event = stage.events.find(e => e.id === eventId);
    if (!event) return;

    setEventModalState({
      isOpen: true,
      eventId,
      protocolId: protocol.id,
      stageId: stage.id,
      initialData: {
        title: event.title,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        recurrence: event.recurrence,
        recurrenceEndOffset: event.recurrenceEndOffset,
      },
    });
  };

  const handleSaveEvent = async (eventData: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    recurrence?: string;
    recurrenceEndOffset?: number;
  }) => {
    if (!currentUser || !selectedPatient || !eventModalState.protocolId || !eventModalState.stageId || !eventModalState.eventId) return;

    try {
      const protocol = patientProtocols.find(p => p.id === eventModalState.protocolId);
      if (!protocol) {
        throw new Error('Protocol not found');
      }

      const response = await fetch(
        `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${eventModalState.stageId}/events/${eventModalState.eventId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to update event: ${errorData.error || response.statusText}`);
      }

      await fetchPatientProtocols();
      setEventModalState({ isOpen: false, eventId: null, protocolId: null, stageId: null });
      toast.success('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update event');
    }
  };

  const handleDeleteTask = async (protocolId: string, stageId: string, taskId: string) => {
    if (!currentUserWithRole || !selectedPatient) return;

    try {
      console.log('Attempting to delete task:', { protocolId, stageId, taskId });
      console.log('Available protocols:', patientProtocols.map(p => ({
        id: p.id,
        protocolId: p.protocolId,
        stages: p.stages.map(s => ({
          id: s.id,
          tasks: s.tasks.map(t => t.id)
        }))
      })));

      // Find the protocol that contains the stage we're looking for
      const protocol = patientProtocols.find(p => 
        p.stages.some(s => s.id === stageId)
      );
      
      if (!protocol) {
        console.error('Protocol not found for stage:', stageId);
        throw new Error('Protocol not found');
      }

      console.log('Found protocol:', {
        id: protocol.id,
        protocolId: protocol.protocolId,
        stageCount: protocol.stages.length
      });

      // Try with protocol.id first
      let url = `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${stageId}/tasks/${taskId}`;
      console.log('Making request to URL:', url);

      let response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
        },
      });

      // If that fails, try with protocol.protocolId
      if (!response.ok) {
        console.log('First attempt failed, trying with protocolId');
        url = `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.protocolId}/stages/${stageId}/tasks/${taskId}`;
        console.log('Making request to URL:', url);

        response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
          },
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to delete task: ${errorData.error || response.statusText}`);
      }

      await fetchPatientProtocols();
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete task');
    }
  };

  const handleDeleteStage = async (protocolId: string, stageId: string) => {
    if (!currentUserWithRole || !selectedPatient) return;

    try {
      console.log('Attempting to delete stage:', { 
        protocolId, 
        stageId,
        patientId: selectedPatient.id 
      });
      
      console.log('Available protocols:', patientProtocols.map(p => ({
        id: p.id,
        protocolId: p.protocolId,
        stages: p.stages.map(s => ({
          id: s.id,
          name: s.name,
          order: s.order,
          startDate: s.startDate
        }))
      })));

      // Find the protocol that contains the stage we're looking for
      const protocol = patientProtocols.find(p => 
        p.stages.some(s => s.id === stageId)
      );
      
      if (!protocol) {
        console.error('Protocol not found for stage:', {
          stageId,
          availableProtocols: patientProtocols.map(p => ({
            id: p.id,
            protocolId: p.protocolId,
            stages: p.stages.map(s => s.id)
          }))
        });
        throw new Error('Protocol not found');
      }

      const matchingStage = protocol.stages.find(s => s.id === stageId);
      if (!matchingStage) {
        console.error('Stage not found in protocol:', {
          stageId,
          protocolProtocolId: protocol.protocolId,
          availableStages: protocol.stages.map(s => s.id)
        });
        throw new Error('Stage not found in the selected protocol');
      }

      console.log('Found protocol and stage:', {
        protocolId: protocol.id,
        protocolProtocolId: protocol.protocolId,
        stageCount: protocol.stages.length,
        matchingStage: {
          id: matchingStage.id,
          name: matchingStage.name,
          order: matchingStage.order,
          startDate: matchingStage.startDate
        }
      });

      // Try with protocol.id first
      let url = `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${stageId}`;
      console.log('Making request to URL:', url);

      let response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
        },
      });

      // If that fails, try with protocol.protocolId
      if (!response.ok) {
        console.log('First attempt failed, trying with protocolId');
        url = `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.protocolId}/stages/${stageId}`;
        console.log('Making request to URL:', url);

        response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
          },
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to delete stage: ${errorData.error || response.statusText}`);
      }

      await fetchPatientProtocols();
      toast.success('Stage deleted successfully');
    } catch (error) {
      console.error('Error deleting stage:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete stage');
    }
  };

  const handleDeleteEvent = async (protocolId: string, stageId: string, eventId: string) => {
    if (!currentUserWithRole || !selectedPatient) return;

    try {
      console.log('Attempting to delete event:', { protocolId, stageId, eventId });
      console.log('Available protocols:', patientProtocols.map(p => ({
        id: p.id,
        protocolId: p.protocolId,
        stages: p.stages.map(s => ({
          id: s.id,
          events: s.events.map(e => e.id)
        }))
      })));

      // Find the protocol that contains the stage we're looking for
      const protocol = patientProtocols.find(p => 
        p.stages.some(s => s.id === stageId)
      );
      
      if (!protocol) {
        console.error('Protocol not found for stage:', stageId);
        throw new Error('Protocol not found');
      }

      console.log('Found protocol:', {
        id: protocol.id,
        protocolId: protocol.protocolId,
        stageCount: protocol.stages.length
      });

      // Try with protocol.id first
      let url = `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${stageId}/events/${eventId}`;
      console.log('Making request to URL:', url);

      let response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
        },
      });

      // If that fails, try with protocol.protocolId
      if (!response.ok) {
        console.log('First attempt failed, trying with protocolId');
        url = `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.protocolId}/stages/${stageId}/events/${eventId}`;
        console.log('Making request to URL:', url);

        response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await currentUserWithRole.getIdToken()}`,
          },
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to delete event: ${errorData.error || response.statusText}`);
      }

      await fetchPatientProtocols();
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete event');
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
      <PlanForm
        interventions={interventions}
        protocols={protocols}
        interventionsLoading={interventionsLoading}
        protocolsLoading={protocolsLoading}
        interventionsError={interventionsError}
        protocolsError={protocolsError}
        onPlanCreated={fetchPatientProtocols}
      />

      <PlanDisplay
        patientProtocols={patientProtocols}
        loading={loadingProtocols}
        onUpdateStageDate={(protocol, stageId) => {
          setModalState({
            isOpen: true,
            type: 'stage',
            itemId: stageId,
            protocolId: protocol.protocolId,
            stageId,
          });
        }}
        onUpdateTask={updateTask}
        onEditEvent={handleEditEvent}
        onDeleteStage={handleDeleteStage}
        onDeleteTask={handleDeleteTask}
        onDeleteEvent={handleDeleteEvent}
      />

      <DateUpdateModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleDateUpdate}
        title={`Update ${modalState.type} Date`}
        initialDate={getInitialDate()}
        showUpdateRelated={modalState.type === 'stage'}
      />

      <EventEditModal
        isOpen={eventModalState.isOpen}
        onClose={() => setEventModalState({ isOpen: false, eventId: null, protocolId: null, stageId: null })}
        onSave={handleSaveEvent}
        initialData={eventModalState.initialData}
      />
    </PlanContainer>
  );
};

export default Plan;