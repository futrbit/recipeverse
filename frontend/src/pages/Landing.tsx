import React from "react";
import { login } from "../auth";

const Landing: React.FC = () => {
  const handleLogin = async () => {
    try {
      await login(); // your existing login function
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", backgroundColor: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <header style={{ padding: "1rem 2rem", backgroundColor: "#ff7043", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>RecipeVerse</div>
        <button
          onClick={handleLogin}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#fff",
            color: "#ff7043",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Log In
        </button>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
        {/* Logo */}
        <div style={{ marginBottom: "2rem" }}>
          {/* Replace with <img src="/logo.png" ... /> once logo is available */}
          <div style={{ fontSize: "3rem", fontWeight: "bold", color: "#ff7043" }}>🍲</div>
        </div>

        {/* Hero Text */}
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Welcome to RecipeVerse</h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "600px", marginBottom: "2rem" }}>
          Your collaborative recipe universe. Share, explore, and save your favourite dishes from every cuisine.
        </p>

        {/* Log In Button (repeated for UX) */}
        <button
          onClick={handleLogin}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#ff7043",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Log In to Start Cooking
        </button>
      </main>

      {/* Footer */}
      <footer style={{ padding: "1rem", backgroundColor: "#f2f2f2", textAlign: "center", fontSize: "0.9rem" }}>
        © {new Date().getFullYear()} RecipeVerse. Made with love for foodies.
      </footer>
    </div>
  );
};

export default Landing;
