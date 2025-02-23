import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProviderSidebar from './ProviderSidebar';
import styled from '@emotion/styled';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: #f5f5f5;
  position: relative;
`;

const Header = styled.header`
  position: absolute;
  top: 0;
  right: 0;
  padding: 1rem 2rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const Avatar = styled.div`
  width: 2rem;
  height: 2rem;
  background: #fef9c3;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #854d0e;
`;

const ProfileMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const MenuItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 0.25rem;
  color: #374151;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const UserInfo = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0.5rem;
  
  h3 {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    margin: 0;
  }
  
  p {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0.25rem 0 0;
  }
`;

const ProviderLayout = () => {
  const { currentUser, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <LayoutContainer>
      <ProviderSidebar />
      <MainContent>
        <Header>
          <ProfileButton onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
            <Avatar>{currentUser.email ? getInitials(currentUser.email) : 'U'}</Avatar>
          </ProfileButton>
          <ProfileMenu isOpen={isProfileMenuOpen}>
            <UserInfo>
              <h3>{currentUser.email}</h3>
              <p>Provider</p>
            </UserInfo>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </ProfileMenu>
        </Header>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default ProviderLayout; 