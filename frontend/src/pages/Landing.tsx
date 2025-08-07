import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Landing.css"; // Make sure this exists or comment this out

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1 className="landing-title">Welcome to Recipeverse</h1>
        <p className="landing-subtitle">
          Discover, save, and share your favorite recipes in one delicious universe.
        </p>
        <button className="login-button" onClick={handleLoginClick}>
          Log In
        </button>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h2>Why Recipeverse?</h2>
          <p>
            Tired of scattered recipe notes, screenshots, and half-baked meal plans?
            Recipeverse brings everything together – smart, searchable, and social.
          </p>
          <ul>
            <li>🍳 Create and categorize your personal recipe vault</li>
            <li>🌍 Explore global dishes shared by food lovers</li>
            <li>🧠 AI-powered suggestions and smart cooking tips</li>
          </ul>
        </div>
        <div className="hero-image">
          <img src="/images/recipeverse-hero.jpg" alt="Delicious food collage" />
        </div>
      </section>

      <footer className="landing-footer">
        <p>Built with ❤️ for foodies everywhere. Join the Recipeverse.</p>
      </footer>
    </div>
  );
};

export default Landing;
