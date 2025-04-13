import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '../firebase';

type UserType = 'patient' | 'provider' | 'admin';

interface AuthContextType {
  currentUser: User | null;
  userType: UserType | null;
  signup: (email: string, password: string, type: UserType) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext) as AuthContextType;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string, type: UserType) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    setUserType(type);
    return result;
  }

  async function login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Fetch user data from backend to get user type
    try {
      const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/users/me', {
        headers: {
          'Authorization': `Bearer ${await result.user.getIdToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const { success, data } = await response.json();
      if (success && data) {
        // Convert backend role to our UserType
        const type: UserType = data.role === 'ADMIN' ? 'admin' : 
                              data.role === 'NURSE' ? 'provider' : 'patient';
        setUserType(type);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    return result;
  }

  function logout() {
    setUserType(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const response = await fetch('https://bable-be-300594224442.us-central1.run.app/api/users/me', {
            headers: {
              'Authorization': `Bearer ${await user.getIdToken()}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const { success, data } = await response.json();
          if (success && data) {
            const type: UserType = data.role === 'ADMIN' ? 'admin' : 
                                  data.role === 'NURSE' ? 'provider' : 'patient';
            setUserType(type);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userType,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 