import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App" style={{
      backgroundImage: 'url("/cut_pineapple.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{
        fontSize: '4rem',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        fontWeight: 'bold'
      }}>
        WELCOME TO BABLE
      </h1>
    </div>
  );
}

export default App;
