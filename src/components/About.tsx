import React from 'react';

const About = () => {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '8% 10%',
      backgroundColor: 'black',
      color: 'white',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '8rem',
        marginBottom: '8rem',
      }}>
        <h2 style={{
          fontSize: 'clamp(3rem, 6vw, 5rem)',
          maxWidth: '800px',
          margin: 0,
          fontWeight: 'bold',
        }}>
          The first fertility clinic built around you.
        </h2>
        <p style={{
          fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
          lineHeight: 1.6,
          margin: 0,
          alignSelf: 'center',
          paddingRight: '2rem',
        }}>
          Bable is a reimaged fertility clinic. One where the patient is first. Everything is personalized, predictive, and always available. Your journey should be exciting, not full of stress.
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2rem',
        position: 'relative',
        width: '90%',
        margin: '0 auto',
      }}>
        <img 
          src="/pink_pineapple.png" 
          alt="Fertility Care" 
          style={{ 
            width: '100%', 
            height: 'auto',
            transform: 'translateY(-4rem)',
            position: 'relative',
            zIndex: 2,
          }} 
        />
        <img 
          src="/water_pineapple.png" 
          alt="Modern Science" 
          style={{ 
            width: '100%', 
            height: 'auto',
            transform: 'translateY(4rem)',
            position: 'relative',
            zIndex: 1,
          }} 
        />
      </div>
    </section>
  );
};

export default About; 