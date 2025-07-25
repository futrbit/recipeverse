// C:\Users\leebu\Desktop\recipeverse\frontend\src\Cook.tsx
import React, { useState, useEffect } from 'react';
import './Cook.css';

const Cook: React.FC = () => {
  const [username, setUsername] = useState<string>('User');
  const [credits, setCredits] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<number>(3);
  const [portions, setPortions] = useState<number>(2);
  const [cuisine, setCuisine] = useState<string>('');
  const [customIng, setCustomIng] = useState<string>('');
  const [recipe, setRecipe] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Ingredient categories
  const meats = ['Chicken', 'Beef', 'Fish', 'Pork', 'Lamb', 'Shrimp', 'Tofu', 'Tempeh', 'Eggs'];
  const vegetables = ['Carrot', 'Spinach', 'Onion', 'Tomato', 'Bell Pepper', 'Zucchini', 'Cauliflower', 'Broccoli'];
  const spices = ['Garlic', 'Ginger', 'Basil', 'Oregano', 'Thyme', 'Cumin', 'Turmeric', 'Paprika', 'Chili Flakes'];
  const carbs = ['Rice', 'Pasta', 'Potatoes', 'Couscous', 'Quinoa', 'Bread'];
  const cuisines = ['Random', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Mediterranean', 'Thai', 'French', 'Japanese'];
  const dietaryOptions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];

  // Fetch user info on mount
  useEffect(() => {
    fetch('/api/user-info', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user info');
        return res.json();
      })
      .then((data) => {
        setUsername(data.username || 'User');
        setCredits(data.credits);
      })
      .catch(() => {
        setUsername('User');
        setCredits(null);
      });
  }, []);

  const toggleIngredient = (item: string) => {
    setIngredients((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addCustomIngredient = () => {
    const trimmed = customIng.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
      setCustomIng('');
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError('Please select at least one ingredient.');
      return;
    }

    setLoading(true);
    setError('');
    setRecipe('Generating recipe...');

    try {
      const response = await fetch(`/generate?t=${new Date().getTime()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          dietary,
          spice_level: spiceLevel,
          cook_time: 30,
          difficulty: 'easy',
          portions,
          cuisine: cuisine || 'Random'
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 403) {
          window.location.href = '/login';
          return;
        }
        const err = await response.json();
        throw new Error(err.message || 'Generation failed');
      }

      const data = await response.json();
      setCredits(data.remaining_credits !== undefined ? data.remaining_credits : credits);
      setRecipe(data.recipe_text || 'Error: No recipe generated.');
    } catch (e: any) {
      setError('Error: Failed to generate recipe. Please try again.');
      setRecipe('');
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setIngredients([]);
    setDietary([]);
    setSpiceLevel(3);
    setPortions(2);
    setCuisine('');
    setCustomIng('');
    setRecipe('');
    setError('');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent('Check out my custom recipe from RecipeVerse! 🍳 https://recipeverse.com');
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent('Check out this cool recipe I made on RecipeVerse! 🍽️ https://recipeverse.com');
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('https://recipeverse.com').then(() => {
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div className="rv-container">
      <h1>Hello {username} 👋</h1>
      <p>
        You have <span>{credits !== null ? credits : '...'}</span> credits left.
        {credits === 0 && (
          <span> <a href="/pricing" style={{ color: '#218838' }}>Subscribe for unlimited recipes!</a></span>
        )}
      </p>

      <label htmlFor="cuisine">Cuisine Style (optional):</label>
      <select id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
        {cuisines.map((c) => (
          <option key={c} value={c === 'Random' ? '' : c}>{c}</option>
        ))}
      </select>

      <h2>Meats & Proteins</h2>
      <div className="rv-ingredients-group">
        {meats.map((item) => (
          <button
            key={item}
            className={`ingredient-btn ${ingredients.includes(item) ? 'selected' : ''}`}
            onClick={() => toggleIngredient(item)}
            disabled={loading}
          >
            {item}
          </button>
        ))}
      </div>

      <h2>Vegetables</h2>
      <div className="rv-ingredients-group">
        {vegetables.map((item) => (
          <button
            key={item}
            className={`ingredient-btn ${ingredients.includes(item) ? 'selected' : ''}`}
            onClick={() => toggleIngredient(item)}
            disabled={loading}
          >
            {item}
          </button>
        ))}
      </div>

      <h2>Spices & Herbs</h2>
      <div className="rv-ingredients-group">
        {spices.map((item) => (
          <button
            key={item}
            className={`ingredient-btn ${ingredients.includes(item) ? 'selected' : ''}`}
            onClick={() => toggleIngredient(item)}
            disabled={loading}
          >
            {item}
          </button>
        ))}
      </div>

      <h2>Base & Carbs</h2>
      <div className="rv-ingredients-group">
        {carbs.map((item) => (
          <button
            key={item}
            className={`ingredient-btn ${ingredients.includes(item) ? 'selected' : ''}`}
            onClick={() => toggleIngredient(item)}
            disabled={loading}
          >
            {item}
          </button>
        ))}
      </div>

      <h2>➕ Add Your Own Ingredient</h2>
      <div className="rv-input">
        <input
          type="text"
          id="customIng"
          placeholder="e.g., artichoke"
          value={customIng}
          onChange={(e) => setCustomIng(e.target.value)}
          disabled={loading}
        />
        <button onClick={addCustomIngredient} disabled={loading}>Add Food</button>
      </div>

      <h2>Dietary Preferences</h2>
      <div className="rv-ingredients-group">
        {dietaryOptions.map((item) => (
          <button
            key={item}
            className={`dietary-btn ${dietary.includes(item) ? 'selected' : ''}`}
            onClick={() => toggleDietary(item)}
            disabled={loading}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="rv-slider">
        <label>Spiciness: <span>{spiceLevel}</span>/5</label>
        <input
          type="range"
          min="1"
          max="5"
          value={spiceLevel}
          onChange={(e) => setSpiceLevel(parseInt(e.target.value))}
          disabled={loading}
        />
      </div>

      <div className="rv-slider">
        <label>Portions: <span>{portions}</span></label>
        <input
          type="range"
          min="1"
          max="10"
          value={portions}
          onChange={(e) => setPortions(parseInt(e.target.value))}
          disabled={loading}
        />
      </div>

      <h3>Selected Ingredients:</h3>
      <div className="rv-selected">{ingredients.join(', ') || 'None selected'}</div>

      <div className="rv-input">
        <button id="rv-generateBtn" onClick={handleGenerate} disabled={loading}>
          Generate Recipe
        </button>
        <button id="rv-resetBtn" onClick={resetSelection} disabled={loading}>
          Reset Selection
        </button>
      </div>

      {error && <div className="rv-error" role="alert">{error}</div>}
      {loading && <div className="rv-spinner" aria-live="polite" aria-busy="true"></div>}

      <div className="rv-result" aria-live="polite" style={{ display: recipe ? 'block' : 'none' }}>
        <pre>{recipe || 'Your recipe will appear here...'}</pre>
      </div>

      {recipe && (
  <div className="rv-share-section">
    <h3>📣 Share your dish!</h3>
    <button onClick={shareOnTwitter}>Share on X</button>
    <button onClick={shareOnWhatsApp}>WhatsApp</button>
    <button onClick={copyToClipboard}>Copy Link</button>
    <button onClick={goHome} style={{ marginLeft: '10px' }}>Home</button>
  </div>
)}



export default Cook;