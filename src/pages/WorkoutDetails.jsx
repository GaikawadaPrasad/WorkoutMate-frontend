import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import WorkoutCard from '../components/WorkoutCard';
import { Play, Pause, RotateCcw, Flame, Clock, Heart, Award, ArrowLeft, CheckCircle } from 'lucide-react';

const WorkoutDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [workout, setWorkout] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [logLoading, setLogLoading] = useState(false);

  // Exercise Duration Timer (Stopwatch)
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const stopwatchRef = useRef(null);

  // Rest Timer (Countdown)
  const [restSeconds, setRestSeconds] = useState(60);
  const [isRestRunning, setIsRestRunning] = useState(false);
  const [initialRest, setInitialRest] = useState(60);
  const countdownRef = useRef(null);

  const fetchWorkoutDetails = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/workouts/${id}`);
      if (res.data && res.data.success) {
        setWorkout(res.data.data);
        setRelated(res.data.related);
        
        // Parse rest time string to integer seconds (e.g., '60s' -> 60, '90s' -> 90)
        const restStr = res.data.data.rest || '60s';
        const parsedRest = parseInt(restStr.replace(/\D/g, '')) || 60;
        setRestSeconds(parsedRest);
        setInitialRest(parsedRest);
      }
    } catch (err) {
      console.error('Error fetching workout details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutDetails();
    // Reset stopwatch/timer on id change
    setTimeElapsed(0);
    setIsTimerRunning(false);
    setIsRestRunning(false);
    setCompleted(false);

    return () => {
      clearInterval(stopwatchRef.current);
      clearInterval(countdownRef.current);
    };
  }, [id]);

  // Duration Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      stopwatchRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(stopwatchRef.current);
    }
    return () => clearInterval(stopwatchRef.current);
  }, [isTimerRunning]);

  // Rest Timer logic
  useEffect(() => {
    if (isRestRunning) {
      countdownRef.current = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            setIsRestRunning(false);
            clearInterval(countdownRef.current);
            // Quick notification alert
            alert('Rest interval finished! Time for the next set.');
            return initialRest;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownRef.current);
    }
    return () => clearInterval(countdownRef.current);
  }, [isRestRunning, initialRest]);

  const handleStopwatchToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleStopwatchReset = () => {
    setIsTimerRunning(false);
    setTimeElapsed(0);
  };

  const handleRestToggle = () => {
    setIsRestRunning(!isRestRunning);
  };

  const handleRestReset = () => {
    setIsRestRunning(false);
    setRestSeconds(initialRest);
  };

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMarkCompleted = async () => {
    if (logLoading) return;
    setLogLoading(true);
    try {
      const minutesCompleted = Math.max(Math.round(timeElapsed / 60), 1) || workout.duration;
      // Pro-rata estimation of calories burned based on elapsed time vs total duration
      const caloriesCompleted = Math.round((minutesCompleted / workout.duration) * workout.caloriesBurned) || workout.caloriesBurned;

      const res = await API.post('/workouts/history', {
        workoutId: workout._id,
        durationCompleted: minutesCompleted,
        caloriesBurned: caloriesCompleted,
      });

      if (res.data && res.data.success) {
        setCompleted(true);
        setIsTimerRunning(false);
      }
    } catch (err) {
      console.error('Error logging workout:', err);
    } finally {
      setLogLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading workout details...</div>;
  if (!workout) return <div className="text-center py-20 text-red-500">Workout not found.</div>;

  const placeholderImage = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60';
  const displayImage = workout.image ? (workout.image.startsWith('http') ? workout.image : `http://localhost:5000${workout.image}`) : placeholderImage;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-950/20 min-h-screen">
      
      {/* Back button */}
      <Link to="/workouts" className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 text-sm font-semibold transition-colors">
        <ArrowLeft size={16} />
        <span>Back to Directory</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MEDIA PLAYER & TIMER WIDGETS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Media Player Card */}
          <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
            {workout.videoUrl ? (
              <div className="aspect-video w-full bg-black relative">
                <video
                  src={workout.videoUrl}
                  controls
                  poster={displayImage}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-96 w-full relative">
                <img src={displayImage} alt={workout.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent flex items-end p-6">
                  <div className="space-y-1">
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-500/30">
                      {workout.difficulty}
                    </span>
                    <h2 className="text-2xl font-black text-slate-100">{workout.title}</h2>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE WORKOUT TIMERS CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stopwatch Widget */}
            <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center space-y-3 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exercise Duration Tracker</span>
              <div className="text-4xl font-mono font-black text-emerald-400">{formatTime(timeElapsed)}</div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleStopwatchToggle}
                  className={`p-2.5 rounded-full text-slate-900 transition-colors
                    ${isTimerRunning ? 'bg-amber-400 hover:bg-amber-300' : 'bg-emerald-500 hover:bg-emerald-400'}`}
                >
                  {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  onClick={handleStopwatchReset}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            {/* Rest Timer Widget */}
            <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center space-y-3 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rest CountDown Timer</span>
              <div className="text-4xl font-mono font-black text-blue-400">{formatTime(restSeconds)}</div>
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleRestToggle}
                  className={`p-2.5 rounded-full text-slate-900 transition-colors
                    ${isRestRunning ? 'bg-amber-400 hover:bg-amber-300' : 'bg-blue-500 hover:bg-blue-400'}`}
                >
                  {isRestRunning ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  onClick={handleRestReset}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

          </div>

          {/* INSTRUCTIONS */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold border-b border-slate-800 pb-3 text-slate-100">Step-by-Step Instructions</h3>
            <div className="space-y-4">
              {workout.steps && workout.steps.length > 0 ? (
                workout.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No instructions provided.</p>
              )}
            </div>

            {/* Pro Trainer Tips */}
            {workout.tips && workout.tips.length > 0 && (
              <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-2xl space-y-2 mt-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pro Training Tips</h4>
                <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                  {workout.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WORKOUT PARAMETERS */}
        <div className="space-y-6">
          
          {/* Metrics summary card */}
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-extrabold text-slate-100 border-b border-slate-800 pb-3">Training Parameters</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-850 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Sets</span>
                <span className="text-lg font-black text-emerald-400">{workout.sets} Sets</span>
              </div>
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-850 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Reps target</span>
                <span className="text-lg font-black text-blue-400">{workout.reps} Reps</span>
              </div>
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-850 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Rest interval</span>
                <span className="text-lg font-black text-amber-400">{workout.rest}</span>
              </div>
              <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-850 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Target Style</span>
                <span className="text-sm font-black text-slate-200 truncate">{workout.goal[0]}</span>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Clock size={16} className="text-slate-500" />
                  <span>Duration</span>
                </span>
                <span className="font-bold text-slate-200">{workout.duration} Minutes</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Flame size={16} className="text-orange-500" />
                  <span>Calories Burned</span>
                </span>
                <span className="font-bold text-orange-500">{workout.caloriesBurned} Kcal</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Award size={16} className="text-slate-500" />
                  <span>Difficulty</span>
                </span>
                <span className="font-bold text-slate-200">{workout.difficulty}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Muscle Groups</span>
              <div className="flex flex-wrap gap-1.5">
                {workout.muscleGroup.map((m) => (
                  <span key={m} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-full text-xs font-semibold">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Equipment Required</span>
              <div className="flex flex-wrap gap-1.5">
                {workout.equipment.map((eq) => (
                  <span key={eq} className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-full text-xs font-semibold">
                    {eq}
                  </span>
                ))}
              </div>
            </div>

            {/* Completion Buttons */}
            {completed ? (
              <div className="flex items-center justify-center space-x-2 p-4 bg-emerald-950/20 border border-emerald-800 rounded-2xl text-emerald-400 font-bold">
                <CheckCircle size={20} />
                <span>Workout Logged Successfully!</span>
              </div>
            ) : (
              <button
                onClick={handleMarkCompleted}
                className="w-full py-4 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-600/10 flex items-center justify-center space-x-2 transition-colors mt-2"
                disabled={logLoading}
              >
                {logLoading ? (
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Complete & Log Workout</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* RELATED WORKOUTS */}
      {related.length > 0 && (
        <div className="space-y-4 pt-8">
          <h3 className="text-xl font-extrabold text-slate-100 border-b border-slate-950 pb-2">Related Workouts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((w) => (
              <WorkoutCard key={w._id} workout={w} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default WorkoutDetails;
