import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import { FaCog } from 'react-icons/fa';

const SidebarContainer = styled.nav`
  width: 250px;
  background-color: #FFD900;
  padding: 2rem 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  padding: 0 1.5rem 2rem;
  font-size: 1.5rem;
  font-weight: bold;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const NavItem = styled.li`
  margin: 0;
  padding: 0;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #1a1a1a;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background-color: rgba(0, 0, 0, 0.1);
    font-weight: bold;
  }

  svg {
    margin-right: 0.75rem;
  }
`;

const LogoutButton = styled.button`
  margin: 1rem;
  padding: 0.75rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dc2626;
  }
`;

const ProviderSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <SidebarContainer>
      <Logo>Bable Provider</Logo>
      <NavList>
        <NavItem>
          <StyledNavLink to="/provider/patients">
            Patient Summary
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/messaging">
            Messaging
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/schedule">
            Schedule
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/lab-results">
            Lab Results
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/billing">
            Billing
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/settings">
            <FaCog /> Settings
          </StyledNavLink>
        </NavItem>
      </NavList>
      <LogoutButton onClick={handleLogout}>
        Logout
      </LogoutButton>
    </SidebarContainer>
  );
};

export default ProviderSidebar; 