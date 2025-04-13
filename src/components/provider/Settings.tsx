import React from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSection from './settings/ProfileSection';
import AdminSection from './settings/AdminSection';

const SettingsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #111827;
`;

const Settings = () => {
  const { currentUser, userType } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <SettingsContainer>
      <Title>Settings</Title>
      <ProfileSection />
      {userType === 'admin' && <AdminSection />}
    </SettingsContainer>
  );
};

export default Settings; 