import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { toast } from 'react-toastify';
import { FaCamera, FaTrash } from 'react-icons/fa';

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

const ProfileSection = styled(Section)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: visible;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #9ca3af;
  text-transform: uppercase;
  border-radius: 50%;
  background-color: #f3f4f6;
`;

const UploadButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #FFD700;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  transform: translate(0, -10%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #ffd900;
  }

  svg {
    width: 20px;
    height: 20px;
    color: #000000;
  }

  &:disabled {
    background: #e5e7eb;
    cursor: not-allowed;
    
    svg {
      color: #9ca3af;
    }
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 1rem;
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

const DeleteProfilePicButton = styled(Button)`
  background: #ef4444;
  color: white;

  &:hover:not(:disabled) {
    background: #dc2626;
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

const UpdateButton = styled(Button)`
  background: #4f46e5;
  color: white;

  &:hover:not(:disabled) {
    background: #4338ca;
  }
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
  const { profilePicUrl, setProfilePicUrl } = useProfile();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameUpdateLoading, setNameUpdateLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      }
    };

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

    fetchUserData();
    fetchPatients();
    fetchProviders();
  }, [currentUser, setProfilePicUrl]);

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

  const handleImagePick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleUpdateName = async () => {
    if (!currentUser || !firstName.trim() || !lastName.trim()) return;

    try {
      setNameUpdateLoading(true);
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/users/update-name', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.details || errorData.error || 'Failed to update name');
      }

      toast.success('Name updated successfully');
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update name');
    } finally {
      setNameUpdateLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!currentUser) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG or PNG image.');
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    try {
      setProfilePicLoading(true);
      console.log('Getting upload URL...');

      const firebaseIdToken = await currentUser.getIdToken();
      
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/users/profile-picture/upload-url', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firebaseIdToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileType: file.type,
          fileName: file.name
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Upload error details:', errorData);
        throw new Error(errorData.details || errorData.error || `Failed to get upload URL: ${response.status}`);
      }

      const { uploadUrl, downloadUrl } = await response.json();
      console.log('Upload URL received:', uploadUrl);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (!uploadResponse.ok) {
        console.error('Upload response:', uploadResponse);
        throw new Error(`Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      console.log('File uploaded successfully');
      
      setProfilePicUrl(downloadUrl);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile picture');
    } finally {
      setProfilePicLoading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!currentUser) return;

    try {
      setProfilePicLoading(true);
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/users/profile-picture', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to delete profile picture');
      }

      setProfilePicUrl('');
      toast.success('Profile picture deleted successfully');
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete profile picture');
    } finally {
      setProfilePicLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle>Settings</PageTitle>
      
      <ProfileSection>
        <SectionTitle>Profile Picture</SectionTitle>
        <AvatarContainer>
          {profilePicUrl ? (
            <Avatar src={profilePicUrl} alt="Profile" />
          ) : (
            <AvatarPlaceholder>
              {currentUser?.email ? currentUser.email[0].toUpperCase() : 'U'}
            </AvatarPlaceholder>
          )}
          <UploadButton
            onClick={handleImagePick}
            disabled={profilePicLoading}
            title="Upload new picture"
          >
            <FaCamera />
          </UploadButton>
          <HiddenInput
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
          />
        </AvatarContainer>

        {profilePicUrl && (
          <ProfileActions>
            <DeleteProfilePicButton
              onClick={handleDeleteProfilePicture}
              disabled={profilePicLoading}
            >
              <FaTrash /> Remove Picture
            </DeleteProfilePicButton>
          </ProfileActions>
        )}
      </ProfileSection>

      <Section>
        <SectionTitle>Update Name</SectionTitle>
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <UpdateButton
          onClick={handleUpdateName}
          disabled={nameUpdateLoading || !firstName.trim() || !lastName.trim()}
        >
          {nameUpdateLoading ? 'Updating...' : 'Update Name'}
        </UpdateButton>
      </Section>
      
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