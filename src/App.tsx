import React from 'react';
import './App.css';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Testimonial from './components/Testimonial';
import Contact from './components/Contact';

function App() {
  return (
    <div className="App">
      <Nav />
      <Hero />
      <About />
      <Features />
      <Testimonial />
      <Contact />
    </div>
  );
}

export default App;
