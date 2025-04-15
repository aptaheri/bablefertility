import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ManagementSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
`;

const ManagementTitle = styled.h2`
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
`;

const ManagementForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const ListContainer = styled.div`
  flex: 1;
  max-height: 400px;
  display: flex;
  flex-direction: column;
`;

const ListTitle = styled.h3`
  margin: 0 0 1rem;
`;

const ScrollableContent = styled.div`
  overflow-y: auto;
  padding-right: 1rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  min-height: 300px;
  resize: vertical;
  font-family: monospace;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const ManagementButton = styled(Button)`
  background: #4f46e5;
  color: white;
  margin-bottom: 1rem;

  &:hover:not(:disabled) {
    background: #4338ca;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const DeleteButton = styled(Button)`
  background: #ef4444;
  color: white;

  &:hover:not(:disabled) {
    background: #dc2626;
  }
`;

const UpdateButton = styled(Button)`
  background: #10b981;
  color: white;

  &:hover:not(:disabled) {
    background: #059669;
  }
`;

const CancelButton = styled(Button)`
  background: #6b7280;
  color: white;

  &:hover:not(:disabled) {
    background: #4b5563;
  }
`;

const StageDefinitionCard = styled.div<{ selected: boolean }>`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: white;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid ${props => props.selected ? '#4f46e5' : 'transparent'};

  &:hover {
    border-color: #4f46e5;
  }
`;

interface Protocol {
  id: string;
  name: string;
  description: string;
}

interface StageDefinition {
  id: string;
  name: string;
  description: string;
  order: number;
  protocolId: string;
  interventionId: string;
  defaultTasks: any[];
  defaultEvents: any[];
}

const StageDefinitionManagement = () => {
  const { currentUser } = useAuth();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [stageDefinitions, setStageDefinitions] = useState<StageDefinition[]>([]);
  const [stageDefinitionsLoading, setStageDefinitionsLoading] = useState(false);
  const [stageDefinitionsError, setStageDefinitionsError] = useState<string | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [managementLoading, setManagementLoading] = useState(false);
  const [selectedStageDefinition, setSelectedStageDefinition] = useState<StageDefinition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [protocolsLoading, setProtocolsLoading] = useState(false);
  const [protocolsError, setProtocolsError] = useState<string | null>(null);

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

  const fetchStageDefinitions = useCallback(async () => {
    if (!currentUser) return;

    try {
      setStageDefinitionsLoading(true);
      setStageDefinitionsError(null);
      
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/stage-definitions', {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to fetch stage definitions: ${errorData.error || response.statusText}`);
      }

      const rawResponse = await response.text();
      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      const definitionsData = Array.isArray(data) ? data : data?.data;
      
      if (Array.isArray(definitionsData)) {
        setStageDefinitions(definitionsData);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching stage definitions:', error);
      setStageDefinitionsError(error instanceof Error ? error.message : 'Failed to load stage definitions');
      toast.error(error instanceof Error ? error.message : 'Failed to load stage definitions');
    } finally {
      setStageDefinitionsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchProtocols();
    fetchStageDefinitions();
  }, [currentUser, fetchProtocols, fetchStageDefinitions]);

  const validateJsonInput = (input: string): StageDefinition | null => {
    try {
      const parsed = JSON.parse(input);
      
      // Basic validation
      if (!parsed.name || !parsed.protocolId || !parsed.interventionId || 
          typeof parsed.order !== 'number' || 
          !Array.isArray(parsed.defaultTasks) || 
          !Array.isArray(parsed.defaultEvents)) {
        throw new Error('Invalid stage definition format');
      }
      
      return parsed;
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON format');
      return null;
    }
  };

  const handleCreateStageDefinition = async () => {
    if (!currentUser) return;

    const stageDefData = validateJsonInput(jsonInput);
    if (!stageDefData) return;

    try {
      setManagementLoading(true);
      setJsonError(null);

      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/stage-definitions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stageDefData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to create stage definition: ${errorData.error || response.statusText}`);
      }

      const { success } = await response.json();
      if (success) {
        // First fetch the updated data
        await fetchStageDefinitions();
        // Then clear the form and show success message
        setJsonInput('');
        toast.success('Stage definition created successfully');
      }
    } catch (error) {
      console.error('Error creating stage definition:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create stage definition');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleUpdateStageDefinition = async () => {
    if (!currentUser || !selectedStageDefinition) return;

    const stageDefData = validateJsonInput(jsonInput);
    if (!stageDefData) return;

    try {
      setManagementLoading(true);
      setJsonError(null);

      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/stage-definitions/${selectedStageDefinition.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stageDefData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to update stage definition: ${errorData.error || response.statusText}`);
      }

      const { success, data } = await response.json();
      if (success) {
        setStageDefinitions(stageDefinitions.map(def => 
          def.id === selectedStageDefinition.id ? data : def
        ));
        setJsonInput('');
        setSelectedStageDefinition(null);
        setIsEditing(false);
        toast.success('Stage definition updated successfully');
        await fetchStageDefinitions();
      }
    } catch (error) {
      console.error('Error updating stage definition:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update stage definition');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleDeleteStageDefinition = async () => {
    if (!currentUser || !selectedStageDefinition) return;

    try {
      setManagementLoading(true);

      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/stage-definitions/${selectedStageDefinition.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(`Failed to delete stage definition: ${errorData.error || response.statusText}`);
      }

      setStageDefinitions(stageDefinitions.filter(def => def.id !== selectedStageDefinition.id));
      setJsonInput('');
      setSelectedStageDefinition(null);
      setIsEditing(false);
      toast.success('Stage definition deleted successfully');
    } catch (error) {
      console.error('Error deleting stage definition:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete stage definition');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleSelectStageDefinition = (definition: StageDefinition) => {
    setSelectedStageDefinition(definition);
    setJsonInput(JSON.stringify(definition, null, 2));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedStageDefinition(null);
    setJsonInput('');
    setIsEditing(false);
  };

  return (
    <ManagementSection>
      <ManagementForm>
        <ManagementTitle>Stage Definition Management</ManagementTitle>
        <TextArea
          placeholder={`Enter stage definition JSON. Example:
{
  "name": "Suppression",
  "description": "Initial suppression phase of the treatment protocol",
  "order": 1,
  "interventionId": "intervention-123",
  "protocolId": "protocol-456",
  "defaultTasks": [
    {
      "title": "Take Drug X - Day 1",
      "description": "Take 1 pill of Drug X at 8:00 AM.",
      "type": "medication",
      "dueDateOffset": 0,
      "priority": "high",
      "estimatedDuration": 5
    }
  ],
  "defaultEvents": [
    {
      "title": "Nurse Check-In",
      "description": "Morning check-in with the nurse to monitor medication reactions.",
      "startTimeOffset": 0,
      "duration": 30,
      "type": "checkin",
      "recurrence": "daily",
      "recurrenceEndOffset": 7
    }
  ]
}`}
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setJsonError(null);
          }}
        />
        {jsonError && (
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            {jsonError}
          </div>
        )}
        <ButtonGroup>
          {isEditing ? (
            <>
              <UpdateButton
                onClick={handleUpdateStageDefinition}
                disabled={managementLoading || !jsonInput.trim()}
              >
                {managementLoading ? 'Updating...' : 'Update Stage Definition'}
              </UpdateButton>
              <DeleteButton
                onClick={handleDeleteStageDefinition}
                disabled={managementLoading}
              >
                {managementLoading ? 'Deleting...' : 'Delete'}
              </DeleteButton>
              <CancelButton
                onClick={handleCancelEdit}
                disabled={managementLoading}
              >
                Cancel
              </CancelButton>
            </>
          ) : (
            <ManagementButton
              onClick={handleCreateStageDefinition}
              disabled={managementLoading || !jsonInput.trim()}
            >
              {managementLoading ? 'Creating...' : 'Create Stage Definition'}
            </ManagementButton>
          )}
        </ButtonGroup>
      </ManagementForm>

      <ListContainer>
        <ListTitle>Existing Stage Definitions</ListTitle>
        <ScrollableContent>
          {stageDefinitionsLoading ? (
            <div>Loading stage definitions...</div>
          ) : stageDefinitionsError ? (
            <div style={{ color: '#ef4444' }}>{stageDefinitionsError}</div>
          ) : stageDefinitions.length === 0 ? (
            <div>No stage definitions found</div>
          ) : (
            stageDefinitions.map((definition) => (
              <StageDefinitionCard
                key={definition.id}
                selected={selectedStageDefinition?.id === definition.id}
                onClick={() => handleSelectStageDefinition(definition)}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {definition.name}
                </div>
                <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  {definition.description || 'No description provided'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  Protocol: {protocols.find(p => p.id === definition.protocolId)?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  Order: {definition.order}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  Tasks: {(definition.defaultTasks || []).length}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  Events: {(definition.defaultEvents || []).length}
                </div>
              </StageDefinitionCard>
            ))
          )}
        </ScrollableContent>
      </ListContainer>
    </ManagementSection>
  );
};

export default StageDefinitionManagement; 