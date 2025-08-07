// src/pages/Landing.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#333", backgroundColor: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "20px", backgroundColor: "#ff6347", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "28px" }}>🍲 RecipeVerse</h1>
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: "#fff",
            color: "#ff6347",
            border: "2px solid #fff",
            padding: "10px 20px",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Log In
        </button>
      </header>

      {/* Hero Section */}
      <section style={{ flex: 1, padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", background: "linear-gradient(135deg, #ffe8e0, #ffffff)" }}>
        <h2 style={{ fontSize: "40px", marginBottom: "20px", color: "#222" }}>Welcome to RecipeVerse</h2>
        <p style={{ fontSize: "20px", maxWidth: "600px", marginBottom: "40px", color: "#444" }}>
          Discover, save, and share your favorite recipes from around the world. Whether you're a home cook or a kitchen wizard, RecipeVerse is your go-to destination for culinary inspiration.
        </p>
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: "#ff6347",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
            borderRadius: "6px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Get Cooking
        </button>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#f4f4f4", padding: "20px", textAlign: "center", color: "#777", fontSize: "14px" }}>
        © 2025 RecipeVerse. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
