import React from 'react';
import { Link } from 'react-router-dom';

export default function Cookbook({ recipes, username }) {
  return (
    <>
      <header style={headerStyle}>
        <img src="/static/logo.png" alt="RecipeVerse Logo" style={{ height: 50 }} />
        <nav>
          <Link to="/">Home</Link>
          <Link to="/cook">Recipe Generator</Link>
          <Link to="/cookbook">Cookbook</Link>
          <Link to="/logout">Logout</Link>
        </nav>
      </header>
      <main style={containerStyle}>
        <h1>{username}'s Cookbook</h1>
        {recipes.length > 0 ? (
          recipes.map((r) => (
            <article key={r.id} style={recipeStyle}>
              <h3>{r.title}</h3>
              <p><strong>Cuisine:</strong> {r.cuisine || 'Random'}</p>
              <p><strong>Dietary:</strong> {r.dietary || 'None'}</p>
              <p><strong>Ingredients:</strong> {r.ingredients}</p>
              <pre style={preStyle}>{r.instructions}</pre>
            </article>
          ))
        ) : (
          <p>No recipes saved yet.</p>
        )}
        <Link to="/" style={btnStyle}>Back to Dashboard</Link>
      </main>
      <footer style={footerStyle}>Made with ❤️ by RecipeVerse · © 2025</footer>
    </>
  );
}

const recipeStyle = {
  border: '1px solid #ccc',
  marginBottom: '1rem',
  padding: '1rem',
  borderRadius: 5,
};
const preStyle = {
  whiteSpace: 'pre-wrap',
  background: '#f9f9f9',
  padding: '1rem',
  borderRadius: 5,
};
// re-use headerStyle, containerStyle, btnStyle, footerStyle from above
