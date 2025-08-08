// frontend/src/pages/Cook.tsx
import { useState, useEffect } from 'react';

const CookPage = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState<string>('Random');
  const [spiceLevel, setSpiceLevel] = useState<number>(3);
  const [portions, setPortions] = useState<number>(2);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/user_credits');
        if (res.ok) {
          const data = await res.json();
          setUserCredits(data.credits);
          setSubscriptionStatus(data.subscription_status);
        }
      } catch (error) {
        console.error('Error fetching user credits:', error);
      }
    };
    fetchCredits();
  }, []);

  const toggleDietary = (label: string) => {
    setDietary((prev) =>
      prev.includes(label) ? prev.filter((d) => d !== label) : [...prev, label]
    );
  };

  const handleClick = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
    }
  };

  const generateRecipe = async () => {
    setLoading(true);
    try {
      const res = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          dietary,
          cuisine,
          spice_level: spiceLevel,
          portions,
          cook_time: 30,
          difficulty: 'easy',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.error === "no_credits" || data.error === "daily_limit_reached") {
          setUserCredits(0);
          setResult(data.message || "You've reached your recipe generation limit.");
        } else {
          setResult(data.message || `Error: HTTP ${res.status}`);
        }
        setLoading(false);
        window.location.reload();
        return;
      }

      setResult(data.recipe_text || 'No recipe returned.');
      setLoading(false);

      if (data.remaining_credits !== undefined) {
        setUserCredits(data.remaining_credits);
      }

      window.location.reload();
    } catch (error) {
      console.error("Error during recipe generation:", error);
      setResult("Error: Could not generate recipe. Check console for details.");
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <div className="container">
        <h1>🧑‍🍳 Pick Ingredients</h1>

        {userCredits !== null && subscriptionStatus === 'free' && (
          <p>
            You have <span style={{ fontWeight: 'bold' }}>{userCredits}</span> credits remaining.
            <br />
            <a href="/pricing">Subscribe for unlimited recipes!</a>
          </p>
        )}
        {userCredits !== null && subscriptionStatus === 'premium' && (
          <p>
            You have a <span style={{ fontWeight: 'bold' }}>Premium</span> subscription!
          </p>
        )}
        {userCredits === null && (
          <p>Loading user data...</p>
        )}

        <div className="rv-input" style={{ marginTop: '1rem' }}>
          <label>
            Cuisine Style:
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
              <option value="Random">Random</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Indian">Indian</option>
              <option value="Thai">Thai</option>
              <option value="Greek">Greek</option>
            </select>
          </label>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <strong>Dietary Preferences:</strong><br />
          {['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free'].map((d) => (
            <button
              key={d}
              onClick={() => toggleDietary(d)}
              className={`dietary-btn ${dietary.includes(d) ? 'selected' : ''}`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="rv-slider" style={{ marginTop: '1rem' }}>
          <label>Spiciness: {spiceLevel}/5</label>
          <input
            type="range"
            min="1"
            max="5"
            value={spiceLevel}
            onChange={(e) => setSpiceLevel(Number(e.target.value))}
          />
        </div>

        <div className="rv-slider" style={{ marginTop: '1rem' }}>
          <label>Portions: {portions}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={portions}
            onChange={(e) => setPortions(Number(e.target.value))}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          {['chicken', 'tomato', 'garlic', 'cheese'].map((i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={`ingredient-btn ${ingredients.includes(i) ? 'selected' : ''}`}
            >
              {i}
            </button>
          ))}
        </div>

        <button
          className="button"
          onClick={generateRecipe}
          disabled={loading || ingredients.length === 0}
        >
          {loading ? 'Generating...' : 'Generate Recipe'}
        </button>

        <pre className="rv-result">{result}</pre>
      </div>
    </div>
  );
};

export default CookPage;