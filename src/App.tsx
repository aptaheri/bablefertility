import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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

  return (
    <div className="App">
      {!isProviderRoute && <Nav />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Provider Routes */}
        <Route path="/provider" element={<ProviderLayout />}>
          <Route path="patients" element={<PatientSummary />} />
          <Route path="messaging" element={<div>Messaging (Coming Soon)</div>} />
          <Route path="schedule" element={<div>Schedule (Coming Soon)</div>} />
          <Route path="lab-results" element={<div>Lab Results (Coming Soon)</div>} />
          <Route path="billing" element={<div>Billing (Coming Soon)</div>} />
        </Route>
      </Routes>
      {!isProviderRoute && <Footer />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
