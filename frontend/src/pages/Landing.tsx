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
      <header style={{
        background: '#000000',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <img src="/static/logo.png" alt="RecipeVerse Logo" style={{ height: '50px' }} />
      </header>

      <section className="container" style={{
        background: `url('/static/hero.png') no-repeat center/cover`,
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1 }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2, background: 'transparent' }}>
          <h1>Discover Your Next Meal with <span style={{ color: '#28a745' }}>RecipeVerse</span></h1>
          <p style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            Transform your ingredients into personalized recipes with AI. Start your culinary adventure today!
          </p>
          <button className="primary-button" onClick={handleGoogleLogin}>Get Started with Google</button>
        </div>
      </section>

      <section className="container">
        <h2>Why RecipeVerse?</h2>
        <p>
          RecipeVerse harnesses AI to craft unique recipes tailored to your ingredients, dietary preferences, and taste. Whether you're reducing food waste or seeking culinary inspiration, we make cooking effortless and exciting.
        </p>
      </section>

      <footer style={{
        background: '#000000',
        padding: '1rem',
        textAlign: 'center',
        color: '#ffffff',
        fontSize: '0.9rem',
        width: '100%',
      }}>
        Made with ❤️ by RecipeVerse &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Landing;