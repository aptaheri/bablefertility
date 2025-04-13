import React from 'react';
import styled from '@emotion/styled';
import InterventionManagement from './InterventionManagement';
import ProtocolManagement from './ProtocolManagement';
import StageDefinitionManagement from './StageDefinitionManagement';
import DangerZone from './DangerZone';

const AdminSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AdminSection = () => {
  return (
    <AdminSectionContainer>
      <InterventionManagement />
      <ProtocolManagement />
      <StageDefinitionManagement />
      <DangerZone />
    </AdminSectionContainer>
  );
};

export default AdminSection; 