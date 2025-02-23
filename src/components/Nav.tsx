import React, { useState, useEffect } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const paddingStyle = isDesktop ? '2rem 8rem 2rem 4rem' : '1.5rem 3rem';
  const iconSize = isDesktop ? 28 : 24;

  const navStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 9999,
    padding: paddingStyle,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    backgroundColor: isScrolled ? '#000000' : 'transparent',
    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
    boxSizing: 'border-box',
  };

  const brandStyles: React.CSSProperties = {
    fontSize: isDesktop ? '2rem' : '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    flexShrink: 0,
    textDecoration: 'none',
  };

  const iconsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: isDesktop ? '2rem' : '1rem',
    alignItems: 'center',
    marginLeft: 'auto',
    flexShrink: 0,
  };

  const iconStyles: React.CSSProperties = {
    color: 'white',
    transition: 'transform 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${iconSize}px`,
    height: `${iconSize}px`,
  };

  const authButtonStyles: React.CSSProperties = {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1.5rem',
    borderRadius: '25px',
    border: '2px solid white',
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    background: 'transparent',
    marginLeft: isDesktop ? '2rem' : '1rem',
  };

  const icons = [
    { Component: FaInstagram, url: 'https://www.instagram.com/bablefertility?igsh=YXV1dWRxa2VycDk5&utm_source=qr' },
  ];

  return (
    <nav style={navStyles}>
      <Link to="/" style={brandStyles}>BABLE</Link>
      <div style={iconsContainerStyles}>
        {icons.map(({ Component, url }, index) => (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={iconStyles}
          >
            <Component size={iconSize} />
          </a>
        ))}
        {currentUser ? (
          <button onClick={handleLogout} style={authButtonStyles}>
            Logout
          </button>
        ) : (
          <Link to="/login" style={authButtonStyles}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Nav; 