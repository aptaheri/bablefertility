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

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  min-height: 100px;
  resize: vertical;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
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

const ProtocolCard = styled.div<{ selected: boolean }>`
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

const ProtocolManagement = () => {
  const { currentUser } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [interventionsLoading, setInterventionsLoading] = useState(false);
  const [interventionsError, setInterventionsError] = useState<string | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [protocolsLoading, setProtocolsLoading] = useState(false);
  const [protocolsError, setProtocolsError] = useState<string | null>(null);
  const [newProtocol, setNewProtocol] = useState({ name: '', description: '', interventionId: '' });
  const [managementLoading, setManagementLoading] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  useEffect(() => {
    fetchInterventions();
    fetchProtocols();
  }, [currentUser, fetchInterventions, fetchProtocols]);

  const handleCreateProtocol = async () => {
    if (!currentUser || !newProtocol.name.trim() || !newProtocol.interventionId) return;

    try {
      setManagementLoading(true);
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/protocols', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProtocol),
      });

      if (!response.ok) {
        throw new Error('Failed to create protocol');
      }

      const { success, data } = await response.json();
      if (success) {
        setProtocols([...protocols, data]);
        setNewProtocol({ name: '', description: '', interventionId: '' });
        toast.success('Protocol created successfully');
        await fetchProtocols();
      }
    } catch (error) {
      console.error('Error creating protocol:', error);
      toast.error('Failed to create protocol');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleUpdateProtocol = async () => {
    if (!currentUser || !selectedProtocol) return;

    try {
      setManagementLoading(true);
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/protocols/${selectedProtocol.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProtocol),
      });

      if (!response.ok) {
        throw new Error('Failed to update protocol');
      }

      // Update the protocol in the list with the form data
      const updatedProtocol = {
        ...selectedProtocol,
        name: newProtocol.name,
        description: newProtocol.description,
        interventionId: newProtocol.interventionId
      };
      
      setProtocols(prevProtocols => 
        prevProtocols.map(protocol => 
          protocol.id === selectedProtocol.id ? updatedProtocol : protocol
        )
      );
      
      setNewProtocol({ name: '', description: '', interventionId: '' });
      setSelectedProtocol(null);
      setIsEditing(false);
      toast.success('Protocol updated successfully');

    } catch (error) {
      console.error('Error updating protocol:', error);
      toast.error('Failed to update protocol');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleDeleteProtocol = async () => {
    if (!currentUser || !selectedProtocol) return;

    try {
      setManagementLoading(true);
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/protocols/${selectedProtocol.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete protocol');
      }

      const { success } = await response.json();
      if (success) {
        setProtocols(protocols.filter(p => p.id !== selectedProtocol.id));
        setNewProtocol({ name: '', description: '', interventionId: '' });
        setSelectedProtocol(null);
        setIsEditing(false);
        toast.success('Protocol deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting protocol:', error);
      toast.error('Failed to delete protocol');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleSelectProtocol = (protocol: Protocol) => {
    setSelectedProtocol(protocol);
    setNewProtocol({
      name: protocol.name,
      description: protocol.description,
      interventionId: protocol.interventionId,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedProtocol(null);
    setNewProtocol({ name: '', description: '', interventionId: '' });
    setIsEditing(false);
  };

  return (
    <ManagementSection>
      <ManagementForm>
        <ManagementTitle>Protocol Management</ManagementTitle>
        <Select
          value={newProtocol.interventionId}
          onChange={(e) => setNewProtocol({ ...newProtocol, interventionId: e.target.value })}
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
          <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            {interventionsError}
          </div>
        )}
        <Input
          type="text"
          placeholder="Protocol Name"
          value={newProtocol.name}
          onChange={(e) => setNewProtocol({ ...newProtocol, name: e.target.value })}
        />
        <TextArea
          placeholder="Protocol Description"
          value={newProtocol.description}
          onChange={(e) => setNewProtocol({ ...newProtocol, description: e.target.value })}
        />
        <ButtonGroup>
          {isEditing ? (
            <>
              <UpdateButton
                onClick={handleUpdateProtocol}
                disabled={managementLoading || !newProtocol.name.trim() || !newProtocol.interventionId}
              >
                {managementLoading ? 'Updating...' : 'Update Protocol'}
              </UpdateButton>
              <DeleteButton
                onClick={handleDeleteProtocol}
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
              onClick={handleCreateProtocol}
              disabled={managementLoading || !newProtocol.name.trim() || !newProtocol.interventionId}
            >
              {managementLoading ? 'Creating...' : 'Create Protocol'}
            </ManagementButton>
          )}
        </ButtonGroup>
      </ManagementForm>

      <ListContainer>
        <ListTitle>Existing Protocols</ListTitle>
        <ScrollableContent>
          {protocolsLoading ? (
            <div>Loading protocols...</div>
          ) : protocolsError ? (
            <div style={{ color: '#ef4444' }}>{protocolsError}</div>
          ) : protocols.length === 0 ? (
            <div>No protocols found</div>
          ) : (
            protocols.map((protocol) => (
              <ProtocolCard
                key={protocol.id}
                selected={selectedProtocol?.id === protocol.id}
                onClick={() => handleSelectProtocol(protocol)}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {protocol.name}
                </div>
                <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  {protocol.description || 'No description provided'}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                  Intervention: {interventions.find(i => i.id === protocol.interventionId)?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div>Protocol ID: {protocol.id}</div>
                  <div>Intervention ID: {protocol.interventionId}</div>
                </div>
              </ProtocolCard>
            ))
          )}
        </ScrollableContent>
      </ListContainer>
    </ManagementSection>
  );
};

export default ProtocolManagement; 