import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProviderSidebar from './ProviderSidebar';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
}

export const SelectedPatientContext = createContext<{
  selectedPatient: PatientData | null;
  setSelectedPatient: (patient: PatientData | null) => void;
}>({
  selectedPatient: null,
  setSelectedPatient: () => {},
});

export const useSelectedPatient = () => useContext(SelectedPatientContext);

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

const Avatar = styled.div<{ hasImage?: boolean }>`
  width: 2rem;
  height: 2rem;
  background: ${props => props.hasImage ? 'transparent' : '#fef9c3'};
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  color: #854d0e;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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

const PatientSelect = styled.select`
  padding: 0.5rem;
  margin-right: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  min-width: 200px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProviderLayout = () => {
  const { currentUser, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePicUrl, setProfilePicUrl] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/users/me', {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const { success, data } = await response.json();
        if (success && data) {
          setProfilePicUrl(data.profilePictureUrl || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/patients/all', {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          });
          throw new Error(`Failed to fetch patients: ${errorData.error || response.statusText}`);
        }

        const { success, data } = await response.json();
        console.log('Patients API Response:', { success, patientCount: data?.length, data });
        if (success && Array.isArray(data)) {
          setPatients(data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        toast.error('Unable to load patients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [currentUser]);

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

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patient = patients.find(p => p.id === e.target.value) || null;
    setSelectedPatient(patient);
  };

  return (
    <SelectedPatientContext.Provider value={{ selectedPatient, setSelectedPatient }}>
      <LayoutContainer>
        <ProviderSidebar />
        <MainContent>
          <Header>
            <HeaderContent>
              <PatientSelect
                value={selectedPatient?.id || ''}
                onChange={handlePatientChange}
                disabled={loading}
              >
                <option value="">{loading ? 'Loading patients...' : 'Select Patient'}</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </PatientSelect>
              <ProfileButton onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                <Avatar hasImage={!!profilePicUrl}>
                  {profilePicUrl ? (
                    <AvatarImage src={profilePicUrl} alt="Profile" />
                  ) : (
                    currentUser.email ? getInitials(currentUser.email) : 'U'
                  )}
                </Avatar>
              </ProfileButton>
            </HeaderContent>
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
    </SelectedPatientContext.Provider>
  );
};

export default ProviderLayout; 