import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard: React.FC = () => {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Load credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await axios.get("/api/user-credits");
        setCredits(res.data.credits);
      } catch (err) {
        console.error("Failed to load credits", err);
      }
    };

    fetchCredits();
  }, []);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/generate-recipe", {
        ingredients,
      });
      setRecipe(res.data.recipe);
      setCredits((prev) => (prev !== null ? prev - 1 : null));
    } catch (err) {
      console.error("Error generating recipe", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101010] text-white flex flex-col items-center justify-start py-12 px-4">
      <h1 className="text-4xl font-bold mb-4 text-[#FF4ADC]">RecipeVerse Dashboard</h1>
      <p className="text-lg mb-6">You have <span className="text-[#00FFB3] font-bold">{credits}</span> credits remaining</p>

      <div className="w-full max-w-2xl mb-4">
        <input
          className="w-full p-4 rounded-lg border-2 border-[#FF4ADC] bg-black text-white placeholder-gray-400 text-lg"
          placeholder="Enter ingredients or cravings (e.g. ‘chicken, lemon, garlic’)..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || credits === 0}
        className="px-8 py-3 bg-[#FF4ADC] hover:bg-[#ff2dc2] text-black font-bold rounded-full mb-6 transition duration-200 shadow-md arcade-button"
      >
        {loading ? "Cooking..." : "Generate Recipe"}
      </button>

      {recipe && (
        <div className="w-full max-w-2xl bg-[#1f1f1f] text-white p-6 rounded-xl mt-4 border border-[#00FFB3] shadow-lg whitespace-pre-line">
          <h2 className="text-2xl mb-2 text-[#00FFB3] font-semibold">🍽️ Your Recipe:</h2>
          <pre className="text-base font-mono">{recipe}</pre>
        </div>
      )}

      <footer className="w-full text-center mt-16 text-sm text-gray-500 border-t border-[#333] pt-6">
        &copy; {new Date().getFullYear()} RecipeVerse. Built with love and garlic.
      </footer>
    </div>
  );
};

export default Dashboard;
