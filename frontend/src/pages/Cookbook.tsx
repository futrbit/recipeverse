import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Recipe } from '../types';

const containerStyle: React.CSSProperties = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
};

const headerStyle: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '1rem',
};

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  margin: '0.5rem',
  backgroundColor: '#4285F4',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const footerStyle: React.CSSProperties = {
  marginTop: '2rem',
  fontSize: '0.9rem',
  color: '#666',
};

const Cookbook: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const idToken = localStorage.getItem('idToken');
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/cookbook`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching cookbook:', error);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Your Cookbook</h1>
      {recipes.length === 0 ? (
        <p>No recipes yet. Generate some!</p>
      ) : (
        recipes.map((recipe) => (
          <div key={recipe.id} style={{ marginBottom: '2rem' }}>
            <h3>{recipe.title}</h3>
            <p><strong>Cuisine:</strong> {recipe.cuisine || 'N/A'}</p>
            <p><strong>Dietary:</strong> {recipe.dietary || 'N/A'}</p>
            <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
            <p><strong>Instructions:</strong></p>
            <pre>{recipe.instructions}</pre>
            <p><strong>Nutrition:</strong> {recipe.nutrition || 'N/A'}</p>
            <p><strong>Created:</strong> {new Date(recipe.timestamp).toLocaleString()}</p>
          </div>
        ))
      )}
      <button style={btnStyle} onClick={() => window.history.back()}>
        Back
      </button>
      <footer style={footerStyle}>RecipeVerse &copy; 2025</footer>
    </div>
  );
};

export default Cookbook;
