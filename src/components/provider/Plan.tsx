import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedPatient } from './ProviderLayout';
import { toast } from 'react-toastify';
import { PlanContainer } from './plan/StyledComponents';
import PlanForm from './plan/PlanForm';
import PlanDisplay from './plan/PlanDisplay';
import DateUpdateModal from './plan/DateUpdateModal';

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

  const updateStageDates = async (date: string, updateRelated: boolean) => {
    if (!currentUser || !selectedPatient || !modalState.protocolId || !modalState.stageId) return;

    try {
      const protocol = patientProtocols.find(p => p.id === modalState.protocolId || p.protocolId === modalState.protocolId);
      if (!protocol) {
        throw new Error('Protocol not found');
      }

      const url = `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${modalState.stageId}/dates`;
      
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
      const protocol = patientProtocols.find(p => p.id === modalState.protocolId || p.protocolId === modalState.protocolId);
      if (!protocol) {
        throw new Error('Protocol not found');
      }

      const response = await fetch(
        `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${modalState.stageId}/tasks/${modalState.itemId}`,
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
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to update task: ${errorData.error || response.statusText}`);
      }

      await fetchPatientProtocols();
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update task');
      throw error;
    }
  };

  const updateEvent = async (date: string) => {
    if (!currentUser || !selectedPatient || !modalState.protocolId || !modalState.stageId || !modalState.itemId) return;

    try {
      const protocol = patientProtocols.find(p => p.id === modalState.protocolId || p.protocolId === modalState.protocolId);
      if (!protocol) {
        throw new Error('Protocol not found');
      }

      const response = await fetch(
        `https://bable-be-300594224442.us-central1.run.app/api/patient-stages/${selectedPatient.id}/protocols/${protocol.id}/stages/${modalState.stageId}/events/${modalState.itemId}`,
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
        await updateTask(date);
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
        onUpdateStageDate={(protocolId, stageId) => setModalState({
          isOpen: true,
          type: 'stage',
          itemId: stageId,
          protocolId,
          stageId,
        })}
        onUpdateTaskDate={(protocolId, stageId, taskId) => setModalState({
          isOpen: true,
          type: 'task',
          itemId: taskId,
          protocolId,
          stageId,
        })}
        onUpdateEventDate={(protocolId, stageId, eventId) => setModalState({
          isOpen: true,
          type: 'event',
          itemId: eventId,
          protocolId,
          stageId,
        })}
      />

      <DateUpdateModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSave={handleDateUpdate}
        title={`Update ${modalState.type} Date`}
        initialDate={getInitialDate()}
        showUpdateRelated={modalState.type === 'stage'}
      />
    </PlanContainer>
  );
};

export default Plan; 