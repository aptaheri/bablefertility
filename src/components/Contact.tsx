import React from 'react';
import './Contact.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Contact = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      const formData = new FormData(form);
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });
      
      // Clear the form
      form.reset();
      
      // Show toast message - you can use any toast library of your choice
      // For example, with react-toastify:
      toast.success('Thank you for your submission!');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <section style={{
      padding: '5% 1rem',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    }}>
      <div className="contact-container">
        <div className="contact-text">
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            marginBottom: '1rem',
            textAlign: 'left',
          }}>
            Welcome to Bable
          </h2>
          <div style={{ fontSize: '1.2rem', textAlign: 'left' }}>
            <p style={{ marginBottom: '1rem' }}>
              We're thrilled to support you on your fertility and reproductive health journey. Our goal is to make this process seamless, stress-free, and personalized to your needs.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Please complete the form below so our care team can tailor your experience. Your information will remain confidential and secure. If you have any questions, we're here for you 24/7.
            </p>
            <p>
              Let's get started!
            </p>
          </div>
        </div>

        <form 
          name="contact"
          method="POST"
          data-netlify="true"
          className="contact-form"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="form-name" value="contact" />
          <div className="contact-inputs">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
              }}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
              }}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '1rem',
              backgroundColor: 'black',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: 'fit-content',
              minWidth: '120px',
              alignSelf: 'center',
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