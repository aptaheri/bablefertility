import React, { useState, useEffect } from 'react';
import { FaInstagram, FaYoutube, FaFacebook } from 'react-icons/fa';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

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
    backgroundColor: isScrolled ? '#F6D34E' : 'transparent',
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
  };

  const iconsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '2rem',
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

  const icons = [
    { Component: FaInstagram, url: 'https://instagram.com' },
    { Component: FaYoutube, url: 'https://youtube.com' },
    { Component: FaFacebook, url: 'https://facebook.com' },
  ];

  return (
    <nav style={navStyles}>
      <div style={brandStyles}>BABLE</div>
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
      </div>
    </nav>
  );
};

export default Nav; 