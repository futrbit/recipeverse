// frontend/src/pages/Landing.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';

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
    <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: '#1a1a1a',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <img src="/static/logo.png" alt="RecipeVerse Logo" style={{ height: '50px' }} />
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{ color: '#28a745', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            Home
          </a>
          <a href="http://localhost:5000/login" style={{ color: '#28a745', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            Log In
          </a>
          <a href="http://localhost:5000/signup" style={{ color: '#28a745', textDecoration: 'none', fontSize: '1rem', fontWeight: 600 }}>
            Sign Up
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container" style={{
        background: `url('/static/hero.png') no-repeat center/cover`,
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        backgroundColor: '#1a1a1a',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1 }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, background: 'transparent' }}>
          <h1>Discover Your Next Meal with <span style={{ color: '#28a745' }}>RecipeVerse</span></h1>
          <p style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            Transform your ingredients into personalized recipes with AI.
          </p>
          <button onClick={handleGoogleLogin}>Get Started with Google</button>
        </div>
      </section>

      {/* About Section */}
      <section className="container">
        <h2>Why RecipeVerse?</h2>
        <p style={{ fontSize: '1.1rem', color: '#ffffff', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          RecipeVerse uses AI to create recipes tailored to your ingredients and preferences. Cooking made easy and exciting.
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1a1a1a',
        padding: '1rem',
        textAlign: 'center',
        color: '#28a745',
        fontSize: '0.9rem',
        width: '100%',
      }}>
        Made with ❤️ by RecipeVerse &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Landing;