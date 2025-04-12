import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'black',
      color: 'white',
      padding: '4rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem'
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
              fontWeight: 'bold',
              marginBottom: '2rem'
            }}>
              CONTACT
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <a href="mailto:info@bablefertility.com" style={{ color: 'white', textDecoration: 'none' }}>
                info@bablefertility.com
              </a>
            </div>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            fontWeight: 'bold',
          }}>
            BABLE
          </h2>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 