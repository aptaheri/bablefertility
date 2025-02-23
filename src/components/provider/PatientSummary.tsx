import React from 'react';
import styled from '@emotion/styled';

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

const PatientSummary = () => {
  // This would normally come from your data store
  const patientData = {
    name: 'Sarah Smith',
    id: '12345',
    phone: '617-111-2222',
    email: 'sarahsmith@bable.com',
    emergency: '617-999-9999',
    stage: 'Initial Consultation',
    nextAppointment: 'March 13, 2025 11:00 AM',
    pharmacy: {
      name: 'CVS Pharmacy',
      address: '123 Main St, Cambridge MA 01239',
      phone: '617-456-7890'
    },
    labResults: 'Pending review',
    actionItems: [
      'Outstanding bill x',
      'Reach out in 3 weeks to confirm appointment'
    ]
  };

  return (
    <div>
      <PageTitle>Patient Summary</PageTitle>
      <PatientCard>
        <PatientHeader>
          <PatientName>{patientData.name}</PatientName>
          <PatientId>ID: {patientData.id}</PatientId>
        </PatientHeader>

        <ContactInfo>
          <p>Phone: {patientData.phone}</p>
          <p>Email: {patientData.email}</p>
          <p>Emergency Contact: {patientData.emergency}</p>
        </ContactInfo>

        <InfoGrid>
          <InfoCard>
            <h3>Stage</h3>
            <p>{patientData.stage}</p>
            <ActionButton>Edit</ActionButton>
          </InfoCard>

          <InfoCard>
            <h3>Next Appointment</h3>
            <p>{patientData.nextAppointment}</p>
            <ActionButton>Edit</ActionButton>
          </InfoCard>

          <InfoCard>
            <h3>Pharmacy</h3>
            <p>{patientData.pharmacy.name}</p>
            <p>{patientData.pharmacy.address}</p>
            <p>{patientData.pharmacy.phone}</p>
            <ActionButton>Edit</ActionButton>
          </InfoCard>

          <InfoCard>
            <h3>Latest Lab Results</h3>
            <p>{patientData.labResults}</p>
            <ActionButton>View</ActionButton>
          </InfoCard>

          <InfoCard>
            <h3>Action Items</h3>
            {patientData.actionItems.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
            <ActionButton>Edit</ActionButton>
          </InfoCard>
        </InfoGrid>
      </PatientCard>
    </div>
  );
};

export default PatientSummary; 