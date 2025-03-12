import React, { createContext, useContext, useState } from 'react';

interface ProfileContextType {
  profilePicUrl: string;
  setProfilePicUrl: (url: string) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profilePicUrl: '',
  setProfilePicUrl: () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profilePicUrl, setProfilePicUrl] = useState('');

  return (
    <ProfileContext.Provider value={{ profilePicUrl, setProfilePicUrl }}>
      {children}
    </ProfileContext.Provider>
  );
}; 