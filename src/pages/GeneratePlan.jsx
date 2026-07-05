import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { Sparkles, Calendar, Trash2, Printer, ChevronDown, ChevronUp, AlertCircle, ShieldAlert, FileText, Activity } from 'lucide-react';

const GeneratePlan = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activePlanId, setActivePlanId] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  // Form State pre-populated with user details
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    bodyFat: '',
    goal: '',
    activityLevel: 'Moderately Active (exercise 3-5 days/week)',
    workoutDays: 4,
    workoutDuration: 45,
    gymHome: 'Gym',
    equipment: [],
    dietPreference: 'Veg',
    allergies: '',
    foodsToAvoid: '',
    medicalConditions: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        age: user.age || '',
        gender: user.gender || 'Male',
        height: user.height || '',
        weight: user.weight || '',
        goal: user.goal || '',
        activityLevel: user.activityLevel || 'Moderately Active (exercise 3-5 days/week)',
        dietPreference: user.foodPreference || 'Veg',
        equipment: user.equipmentAvailable || [],
      }));
    }
  }, [user]);

  // Load categories & previous plans
  const loadInitialData = async () => {
    try {
      const [catRes, planRes] = await Promise.all([
        API.get('/categories'),
        API.get('/ai/plans'),
      ]);

      if (catRes.data && catRes.data.success) {
        setCategories(catRes.data.data);
        if (!formData.goal) {
          const goals = catRes.data.data.filter((c) => c.type === 'goal');
          if (goals.length > 0) {
            setFormData((prev) => ({ ...prev, goal: goals[0].name }));
          }
        }
      }

      if (planRes.data && planRes.data.success) {
        setPlans(planRes.data.data);
        if (planRes.data.data.length > 0) {
          setActivePlanId(planRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleEquipmentChange = (eqName) => {
    setFormData((prev) => {
      const exists = prev.equipment.includes(eqName);
      if (exists) {
        return { ...prev, equipment: prev.equipment.filter((e) => e !== eqName) };
      } else {
        return { ...prev, equipment: [...prev.equipment, eqName] };
      }
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        workoutDays: parseInt(formData.workoutDays),
        workoutDuration: parseInt(formData.workoutDuration),
        allergies: formData.allergies ? formData.allergies.split(',').map((x) => x.trim()) : [],
        foodsToAvoid: formData.foodsToAvoid ? formData.foodsToAvoid.split(',').map((x) => x.trim()) : [],
        medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map((x) => x.trim()) : [],
      };

      const res = await API.post('/ai/generate', payload);
      if (res.data && res.data.success) {
        setIsGenerated(true);
        // Refresh plans
        const updatedPlans = await API.get('/ai/plans');
        setPlans(updatedPlans.data.data);
        setActivePlanId(res.data.data._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('AI plan generation error:', err);
      setError(err.response?.data?.message || 'Plan generation failed. Please double-check biometrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await API.delete(`/ai/plans/${id}`);
      setPlans(plans.filter((p) => p._id !== id));
      if (activePlanId === id) {
        setActivePlanId(null);
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  const handlePrint = (e) => {
    e.stopPropagation();
    window.print();
  };

  const goals = categories.filter((c) => c.type === 'goal');
  const equipmentOptions = categories.filter((c) => c.type === 'equipment');
  const activePlan = plans.find((p) => p._id === activePlanId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen bg-slate-950/20">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-2">
          <Sparkles className="text-emerald-400" />
          <span>AI Fitness Planner</span>
        </h2>
        <p className="text-slate-400 text-sm">Generate structured, macro-calculated regimes based on your metabolic parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: WIZARD FORM */}
        <div className="lg:col-span-1 glass-card p-6 rounded-3xl h-fit border-slate-800">
          <h3 className="font-extrabold text-lg text-slate-100 border-b border-slate-800 pb-3 mb-4">Plan Parameters</h3>
          
          {error && (
            <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-xs mb-4">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Age"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="Height"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Weight"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fat % (Opt)</label>
                <input
                  type="number"
                  value={formData.bodyFat}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                  placeholder="Fat"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Target Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                required
              >
                {goals.map((g) => (
                  <option key={g._id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 text-sm"
              >
                <option value="Sedentary (little or no exercise)">Sedentary (no exercise)</option>
                <option value="Lightly Active (exercise 1-3 days/week)">Lightly Active (1-3 days/wk)</option>
                <option value="Moderately Active (exercise 3-5 days/week)">Moderately Active (3-5 days/wk)</option>
                <option value="Very Active (exercise 6-7 days/week)">Very Active (6-7 days/wk)</option>
                <option value="Extra Active (hard exercise daily or physical job)">Extra Active (hard daily)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Days/Week</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.workoutDays}
                  onChange={(e) => setFormData({ ...formData, workoutDays: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mins/Workout</label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  value={formData.workoutDuration}
                  onChange={(e) => setFormData({ ...formData, workoutDuration: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Location</label>
                <select
                  value={formData.gymHome}
                  onChange={(e) => setFormData({ ...formData, gymHome: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="Gym">Gym</option>
                  <option value="Home">Home</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Diet style</label>
                <select
                  value={formData.dietPreference}
                  onChange={(e) => setFormData({ ...formData, dietPreference: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Pescatarian">Pescatarian</option>
                </select>
              </div>
            </div>

            {/* Dynamic Equipment Checkboxes */}
            <div className="space-y-2 border-t border-slate-850 pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Equipment Available</span>
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {equipmentOptions.map((eq) => (
                  <label key={eq._id} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.equipment.includes(eq.name)}
                      onChange={() => handleEquipmentChange(eq.name)}
                      className="rounded border-slate-800 text-emerald-500 bg-slate-950 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="truncate">{eq.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sensitivities */}
            <div className="space-y-3 border-t border-slate-850 pt-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Allergies (comma separated)</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Peanuts, Gluten"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Foods to Avoid</label>
                <input
                  type="text"
                  value={formData.foodsToAvoid}
                  onChange={(e) => setFormData({ ...formData, foodsToAvoid: e.target.value })}
                  placeholder="e.g. Soy, Milk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Medical Conditions</label>
                <input
                  type="text"
                  value={formData.medicalConditions}
                  onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                  placeholder="e.g. Knee pain, Asthma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-600/10 flex items-center justify-center space-x-2 transition-colors mt-6"
              disabled={loading}
            >
              {loading ? (
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Custom Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: GENERATED PLANS SUMMARY */}
        <div className="lg:col-span-2 space-y-6 print:w-full print:block">
          
          {/* List previous plans header */}
          <div className="glass-card p-4 rounded-3xl flex items-center justify-between border-slate-800 print:hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Saved AI Plan</span>
            <select
              value={activePlanId || ''}
              onChange={(e) => setActivePlanId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="" disabled>No plans saved</option>
              {plans.map((p, idx) => (
                <option key={p._id} value={p._id}>
                  Plan {plans.length - idx} ({new Date(p.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {listLoading ? (
            <div className="text-center py-20 text-slate-500 text-sm">Loading plans directory...</div>
          ) : activePlan ? (
            
            /* PRINT CONTAINER */
            <div id="print-area" className="glass-card p-6 sm:p-8 rounded-3xl space-y-8 border-slate-850 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
              
              {/* Plan Metadata & Print Tools */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-5 space-y-4 sm:space-y-0 print:hidden">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>Created: {new Date(activePlan.createdAt).toLocaleDateString()}</span>
                  </span>
                  <h3 className="font-extrabold text-2xl text-slate-100">
                    Your {activePlan.inputCriteria.goal} Regime
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
                  >
                    <Printer size={14} />
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    onClick={(e) => handleDeletePlan(activePlan._id, e)}
                    className="flex items-center justify-center p-2 bg-red-950/20 border border-red-900/40 rounded-xl hover:bg-red-900 hover:text-white text-red-400 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Printable Header */}
              <div className="hidden print:block border-b-2 border-slate-300 pb-4 mb-6">
                <h1 className="text-3xl font-extrabold">WorkoutMate AI Fitness & Nutrition Plan</h1>
                <p className="text-sm text-slate-600">Generated on {new Date(activePlan.createdAt).toLocaleDateString()} for {user?.name}</p>
                <div className="grid grid-cols-4 gap-4 mt-4 text-xs font-bold bg-slate-100 p-2 rounded">
                  <div>Age: {activePlan.inputCriteria.age}</div>
                  <div>Weight: {activePlan.inputCriteria.weight} kg</div>
                  <div>Goal: {activePlan.inputCriteria.goal}</div>
                  <div>Diet: {activePlan.inputCriteria.dietPreference}</div>
                </div>
              </div>

              {/* SECTION: DIETARY TARGETS */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-lg text-slate-100 border-b border-slate-900 pb-2 print:text-black print:border-slate-300">
                  Nutrition Target Macros
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-center print:border-slate-300 print:bg-slate-50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Calories target</span>
                    <span className="text-xl font-black text-slate-100 print:text-black">{activePlan.dailyCalories} Kcal</span>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-center print:border-slate-300 print:bg-slate-50">
                    <span className="text-[10px] text-emerald-400 uppercase font-semibold">Daily Protein</span>
                    <span className="text-xl font-black text-emerald-400">{activePlan.protein}g</span>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-center print:border-slate-300 print:bg-slate-50">
                    <span className="text-[10px] text-blue-400 uppercase font-semibold">Daily Carbs</span>
                    <span className="text-xl font-black text-blue-400">{activePlan.carbs}g</span>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col justify-center print:border-slate-300 print:bg-slate-50">
                    <span className="text-[10px] text-amber-400 uppercase font-semibold">Daily Fats</span>
                    <span className="text-xl font-black text-amber-400">{activePlan.fat}g</span>
                  </div>
                </div>
              </div>

              {/* SECTION: WORKOUT SCHEDULE */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-extrabold text-lg text-slate-100 border-b border-slate-900 pb-2 print:text-black print:border-slate-300">
                    Weekly Training Schedule
                  </h4>
                  <div className="text-xs text-slate-500 pt-1 flex justify-between print:text-slate-700">
                    <span>Warm-up: {activePlan.workoutPlan.warmUp}</span>
                    <span>Cool-down: {activePlan.workoutPlan.coolDown}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {activePlan.workoutPlan.weeklySchedule.map((sched) => (
                    <div key={sched.day} className="p-4 bg-slate-950/20 border border-slate-850 rounded-2xl space-y-3 print:border-slate-300 print:break-inside-avoid">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2 print:border-slate-300">
                        <span className="font-bold text-slate-200 print:text-black text-sm uppercase">{sched.day}</span>
                        <span className="text-xs font-bold text-emerald-400">{sched.workoutType}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sched.exercises.map((ex, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 print:border-slate-350 print:bg-slate-50">
                            <span className="text-xs font-bold text-slate-300 print:text-black">{ex.name}</span>
                            <span className="text-xs text-slate-400 font-bold print:text-slate-800">
                              {ex.sets}x{ex.reps} ({ex.rest})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: MEALS & NUTRITION */}
              <div className="space-y-4 print:break-before-page">
                <h4 className="font-extrabold text-lg text-slate-100 border-b border-slate-900 pb-2 print:text-black print:border-slate-300">
                  AI Diet Plan & Meal Blueprint
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activePlan.dietPlan.dailyMeals &&
                    Object.entries(activePlan.dietPlan.dailyMeals).map(([meal, detail]) => (
                      <div key={meal} className="p-4 bg-slate-950/20 border border-slate-850 rounded-2xl space-y-2 print:border-slate-300 print:break-inside-avoid">
                        <div className="flex justify-between items-center border-b border-slate-850 pb-1.5 print:border-slate-300">
                          <span className="font-bold text-xs uppercase text-emerald-400">{meal}</span>
                          <span className="text-xs font-bold text-slate-400 print:text-slate-800">{detail.calories} Kcal</span>
                        </div>
                        <ul className="text-xs text-slate-300 list-disc list-inside space-y-1 print:text-black">
                          {detail.meals.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 font-semibold pt-2 print:text-slate-800">
                  <span>Water intake goal: {activePlan.dietPlan.waterIntake} ml</span>
                  {activePlan.dietPlan.supplementSuggestions && (
                    <span>Supplements: {activePlan.dietPlan.supplementSuggestions.join(', ')}</span>
                  )}
                </div>
              </div>

              {/* TIPS & PROGRESS ADVICE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 print:break-inside-avoid">
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Training Advice</h5>
                  <div className="text-xs text-slate-300 leading-relaxed print:text-black">
                    {activePlan.progressAdvice}
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trainer Tips</h5>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside print:text-black">
                    {activePlan.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card text-center py-20 border-slate-800 flex flex-col items-center justify-center space-y-4">
              <FileText size={48} className="text-slate-600" />
              <div>
                <p className="text-slate-400 font-bold">No AI plans created yet.</p>
                <p className="text-slate-500 text-xs mt-1">Use the panel on the left to request your first generated cycle.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default GeneratePlan;
