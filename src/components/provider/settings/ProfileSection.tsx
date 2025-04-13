import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../../contexts/ProfileContext';
import { toast } from 'react-toastify';
import { FaCamera, FaTrash } from 'react-icons/fa';

const ProfileSectionContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: #111827;
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

const ProfileSection = () => {
  const { currentUser } = useAuth();
  const { profilePicUrl, setProfilePicUrl } = useProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameUpdateLoading, setNameUpdateLoading] = useState(false);
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG or PNG image.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    try {
      setProfilePicLoading(true);
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
        throw new Error(errorData.details || errorData.error || `Failed to get upload URL: ${response.status}`);
      }

      const { uploadUrl, downloadUrl } = await response.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
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
    <ProfileSectionContainer>
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
    </ProfileSectionContainer>
  );
};

export default ProfileSection; 