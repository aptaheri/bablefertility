import React from 'react';

const Testimonial = () => {
  return (
    <section style={{
      minHeight: '60vh',
      padding: '5%',
      background: 'linear-gradient(to right, #D4AF37, #C0C0C0)', // Gold to silver gradient
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      color: 'white',
    }}>
      <span style={{
        fontSize: '4rem',
        marginBottom: '2rem',
      }}>
        "
      </span>
      <p style={{
        fontSize: 'clamp(1.5rem, 4vw, 3rem)',
        maxWidth: '1000px',
        marginBottom: '2rem',
        lineHeight: '1.4',
        fontWeight: 'bold',
      }}>
        Bable's innovative approach to fertility care transformed our journey. 
        Their personalized support and cutting-edge technology gave us hope 
        when we needed it most.
      </p>
      <span style={{
        fontSize: '1.2rem',
      }}>
        -Sarah Mitchell
      </span>
    </section>
  );
};

export default Testimonial; 