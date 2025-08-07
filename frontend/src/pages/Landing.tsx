import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(to right, #1a73e8, #4285f4)",
          color: "white",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>
          Welcome to CryptoVault Chat
        </h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "700px", margin: "0 auto" }}>
          Secure, decentralized, wallet-based messaging. Your privacy is our
          priority.
        </p>
        <button
          onClick={handleLogin}
          style={{
            marginTop: "30px",
            padding: "12px 24px",
            fontSize: "1.1rem",
            backgroundColor: "#ffcc00",
            color: "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Log In with Wallet
        </button>
      </section>

      {/* Info Section */}
      <section
        style={{
          padding: "40px 20px",
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <h2>Why CryptoVault?</h2>
        <p style={{ maxWidth: "800px", margin: "20px auto", fontSize: "1rem" }}>
          Chat with friends, discover new communities, and tip creators — all
          while keeping your data secure on the blockchain. No ads, no tracking,
          just pure encrypted communication.
        </p>
      </section>
    </div>
  );
}
