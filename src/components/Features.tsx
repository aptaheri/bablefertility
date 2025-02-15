import React from 'react';

const Features = () => {
  const features = [
    "Personalized Care Plans",
    "Advanced Technology",
    "Expert Consultations",
    "24/7 Support",
    "Comprehensive Testing",
    "Holistic Approach",
  ];

  return (
    <section style={{
      minHeight: '100vh',
      padding: '5%',
      backgroundColor: 'black',
      color: 'white',
    }}>
      <h2 style={{
        fontSize: 'clamp(2rem, 4vw, 3.5rem)',
        marginBottom: '1rem',
      }}>
        We're Different
      </h2>
      <p style={{
        fontSize: '1.2rem',
        maxWidth: '800px',
        marginBottom: '4rem',
      }}>
        At Bable, we combine cutting-edge technology with compassionate care. Our approach is rooted in science and focused on your individual journey. We understand that every fertility story is unique.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
      }}>
        {features.map((feature, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>•</span>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features; 