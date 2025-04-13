import React, { useState, useEffect } from 'react';
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

const InterventionCard = styled.div<{ selected: boolean }>`
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

interface Intervention {
  id: string;
  name: string;
  description: string;
}

const InterventionManagement = () => {
  const { currentUser } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIntervention, setNewIntervention] = useState({ name: '', description: '' });
  const [managementLoading, setManagementLoading] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchInterventions = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      
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
      setError(error instanceof Error ? error.message : 'Failed to load interventions');
      toast.error(error instanceof Error ? error.message : 'Failed to load interventions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, [currentUser]);

  const handleCreateIntervention = async () => {
    if (!currentUser || !newIntervention.name.trim()) return;

    try {
      setManagementLoading(true);
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/interventions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIntervention),
      });

      if (!response.ok) {
        throw new Error('Failed to create intervention');
      }

      const { success, data } = await response.json();
      if (success) {
        setInterventions([...interventions, data]);
        setNewIntervention({ name: '', description: '' });
        toast.success('Intervention created successfully');
        await fetchInterventions();
      }
    } catch (error) {
      console.error('Error creating intervention:', error);
      toast.error('Failed to create intervention');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleUpdateIntervention = async () => {
    if (!currentUser || !selectedIntervention) return;

    try {
      setManagementLoading(true);
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/interventions/${selectedIntervention.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIntervention),
      });

      if (!response.ok) {
        throw new Error('Failed to update intervention');
      }

      // Update the intervention in the list with the form data
      const updatedIntervention = {
        ...selectedIntervention,
        name: newIntervention.name,
        description: newIntervention.description
      };
      
      setInterventions(prevInterventions => 
        prevInterventions.map(intervention => 
          intervention.id === selectedIntervention.id ? updatedIntervention : intervention
        )
      );
      
      setNewIntervention({ name: '', description: '' });
      setSelectedIntervention(null);
      setIsEditing(false);
      toast.success('Intervention updated successfully');

    } catch (error) {
      console.error('Error updating intervention:', error);
      toast.error('Failed to update intervention');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleDeleteIntervention = async () => {
    if (!currentUser || !selectedIntervention) return;

    try {
      setManagementLoading(true);
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/interventions/${selectedIntervention.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete intervention');
      }

      const { success } = await response.json();
      if (success) {
        setInterventions(interventions.filter(i => i.id !== selectedIntervention.id));
        setNewIntervention({ name: '', description: '' });
        setSelectedIntervention(null);
        setIsEditing(false);
        toast.success('Intervention deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting intervention:', error);
      toast.error('Failed to delete intervention');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleSelectIntervention = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setNewIntervention({
      name: intervention.name,
      description: intervention.description,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setSelectedIntervention(null);
    setNewIntervention({ name: '', description: '' });
    setIsEditing(false);
  };

  return (
    <ManagementSection>
      <ManagementForm>
        <ManagementTitle>Intervention Management</ManagementTitle>
        <Input
          type="text"
          placeholder="Intervention Name"
          value={newIntervention.name}
          onChange={(e) => setNewIntervention({ ...newIntervention, name: e.target.value })}
        />
        <TextArea
          placeholder="Intervention Description"
          value={newIntervention.description}
          onChange={(e) => setNewIntervention({ ...newIntervention, description: e.target.value })}
        />
        <ButtonGroup>
          {isEditing ? (
            <>
              <UpdateButton
                onClick={handleUpdateIntervention}
                disabled={managementLoading || !newIntervention.name.trim()}
              >
                {managementLoading ? 'Updating...' : 'Update Intervention'}
              </UpdateButton>
              <DeleteButton
                onClick={handleDeleteIntervention}
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
              onClick={handleCreateIntervention}
              disabled={managementLoading || !newIntervention.name.trim()}
            >
              {managementLoading ? 'Creating...' : 'Create Intervention'}
            </ManagementButton>
          )}
        </ButtonGroup>
      </ManagementForm>

      <ListContainer>
        <ListTitle>Existing Interventions</ListTitle>
        <ScrollableContent>
          {loading ? (
            <div>Loading interventions...</div>
          ) : error ? (
            <div style={{ color: '#ef4444' }}>{error}</div>
          ) : interventions.length === 0 ? (
            <div>No interventions found</div>
          ) : (
            interventions.map((intervention) => (
              <InterventionCard
                key={intervention.id}
                selected={selectedIntervention?.id === intervention.id}
                onClick={() => handleSelectIntervention(intervention)}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {intervention.name}
                </div>
                <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  {intervention.description || 'No description provided'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Intervention ID: {intervention.id}
                </div>
              </InterventionCard>
            ))
          )}
        </ScrollableContent>
      </ListContainer>
    </ManagementSection>
  );
};

export default InterventionManagement; 