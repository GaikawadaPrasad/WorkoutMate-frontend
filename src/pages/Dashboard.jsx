import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import { Sparkles, GlassWater, Dumbbell, Flame, TrendingUp, Trophy, ChevronRight, Apple, Heart } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waterChangeLoading, setWaterChangeLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/progress/dashboard');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddWater = async (amount) => {
    if (waterChangeLoading) return;
    setWaterChangeLoading(true);
    try {
      const res = await API.post('/progress', { waterIntake: amount });
      if (res.data && res.data.success) {
        // Optimistically update today's log water intake in UI
        setData((prev) => ({
          ...prev,
          todayLog: {
            ...prev.todayLog,
            waterIntake: prev.todayLog.waterIntake + amount,
          },
        }));
      }
    } catch (err) {
      console.error('Error logging water intake:', err);
    } finally {
      setWaterChangeLoading(false);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><DashboardSkeleton /></div>;
  if (!data) return <div className="text-center py-12 text-red-500">Failed to load dashboard. Try refreshing.</div>;

  const { todayLog, targets, todayWorkouts, activePlan, recentHistory } = data;
  const { bmi, targetCalories, targetWater } = targets;

  // Determine BMI category
  let bmiCategory = 'Normal';
  let bmiColor = 'text-emerald-400';
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-blue-400';
  } else if (bmi >= 25 && bmi < 29.9) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-400';
  } else if (bmi >= 29.9) {
    bmiCategory = 'Obese';
    bmiColor = 'text-red-400';
  }

  // Dynamic Workout Scheduler for Today
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  
  let todayWorkout = null;
  if (activePlan?.workoutPlan?.weeklySchedule) {
    todayWorkout = activePlan.workoutPlan.weeklySchedule.find(
      (s) => s.day.toLowerCase() === todayName.toLowerCase()
    );
  }

  // Calculate percentages
  const caloriesPercent = Math.min(Math.round((todayLog.caloriesConsumed / targetCalories) * 100), 100);
  const waterPercent = Math.min(Math.round((todayLog.waterIntake / targetWater) * 100), 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-950/20 min-h-screen">
      
      {/* GREETING BANNER */}
      <div className="relative glass-card overflow-hidden p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-100">
            Welcome back, <span className="text-emerald-400">{user?.name}</span>!
          </h2>
          <p className="text-slate-400 text-sm">
            Let's stay consistent. You're tracking toward your goal: <span className="text-slate-200 font-bold">{user?.goal || 'General Fitness'}</span>.
          </p>
        </div>
        {!activePlan ? (
          <Link
            to="/generate-plan"
            className="flex items-center space-x-2 px-5 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-600/20 text-sm transition-all duration-200"
          >
            <Sparkles size={16} />
            <span>Generate My Plan</span>
          </Link>
        ) : (
          <div className="flex items-center space-x-1.5 bg-emerald-950/30 border border-emerald-800 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
            <Trophy size={14} />
            <span>Active AI Plan Set</span>
          </div>
        )}
      </div>

      {/* CORE STATS BAR (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* BMI Card */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">BMI Index</span>
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-black ${bmiColor}`}>{bmi || 'N/A'}</span>
              <span className="text-xs text-slate-400">({bmiCategory})</span>
            </div>
            <p className="text-[10px] text-slate-500">Based on height & weight</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Calories Tracker Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Calories</span>
            <span className="text-xs text-slate-400 font-bold">{todayLog.caloriesConsumed} / {targetCalories} kcal</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${caloriesPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>{caloriesPercent}% Consumed</span>
            <Link to="/diet" className="text-emerald-400 font-bold hover:underline">Log Foods</Link>
          </div>
        </div>

        {/* Interactive Water Logger Card */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Water Intake</span>
            <span className="text-xs text-slate-400 font-bold">{todayLog.waterIntake} / {targetWater} ml</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
          </div>
          <div className="flex justify-between items-center pt-1">
            <button
              onClick={() => handleAddWater(250)}
              className="text-[10px] px-2 py-1 bg-blue-950/40 text-blue-400 border border-blue-800 rounded font-bold hover:bg-blue-900/40 transition-colors"
              disabled={waterChangeLoading}
            >
              +250ml
            </button>
            <button
              onClick={() => handleAddWater(500)}
              className="text-[10px] px-2 py-1 bg-blue-950/40 text-blue-400 border border-blue-800 rounded font-bold hover:bg-blue-900/40 transition-colors"
              disabled={waterChangeLoading}
            >
              +500ml
            </button>
          </div>
        </div>

        {/* Burned Calories / Workout Card */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Burned Today</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-orange-500">{todayLog.caloriesBurned}</span>
              <span className="text-xs text-slate-400">kcal</span>
            </div>
            <p className="text-[10px] text-slate-500">Through completed workouts</p>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
            <Flame size={22} />
          </div>
        </div>

      </div>

      {/* TODAY'S PLAN DETAILS (WORKOUT & DIET FROM AI PLAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Workout Component */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Dumbbell className="text-emerald-500" />
                <h3 className="font-extrabold text-xl text-slate-100">Today's Workout Plan</h3>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full font-bold uppercase">
                {todayName}
              </span>
            </div>

            {todayWorkout ? (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-lg text-emerald-400">{todayWorkout.workoutType}</h4>
                  <p className="text-slate-400 text-xs font-semibold">Focus on slow contractions and deep breathing.</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {todayWorkout.exercises.map((ex, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-slate-200 font-bold block">{ex.name}</span>
                        <span className="text-slate-400 text-xs">Targeted sets to reps progression</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400 block">{ex.sets} Sets x {ex.reps}</span>
                        <span className="text-[10px] text-slate-500">Rest: {ex.rest}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                  <span>Warm-up: {activePlan.workoutPlan.warmUp ? 'Included' : 'Not specified'}</span>
                  <Link to="/workouts" className="text-emerald-400 font-bold flex items-center space-x-0.5 hover:underline">
                    <span>Explore Workouts Directory</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-slate-400">
                  {activePlan
                    ? "It's a designated Recovery/Rest day! Let your muscle fibers heal."
                    : 'No generated AI workout plan was found. Generate one now to get started!'}
                </p>
                {!activePlan && (
                  <Link
                    to="/generate-plan"
                    className="inline-flex px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs shadow-md transition-colors"
                  >
                    Generate AI Workout Cycle
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Diet Component */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
              <Apple className="text-emerald-500" />
              <h3 className="font-extrabold text-xl text-slate-100">Today's Meal Suggestions</h3>
            </div>

            {activePlan?.dietPlan?.dailyMeals ? (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {Object.entries(activePlan.dietPlan.dailyMeals).map(([mealName, mealDetail]) => (
                  <div key={mealName} className="p-3 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                      <span className="font-bold text-xs uppercase text-emerald-400 tracking-wider">{mealName}</span>
                      <span className="text-[10px] text-slate-500 font-bold">{mealDetail.calories} Kcal</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {mealDetail.meals.map((item, i) => (
                        <li key={i} className="line-clamp-1">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <p className="text-slate-400">No active AI diet plan found.</p>
                <Link
                  to="/generate-plan"
                  className="inline-flex px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Create AI Diet Blueprint
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RECENT WORKOUT HISTORY & AI TIPS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Completion History */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <Trophy className="text-emerald-500" />
            <h3 className="font-extrabold text-xl text-slate-100">Recent Completed Workouts</h3>
          </div>

          {recentHistory.length > 0 ? (
            <div className="space-y-3">
              {recentHistory.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <Dumbbell size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">{item.workout?.title || 'Custom exercise'}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-200 block">+{item.caloriesBurned} Kcal</span>
                    <span className="text-[10px] text-slate-500">{item.durationCompleted} Mins duration</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No workouts completed yet. Click on the Workouts tab to begin your first session!
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <Heart className="text-emerald-500" />
            <h3 className="font-extrabold text-xl text-slate-100">AI Personal Recommendations</h3>
          </div>

          <div className="space-y-3.5 text-slate-300 text-xs leading-relaxed">
            {activePlan?.tips && activePlan.tips.length > 0 ? (
              activePlan.tips.map((tip, i) => (
                <div key={i} className="flex items-start space-x-2 p-2.5 bg-emerald-950/10 border border-emerald-900/30 rounded-xl">
                  <Sparkles size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start space-x-2 p-2.5 bg-blue-950/10 border border-blue-900/30 rounded-xl">
                  <Sparkles size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Please go to the "AI Planner" and fill out the biometrics to generate personalized insights.</span>
                </div>
                <div className="flex items-start space-x-2 p-2.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <Sparkles size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>Ensure your weight, height, and activity level are kept up-to-date in your Profile.</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
