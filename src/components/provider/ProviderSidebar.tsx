import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaCog, 
  FaClipboardList, 
  FaUserFriends, 
  FaComments, 
  FaCalendarAlt, 
  FaFlask, 
  FaCreditCard,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const SidebarContainer = styled.nav<{ isCollapsed: boolean }>`
  width: ${props => props.isCollapsed ? '60px' : '250px'};
  background-color: #FFD900;
  padding: 2rem 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
`;

const Logo = styled.div<{ isCollapsed: boolean }>`
  padding: 0 1.5rem 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: ${props => props.isCollapsed ? 'none' : 'block'};
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

const StyledNavLink = styled(NavLink)<{ isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: #1a1a1a;
  text-decoration: none;
  transition: background-color 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &.active {
    background-color: rgba(0, 0, 0, 0.1);
    font-weight: bold;
  }

  svg {
    margin-right: ${props => props.isCollapsed ? '0' : '0.75rem'};
    min-width: 20px;
  }

  span {
    display: ${props => props.isCollapsed ? 'none' : 'inline'};
  }
`;

const LogoutButton = styled.button<{ isCollapsed: boolean }>`
  margin: 1rem;
  padding: 0.75rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  display: ${props => props.isCollapsed ? 'none' : 'block'};

  &:hover {
    background-color: #dc2626;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #1a1a1a;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ProviderSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <SidebarContainer isCollapsed={isCollapsed}>
      <ToggleButton onClick={toggleSidebar}>
        {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </ToggleButton>
      <Logo isCollapsed={isCollapsed}>Bable Provider</Logo>
      <NavList>
        <NavItem>
          <StyledNavLink to="/provider/patients" isCollapsed={isCollapsed}>
            <FaUserFriends /> <span>Patient Summary</span>
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/plan" isCollapsed={isCollapsed}>
            <FaClipboardList /> <span>Plan</span>
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/messaging" isCollapsed={isCollapsed}>
            <FaComments /> <span>Messaging</span>
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/schedule" isCollapsed={isCollapsed}>
            <FaCalendarAlt /> <span>Schedule</span>
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/lab-results" isCollapsed={isCollapsed}>
            <FaFlask /> <span>Lab Results</span>
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/billing" isCollapsed={isCollapsed}>
            <FaCreditCard /> <span>Billing</span>
          </StyledNavLink>
        </NavItem>
        <NavItem>
          <StyledNavLink to="/provider/settings" isCollapsed={isCollapsed}>
            <FaCog /> <span>Settings</span>
          </StyledNavLink>
        </NavItem>
      </NavList>
      <LogoutButton onClick={handleLogout} isCollapsed={isCollapsed}>
        Logout
      </LogoutButton>
    </SidebarContainer>
  );
};

export default ProviderSidebar; 