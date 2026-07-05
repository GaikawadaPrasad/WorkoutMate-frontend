import React, { useState } from 'react';
import { Apple, Leaf, Flame, Plus, Check } from 'lucide-react';
import API from '../utils/api';

const FoodCard = ({ food, onLogged }) => {
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState(false);

  const handleQuickLog = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await API.post('/foods/log', { foodId: food._id, quantity: 100 });
      if (res.data && res.data.success) {
        setLogged(true);
        if (onLogged) onLogged(res.data.caloriesAdded);
        setTimeout(() => setLogged(false), 2000); // Reset toast state
      }
    } catch (err) {
      console.error('Error logging food item:', err);
    } finally {
      setLoading(false);
    }
  };

  const placeholderImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
  const displayImage = food.image ? (food.image.startsWith('http') ? food.image : `http://localhost:5000${food.image}`) : placeholderImage;

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full hover:scale-[1.01] hover:border-slate-700/60 transition-all duration-300">
      {/* Cover Image & Badges */}
      <div className="h-36 overflow-hidden relative">
        <img
          src={displayImage}
          alt={food.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = placeholderImage; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
        
        {/* Meal Type Badge */}
        <span className="absolute bottom-2 left-2 bg-slate-900/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          {food.mealType}
        </span>

        {/* Veg/Non-Veg Badge */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 shadow-sm
          ${food.vegNonVeg === 'Vegan' ? 'bg-purple-950/40 text-purple-400 border-purple-800' :
            food.vegNonVeg === 'Veg' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' :
            'bg-red-950/40 text-red-400 border-red-800'}`}
        >
          {food.vegNonVeg === 'Non-Veg' ? null : <Leaf size={10} />}
          <span>{food.vegNonVeg}</span>
        </span>
      </div>

      {/* Main Content */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <h4 className="font-bold text-slate-200 line-clamp-1 mb-2">{food.name}</h4>

        {/* Macro Nutrient Grid */}
        <div className="grid grid-cols-4 gap-1 text-center py-2 border-t border-b border-slate-800 bg-slate-950/30 rounded-lg mb-3">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Protein</div>
            <div className="text-sm font-bold text-emerald-400">{food.protein}g</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Carbs</div>
            <div className="text-sm font-bold text-blue-400">{food.carbs}g</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Fat</div>
            <div className="text-sm font-bold text-amber-400">{food.fat}g</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Kcal</div>
            <div className="text-sm font-bold text-slate-100 flex items-center justify-center">
              <Flame size={12} className="text-orange-500 mr-0.5" />
              {food.calories}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleQuickLog}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow transition-all duration-200
            ${logged
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200'
            }`}
          disabled={loading || logged}
        >
          {logged ? (
            <>
              <Check size={14} />
              <span>Logged (100g)</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>Log 100g</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
