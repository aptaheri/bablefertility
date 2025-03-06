import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  padding: 2rem;
`;

const PageTitle = styled.h1`
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: #111827;
`;

const DangerZone = styled(Section)`
  border: 1px solid #ef4444;
  background: #fef2f2;
`;

const DangerZoneTitle = styled(SectionTitle)`
  color: #ef4444;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
`;

const DeleteButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background: #dc2626;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const WarningText = styled.p`
  color: #ef4444;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const Settings = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!currentUser) return;

      try {
        const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/patients/all', {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }

        const { success, data } = await response.json();
        if (success && Array.isArray(data)) {
          setPatients(data);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      }
    };

    const fetchProviders = async () => {
      if (!currentUser) return;

      try {
        const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/providers/all', {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch providers');
        }

        const { success, data } = await response.json();
        if (success && Array.isArray(data)) {
          setProviders(data);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
        toast.error('Failed to load providers');
      }
    };

    fetchPatients();
    fetchProviders();
  }, [currentUser]);

  const handleDeletePatient = async () => {
    if (!selectedPatientId || !currentUser) return;

    try {
      setLoading(true);
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/users/patient/${selectedPatientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      toast.success('Patient deleted successfully');
      setPatients(patients.filter(p => p.id !== selectedPatientId));
      setSelectedPatientId('');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProvider = async () => {
    if (!selectedProviderId || !currentUser) return;

    try {
      setProviderLoading(true);
      const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/users/provider/${selectedProviderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete provider');
      }

      toast.success('Provider deleted successfully');
      setProviders(providers.filter(p => p.id !== selectedProviderId));
      setSelectedProviderId('');
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Failed to delete provider');
    } finally {
      setProviderLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle>Settings</PageTitle>
      
      <DangerZone>
        <DangerZoneTitle>Danger Zone</DangerZoneTitle>
        <WarningText>
          Warning: Deleting a user will permanently remove their account and all associated data.
          This action cannot be undone.
        </WarningText>

        <SectionTitle>Delete Patient Account</SectionTitle>
        <Select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
        >
          <option value="">Select a patient to delete</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName} ({patient.email})
            </option>
          ))}
        </Select>

        <DeleteButton
          onClick={handleDeletePatient}
          disabled={!selectedPatientId || loading}
        >
          {loading ? 'Deleting...' : 'Delete Patient'}
        </DeleteButton>

        <SectionTitle style={{ marginTop: '2rem' }}>Delete Provider/Nurse Account</SectionTitle>
        <Select
          value={selectedProviderId}
          onChange={(e) => setSelectedProviderId(e.target.value)}
        >
          <option value="">Select a provider/nurse to delete</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.firstName} {provider.lastName} ({provider.email}) - {provider.role}
            </option>
          ))}
        </Select>

        <DeleteButton
          onClick={handleDeleteProvider}
          disabled={!selectedProviderId || providerLoading}
        >
          {providerLoading ? 'Deleting...' : 'Delete Provider/Nurse'}
        </DeleteButton>
      </DangerZone>
    </PageContainer>
  );
};

export default Settings; 