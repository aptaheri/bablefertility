import React from 'react';

const Testimonial = () => {
  return (
    <section style={{
      minHeight: '60vh',
      padding: '5%',
      background: 'linear-gradient(to right, #D67676, #F4C4C4)', // Updated with darker starting pink
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      color: 'white',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        color: 'white',
      }}>
        <p style={{
          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
          maxWidth: '1000px',
          marginBottom: '0.5rem',
          lineHeight: '1.2',
          fontWeight: 'bold',
        }}>
          "I suffered from depression because no one knew the emotional toll of the therapy and there was no way to get in touch with doctor other than over phone."
        </p>
      </div>
      <span style={{
        fontSize: '1.2rem',
        marginTop: '1rem',
      }}>
        - Sarah Mitchell
      </span>
    </section>
  );
};

export default Testimonial; 