import React from 'react';

const Features = () => {
  const features = [
    "Personalized Care Plans",
    "24/7 Support",
    "Virtual Consultations",
    "Fertility Therapists",
    "Early, Comprehensive Testing",
    "All ART treatments (Egg Freezing, IUI, IVF, Surrogacy)",
    "Pregnancy Support",
    "Nutritionists",
  ];

  return (
    <section style={{
      minHeight: 'fit-content',
      padding: '4% 5% 0',
      backgroundColor: 'black',
      color: 'white',
    }}>
      <h2 style={{
        fontSize: 'clamp(3rem, 6vw, 5rem)',
        marginBottom: '1rem',
        textAlign: 'center',
      }}>
        We're Different
      </h2>
      <p style={{
        fontSize: 'clamp(1.2rem, 2vw, 1.8rem)',
        lineHeight: 1.6,
        maxWidth: '800px',
        marginBottom: '4rem',
        textAlign: 'center',
        margin: '0 auto 4rem',
      }}>
        At Bable, we combine cutting-edge technology with compassionate care. Our approach is rooted in science and focused on your individual journey. We understand that every fertility story is unique.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '2rem',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        {features.map((feature, index) => (
          <React.Fragment key={index}>
            <div style={{
              textAlign: 'center',
              padding: '0.25rem',
              fontSize: 'clamp(1.1rem, 1.5vw, 1.4rem)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              marginBottom: '1.25rem',
              fontWeight: 'bold',
            }}>
              {feature}
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={{
        position: 'relative',
        width: '100vw',
        marginTop: '4rem',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        overflow: 'hidden',
        fontSize: 0,
        lineHeight: 0,
        display: 'block',
        marginBottom: 0,
      }}>
        <img 
          src="/section2_2.png" 
          alt="Modern Science" 
          style={{ 
            width: '100vw',
            height: '60vh',
            objectFit: 'cover',
            objectPosition: 'center center',
            position: 'relative',
            zIndex: 1,
            display: 'block',
            verticalAlign: 'bottom',
            marginBottom: 0,
          }} 
        />
      </div>
    </section>
  );
};

export default Features; 