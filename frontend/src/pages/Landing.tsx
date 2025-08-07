// src/pages/Landing.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css"; // Optional: for later custom styles

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="landing-page" style={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "20px", textAlign: "center", borderBottom: "1px solid #333" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>RecipeVerse</h1>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        {/* Logo */}
        <img
          src="/logo.png"
          alt="RecipeVerse Logo"
          style={{
            width: "300px",
            height: "auto",
            marginBottom: "20px",
          }}
        />
        <h2 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
          Welcome to RecipeVerse
        </h2>
        <p style={{ fontSize: "1.2rem", maxWidth: "600px", marginBottom: "30px" }}>
          Discover, share, and explore recipes from around the world. Your next
          favorite dish is just a click away.
        </p>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: "#fff",
            color: "#000",
            padding: "12px 24px",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            borderRadius: "6px",
            fontWeight: "bold",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ddd")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          Log In
        </button>
      </main>

      {/* Footer */}
      <footer style={{ padding: "20px", textAlign: "center", borderTop: "1px solid #333" }}>
        <small>© {new Date().getFullYear()} RecipeVerse. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default Landing;
