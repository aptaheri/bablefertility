import React from 'react';

const Contact = () => {
  return (
    <section style={{
      minHeight: '100vh',
      padding: '5%',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '4rem',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            marginBottom: '1rem',
          }}>
            Reach Out
          </h2>
          <p style={{ fontSize: '1.2rem' }}>
            Take the first step towards your fertility journey. Our team is here to support you every step of the way.
          </p>
        </div>

        <form style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
          }}>
            <input
              type="text"
              placeholder="First Name"
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            <input
              type="text"
              placeholder="Last Name"
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            style={{
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '1rem',
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact; 