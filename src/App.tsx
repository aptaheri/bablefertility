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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem'
    }}>
      <h1 style={{
        fontSize: '4rem',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        fontWeight: 'bold'
      }}>
        WELCOME TO BABLE
      </h1>
      
      <form 
        name="contact" 
        method="POST" 
        data-netlify="true"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '300px'
        }}
      >
        <input type="hidden" name="form-name" value="contact" />
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Your Name:
            <input 
              type="text" 
              name="name" 
              style={{ 
                width: '100%',
                padding: '0.5rem'
              }}
              required
            />
          </label>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Your Email:
            <input 
              type="email" 
              name="email" 
              style={{ 
                width: '100%',
                padding: '0.5rem'
              }}
              required
            />
          </label>
        </div>
        
        <button 
          type="submit"
          style={{
            padding: '0.75rem',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
