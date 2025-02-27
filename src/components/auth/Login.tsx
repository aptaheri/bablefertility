import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/provider/patients');
    } catch (err) {
      setError('Failed to sign in');
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.logoContainer}>
        <img src="/icon.png" alt="Logo" className={styles.logo} />
        <h1>Bable Fertility</h1>
        <p>Login to your account</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
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
          Login
        </button>

        <Link to="/signup" className={styles.switchAuthLink}>
          Need an account? Sign Up
        </Link>
      </form>
    </div>
  );
} 