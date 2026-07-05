import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import { Calendar, Clock, Flame, Dumbbell, Award, ArrowRight } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/workouts/history'); // Calls getWorkoutHistory in workoutController
        if (res.data && res.data.success) {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Compute aggregate stats
  const totalWorkouts = history.length;
  const totalMinutes = history.reduce((sum, item) => sum + item.durationCompleted, 0);
  const totalCalories = history.reduce((sum, item) => sum + item.caloriesBurned, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen bg-slate-950/20">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-2">
          <Calendar className="text-emerald-500" />
          <span>Workout History Log</span>
        </h2>
        <p className="text-slate-400 text-sm">Review your training consistency, elapsed duration, and metabolic expenditure.</p>
      </div>

      {/* METRIC SUMMARIES (3 COLUMNS) */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
          <span className="text-2xl font-black text-emerald-400">{totalWorkouts}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Minutes</span>
          <span className="text-2xl font-black text-blue-400">{totalMinutes}m</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border-slate-800 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Kcal</span>
          <span className="text-2xl font-black text-orange-500">{totalCalories}</span>
        </div>
      </div>

      {/* TIMELINE LIST */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Loading activity logs...</div>
      ) : history.length > 0 ? (
        <div className="relative border-l border-slate-800 ml-4 space-y-6">
          {history.map((log) => (
            <div key={log._id} className="relative pl-6">
              
              {/* Dot indicator */}
              <span className="absolute -left-[9px] top-1.5 h-4.5 w-4.5 rounded-full bg-slate-950 border-2 border-emerald-500 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>

              {/* Log Card */}
              <div className="glass-card p-5 rounded-2xl border-slate-850 hover:border-slate-800 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl mt-1">
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-base">{log.workout?.title || 'Custom Exercise Session'}</h4>
                    <span className="text-xs text-slate-400">
                      {new Date(log.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(log.date).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 self-end sm:self-auto">
                  <div className="flex items-center space-x-1 text-slate-400 text-xs font-semibold">
                    <Clock size={14} className="text-blue-400" />
                    <span>{log.durationCompleted} Mins</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400 text-xs font-semibold">
                    <Flame size={14} className="text-orange-500" />
                    <span>{log.caloriesBurned} Kcal</span>
                  </div>
                  {log.workout && (
                    <Link
                      to={`/workouts/${log.workout._id}`}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-all duration-200"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card text-center py-16 border-slate-800 space-y-4">
          <Award size={48} className="mx-auto text-slate-700 animate-pulse" />
          <div>
            <p className="text-slate-400 font-bold">No completed sessions logged yet.</p>
            <p className="text-slate-500 text-xs mt-1">Navigate to our workouts explorer directory to begin a session.</p>
          </div>
          <Link
            to="/workouts"
            className="inline-flex px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Browse Workouts
          </Link>
        </div>
      )}

    </div>
  );
};

export default History;
