import React from 'react';
import { useNavigate } from 'react-router-dom';

const headerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '1rem 2rem',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoStyle: React.CSSProperties = {
  height: 60,
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  minHeight: '80vh',
  backgroundColor: '#f8f9fa',
  padding: '2rem',
};

const heroStyle: React.CSSProperties = {
  maxWidth: 600,
  width: '90%',
  borderRadius: 10,
  marginBottom: '2rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const headingStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  marginBottom: '1rem',
  color: '#333',
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  marginBottom: '2rem',
  color: '#555',
  maxWidth: 600,
};

const buttonStyle: React.CSSProperties = {
  padding: '0.8rem 1.5rem',
  fontSize: '1rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
};

const footerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  textAlign: 'center',
  padding: '1rem',
  fontSize: '0.9rem',
  color: '#888',
  boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
};

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <header style={headerStyle}>
        <img src="/static/logo.png" alt="RecipeVerse Logo" style={logoStyle} />
      </header>

      <main style={containerStyle}>
        <img src="/static/hero.png" alt="Hero" style={heroStyle} />
        <h1 style={headingStyle}>Welcome to RecipeVerse</h1>
        <p style={descriptionStyle}>
          Craft personalized recipes with the power of AI. Choose your ingredients, diet, and flavor style — we’ll do the rest.
        </p>
        <button style={buttonStyle} onClick={() => navigate('/login')}>
          Log In
        </button>
      </main>

      <footer style={footerStyle}>
        © 2025 RecipeVerse · Made with 🍳 and ❤️
      </footer>
    </>
  );
};

export default Landing;

