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
      <h1>Welcome to RecipeVerse</h1>
      <p>Craft personalized recipes with AI. Click below to log in with Google and get started.</p>
      <button style={buttonStyle} onClick={handleGoogleLogin}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Landing;
