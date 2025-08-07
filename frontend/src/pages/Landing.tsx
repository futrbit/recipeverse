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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4f4f4',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        padding: '1rem 2rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <img src="/static/logo.png" alt="RecipeVerse Logo" style={{
          height: '50px',
          animation: 'fadeIn 1s ease-in',
        }} />
        <nav style={{
          display: 'flex',
          gap: '1rem',
        }}>
          <a
            href="/"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'color 0.3s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#0056b3')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#007bff')}
          >
            Home
          </a>
          <a
            href="http://localhost:5000/login"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'color 0.3s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#0056b3')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#007bff')}
          >
            Log In
          </a>
          <a
            href="http://localhost:5000/signup"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'color 0.3s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#0056b3')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#007bff')}
          >
            Sign Up
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        background: `url('/static/hero.png') no-repeat center/cover`,
        height: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textAlign: 'center',
        position: 'relative',
        padding: '2rem',
        animation: 'fadeIn 1.5s ease-in',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)', // Dark overlay
          zIndex: 1,
        }}></div>
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '800px',
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          }}>
            Discover Your Next Meal with <span style={{ color: '#28a745' }}>RecipeVerse</span>
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            marginBottom: '2rem',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Transform your ingredients into personalized recipes with AI. Start your culinary adventure today!
          </p>
          <button
            onClick={handleGoogleLogin}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background-color 0.3s, transform 0.2s',
              animation: 'fadeInUp 1s ease-in 0.5s forwards',
              opacity: 0,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#218838';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Get Started with Google
          </button>
        </div>
      </section>

      {/* About Section */}
      <section style={{
        maxWidth: '1000px',
        margin: '4rem auto',
        padding: '2rem',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        textAlign: 'center',
        animation: 'fadeInUp 1s ease-in 0.7s forwards',
        opacity: 0,
      }}>
        <h2 style={{
          color: '#28a745',
          fontSize: '2rem',
          marginBottom: '1rem',
        }}>
          Why RecipeVerse?
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: '#333',
          lineHeight: 1.8,
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          RecipeVerse harnesses AI to craft unique recipes tailored to your ingredients, dietary preferences, and taste. Whether you're reducing food waste or seeking culinary inspiration, we make cooking effortless and exciting.
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#fff',
        padding: '1rem',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.9rem',
        boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
        width: '100%',
        marginTop: '2rem',
      }}>
        Made with ❤️ by RecipeVerse &copy; {new Date().getFullYear()}
      </footer>

      {/* Inline Keyframes for Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }
          nav {
            flex-direction: column;
            gap: 0.5rem;
          }
          section {
            height: auto;
            padding: 1rem;
          }
          h1 {
            font-size: 2rem !important;
          }
          p {
            font-size: 1rem !important;
          }
          button {
            padding: 0.8rem 1.5rem !important;
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;