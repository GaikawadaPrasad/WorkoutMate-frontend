import React, { useState, useEffect } from 'react';
import FoodCard from '../components/FoodCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Search, Apple, RefreshCw, Calculator, Flame, ShieldAlert, Award } from 'lucide-react';
import API from '../utils/api';

const DietPlans = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');
  const [selectedPref, setSelectedPref] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Macro Calculator inputs
  const [calcInputs, setCalcInputs] = useState({
    weight: 70,
    height: 175,
    age: 25,
    gender: 'Male',
    activityLevel: 'Moderately Active',
    goal: 'Maintain Weight',
  });
  const [calcResults, setCalcResults] = useState(null);

  const fetchFoods = async () => {
    try {
      const params = {
        page,
        limit: 8,
        search: searchVal || undefined,
        mealType: selectedMeal || undefined,
        vegNonVeg: selectedPref || undefined,
      };

      const res = await API.get('/foods', { params });
      if (res.data && res.data.success) {
        setFoods(res.data.data);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [page, selectedMeal, selectedPref]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchFoods();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchVal]);

  const handleResetFilters = () => {
    setSearchVal('');
    setSelectedMeal('');
    setSelectedPref('');
    setPage(1);
  };

  // Macro/Calorie Calculator handler
  const handleCalculateMacros = (e) => {
    e.preventDefault();
    const { weight, height, age, gender, activityLevel, goal } = calcInputs;

    // BMR (Mifflin-St Jeor)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    if (gender === 'Male') bmr += 5;
    else if (gender === 'Female') bmr -= 161;
    else bmr -= 78;

    // TDEE Multipliers
    let multiplier = 1.2;
    if (activityLevel === 'Lightly Active') multiplier = 1.375;
    else if (activityLevel === 'Moderately Active') multiplier = 1.55;
    else if (activityLevel === 'Very Active') multiplier = 1.725;

    const tdee = Math.round(bmr * multiplier);

    // Goal adjustments
    let targetCal = tdee;
    if (goal === 'Fat Loss') targetCal = tdee - 500;
    else if (goal === 'Muscle Gain') targetCal = tdee + 350;

    targetCal = Math.max(targetCal, 1200);

    // Target Macros split (40% Carbs, 30% Protein, 30% Fat)
    const proteinG = Math.round((targetCal * 0.3) / 4);
    const carbsG = Math.round((targetCal * 0.4) / 4);
    const fatG = Math.round((targetCal * 0.3) / 9);

    // BMI
    const bmiVal = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));

    setCalcResults({
      bmi: bmiVal,
      calories: targetCal,
      protein: proteinG,
      carbs: carbsG,
      fat: fatG,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-950/20 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-2">
            <Apple className="text-emerald-500" />
            <span>Diet & Nutrition Hub</span>
          </h2>
          <p className="text-slate-400 text-sm">Calculate target thresholds and explore food catalog items.</p>
        </div>
        <button
          onClick={handleResetFilters}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw size={14} />
          <span>Reset Explorer</span>
        </button>
      </div>

      {/* MACRO CALCULATOR SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Input Parameters Form */}
        <div className="lg:col-span-1 glass-card p-6 rounded-3xl h-fit border-slate-800">
          <h3 className="font-extrabold text-lg text-slate-100 border-b border-slate-800 pb-3 mb-4 flex items-center space-x-1.5">
            <Calculator size={18} className="text-emerald-500" />
            <span>Macro & BMI Calculator</span>
          </h3>

          <form onSubmit={handleCalculateMacros} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Weight (kg)</label>
                <input
                  type="number"
                  value={calcInputs.weight}
                  onChange={(e) => setCalcInputs({ ...calcInputs, weight: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Height (cm)</label>
                <input
                  type="number"
                  value={calcInputs.height}
                  onChange={(e) => setCalcInputs({ ...calcInputs, height: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Age (Years)</label>
                <input
                  type="number"
                  value={calcInputs.age}
                  onChange={(e) => setCalcInputs({ ...calcInputs, age: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                <select
                  value={calcInputs.gender}
                  onChange={(e) => setCalcInputs({ ...calcInputs, gender: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Activity Tier</label>
              <select
                value={calcInputs.activityLevel}
                onChange={(e) => setCalcInputs({ ...calcInputs, activityLevel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
              >
                <option value="Sedentary">Sedentary (No exercise)</option>
                <option value="Lightly Active">Lightly Active (1-2 days/wk)</option>
                <option value="Moderately Active">Moderately Active (3-5 days/wk)</option>
                <option value="Very Active">Very Active (6-7 days/wk)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Goal</label>
              <select
                value={calcInputs.goal}
                onChange={(e) => setCalcInputs({ ...calcInputs, goal: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
              >
                <option value="Maintain Weight">Maintain Weight</option>
                <option value="Fat Loss">Fat Loss (Deficit)</option>
                <option value="Muscle Gain">Muscle Gain (Surplus)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow shadow-emerald-600/10"
            >
              Calculate Targets
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border-slate-800 flex flex-col justify-center">
          {calcResults ? (
            <div className="space-y-6">
              <h4 className="font-extrabold text-lg text-slate-100 border-b border-slate-800 pb-2 flex items-center space-x-1">
                <span>Calculated Targets</span>
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded font-bold">BMI: {calcResults.bmi}</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Calorie Intake</span>
                  <span className="text-xl font-black text-slate-100 flex items-center">
                    <Flame size={18} className="text-orange-500 mr-1" />
                    {calcResults.calories} kcal
                  </span>
                </div>
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">Protein Target</span>
                  <span className="text-xl font-black text-emerald-400">{calcResults.protein}g</span>
                </div>
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] text-blue-400 uppercase font-semibold">Carbs Target</span>
                  <span className="text-xl font-black text-blue-400">{calcResults.carbs}g</span>
                </div>
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] text-amber-400 uppercase font-semibold">Fat Target</span>
                  <span className="text-xl font-black text-amber-400">{calcResults.fat}g</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 leading-relaxed p-3.5 bg-emerald-950/10 border border-emerald-900/30 rounded-2xl">
                🚀 <span className="font-semibold text-emerald-400">Dietary Advice:</span> For optimal results, split these macros across 4-5 small meals spaced 3-4 hours apart. Ensure your protein intakes are consistently met to preserve muscular fibers during fat loss cycles.
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2 flex flex-col items-center">
              <Calculator size={48} className="text-slate-700 animate-bounce" />
              <p className="text-slate-400 font-bold">Target Calculator Ready</p>
              <p className="text-slate-500 text-xs max-w-sm">Enter your current weight, height, age, activity level, and targets on the left to review dynamic macro allocations.</p>
            </div>
          )}
        </div>

      </div>

      {/* FOOD DATABASE CATALOG EXPLORER */}
      <div className="space-y-6">
        <h3 className="text-xl font-extrabold text-slate-100 border-b border-slate-950 pb-2">Food Library Explorer</h3>

        {/* Filter controls */}
        <div className="glass-card p-4 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 border-slate-800">
          <div>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search foods by name..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>
          <div>
            <select
              value={selectedMeal}
              onChange={(e) => { setSelectedMeal(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Meal Types</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
          <div>
            <select
              value={selectedPref}
              onChange={(e) => { setSelectedPref(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Preferences</option>
              <option value="Veg">Vegetarian</option>
              <option value="Non-Veg">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>
        </div>

        {/* Foods Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : foods.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {foods.map((food) => (
                <FoodCard key={food._id} food={food} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-4">
                <button
                  onClick={() => setPage(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xs hover:text-slate-200 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xs hover:text-slate-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 font-bold">No food items found matching your filters.</div>
        )}
      </div>

    </div>
  );
};

export default DietPlans;
