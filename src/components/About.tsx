import React from 'react';

const About = () => {
  return (
    <section style={{
      minHeight: 'fit-content',
      display: 'flex',
      flexDirection: 'column',
      padding: '8% 10% 4%',
      backgroundColor: 'black',
      color: 'white',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
        gap: '4rem',
        marginBottom: '4rem',
      }}>
        <h2 style={{
          fontSize: 'clamp(3rem, 6vw, 5rem)',
          maxWidth: '800px',
          margin: 0,
          fontWeight: 'bold',
        }}>
          We are the first fertility clinic built around you. 
        </h2>
        <p style={{
          fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
          lineHeight: 1.6,
          margin: 0,
          alignSelf: 'center',
          paddingRight: '2rem',
        }}>
          Bable is a modern fertility clinic, seamlessly blending in-person and remote care with predictive insights, concierge-level coordination, and 24/7 support—turning your path to parenthood into a stress-free, empowering experience.
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
        gap: '2rem',
        position: 'relative',
        width: '100vw',
        margin: '0 auto',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        marginBottom: '0',
        overflow: 'hidden',
      }}>
        <img 
          src="/section2_1.png" 
          alt="Fertility Care" 
          style={{ 
            width: '100%',
            height: '60vh',
            objectFit: 'cover',
            objectPosition: 'center',
            position: 'relative',
            zIndex: 2,
          }} 
        />
      </div>
    </section>
  );
};

export default About; 