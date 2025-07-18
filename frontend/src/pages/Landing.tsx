import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  textAlign: 'center',
  padding: '2rem',
};

const buttonStyle: React.CSSProperties = {
  padding: '1rem 2rem',
  fontSize: '1.2rem',
  backgroundColor: '#4285F4',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  marginTop: '2rem',
};

const logoStyle: React.CSSProperties = {
  width: '140px',
  marginBottom: '1.5rem',
};

const tagLineStyle: React.CSSProperties = {
  fontFamily: "'Press Start 2P', cursive",
  fontSize: '0.75rem',
  color: '#555',
  marginTop: '1rem',
  lineHeight: '1.8',
};

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <img src="/static/logo.png" alt="RecipeVerse Logo" style={logoStyle} />
      <h1>Welcome to <span style={{ color: '#218838' }}>RecipeVerse</span></h1>
      
      <p style={tagLineStyle}>
        Craft personalized recipes with AI.<br />
        Press Start to begin your flavour quest.
      </p>

      <button style={buttonStyle} onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Landing;
