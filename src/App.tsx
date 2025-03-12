import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import Nav from './components/Nav';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Testimonial from './components/Testimonial';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import ProviderLayout from './components/provider/ProviderLayout';
import PatientSummary from './components/provider/PatientSummary';
import Schedule from './components/provider/Schedule';
import Messaging from './components/provider/Messaging';
import Settings from './components/provider/Settings';
import './App.css';

function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Features />
      <Testimonial />
      <Contact />
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isProviderRoute = location.pathname.startsWith('/provider');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
  const shouldShowNavAndFooter = !isProviderRoute && !isAuthRoute;

  return (
    <div className="App">
      {shouldShowNavAndFooter && <Nav />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Provider Routes */}
        <Route path="/provider" element={<ProviderLayout />}>
          <Route path="patients" element={<PatientSummary />} />
          <Route path="messaging" element={<Messaging />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="lab-results" element={<div>Lab Results (Coming Soon)</div>} />
          <Route path="billing" element={<div>Billing (Coming Soon)</div>} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      {shouldShowNavAndFooter && <Footer />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <AppContent />
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
