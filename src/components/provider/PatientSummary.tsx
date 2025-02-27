import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedPatient } from './ProviderLayout';
import { toast } from 'react-toastify';

const PageTitle = styled.h1`
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const PatientCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PatientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PatientName = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const PatientId = styled.span`
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
`;

const ContactInfo = styled.div`
  margin-bottom: 2rem;
  
  p {
    margin: 0.5rem 0;
    color: #4b5563;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const InfoCard = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 6px;
  
  h3 {
    margin: 0 0 1rem;
    font-size: 1.1rem;
    color: #374151;
  }
  
  p {
    margin: 0.5rem 0;
    color: #4b5563;
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    background: #4338ca;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: #6b7280;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ef4444;
`;

const NoPatientSelected = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 1.2rem;
`;

interface PatientDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  stage?: string;
  actionItems?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const PatientSummary = () => {
  const { currentUser } = useAuth();
  const { selectedPatient } = useSelectedPatient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientDetails | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!selectedPatient || !currentUser) {
        setPatientData(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://bable-be-300594224442.us-central1.run.app/api/patients/${selectedPatient.id}`, {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          },
        });

        const { success, data } = await response.json();

        if (!response.ok) {
          // Handle specific error cases
          if (data?.error === "Patient not found") {
            throw new Error(`Patient record could not be found. Please contact support if this issue persists.`);
          }
          throw new Error(data?.error || 'Failed to fetch patient data');
        }

        if (success && data) {
          setPatientData(data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching patient data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [selectedPatient, currentUser]);

  if (!selectedPatient) {
    return <NoPatientSelected>Please select a patient to view their summary</NoPatientSelected>;
  }

  if (loading) {
    return <LoadingState>Loading patient data...</LoadingState>;
  }

  if (error) {
    return <ErrorState>{error}</ErrorState>;
  }

  if (!patientData) {
    return <ErrorState>No patient data available</ErrorState>;
  }

  return (
    <div>
      <PageTitle>Patient Summary</PageTitle>
      <PatientCard>
        <PatientHeader>
          <PatientName>{patientData.firstName} {patientData.lastName}</PatientName>
          <PatientId>ID: {patientData.id}</PatientId>
        </PatientHeader>

        <ContactInfo>
          <p>Email: {patientData.email}</p>
          <p>Created: {patientData.createdAt ? new Date(patientData.createdAt).toLocaleDateString() : 'Not available'}</p>
          <p>Last Updated: {patientData.updatedAt ? new Date(patientData.updatedAt).toLocaleDateString() : 'Not available'}</p>
        </ContactInfo>

        <InfoGrid>
          <InfoCard>
            <h3>Stage</h3>
            <p>{patientData.stage || 'Not set'}</p>
            <ActionButton>Edit</ActionButton>
          </InfoCard>

          <InfoCard>
            <h3>Action Items</h3>
            {patientData.actionItems && patientData.actionItems.length > 0 ? (
              patientData.actionItems.map((item: string, index: number) => (
                <p key={index}>{item}</p>
              ))
            ) : (
              <p>No action items</p>
            )}
            <ActionButton>Edit</ActionButton>
          </InfoCard>
        </InfoGrid>
      </PatientCard>
    </div>
  );
};

export default PatientSummary; 