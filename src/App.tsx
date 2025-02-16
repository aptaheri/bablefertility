import React from 'react';
import './App.css';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Testimonial from './components/Testimonial';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <div className="App">
        <Nav />
        <Hero />
        <About />
        <Features />
        <Testimonial />
        <Contact />
        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
