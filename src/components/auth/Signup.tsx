import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { User } from '../../types'; // Remove UserRole since it's unused

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'patient' | 'provider'>('provider');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // First create the authentication user
      const userCredential = await signup(email, password, userType);
      
      // Then create the user document in Firestore
      const userData: User = {
        id: userCredential.user.uid,
        email,
        firstName,
        lastName,
        role: userType === 'patient' ? 'PATIENT' : 'NURSE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add the user document to Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account');
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.logoContainer}>
        <img src="/icon.png" alt="Logo" className={styles.logo} />
        <h1>Bable Fertility</h1>
        <p>Create your account</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.userTypeSelector}>
          <button
            type="button"
            className={`${styles.typeButton} ${userType === 'provider' ? styles.active : ''}`}
            onClick={() => setUserType('provider')}
          >
            Provider
          </button>
          <button
            type="button"
            className={`${styles.typeButton} ${userType === 'patient' ? styles.active : ''}`}
            onClick={() => setUserType('patient')}
          >
            Patient
          </button>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          Sign Up
        </button>

        <Link to="/login" className={styles.switchAuthLink}>
          Already have an account? Login
        </Link>
      </form>
    </div>
  );
} 