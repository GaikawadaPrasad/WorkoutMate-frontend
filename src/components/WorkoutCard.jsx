import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Flame, Dumbbell } from 'lucide-react';
import API from '../utils/api';

const WorkoutCard = ({ workout, onFavoriteToggle }) => {
  const [isFavorite, setIsFavorite] = useState(workout.isFavorite);
  const [loading, setLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      if (isFavorite) {
        await API.delete(`/workouts/${workout._id}/favorite`);
        setIsFavorite(false);
      } else {
        await API.post(`/workouts/${workout._id}/favorite`);
        setIsFavorite(true);
      }
      if (onFavoriteToggle) onFavoriteToggle(workout._id, !isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  // Safe fallback images for workouts
  const placeholderImage = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60';
  const displayImage = workout.image ? (workout.image.startsWith('http') ? workout.image : `http://localhost:5000${workout.image}`) : placeholderImage;

  return (
    <div className="glass-card group rounded-2xl overflow-hidden hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-950/20 transition-all duration-300 flex flex-col h-full relative">
      {/* Heart Bookmark */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-slate-300 hover:text-red-500 hover:bg-slate-800 transition-all duration-200"
        disabled={loading}
      >
        <Heart size={18} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-300'} />
      </button>

      <Link to={`/workouts/${workout._id}`} className="flex flex-col h-full">
        {/* Cover Image */}
        <div className="h-48 overflow-hidden relative">
          <img
            src={displayImage}
            alt={workout.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.src = placeholderImage; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          
          {/* Difficulty Badge */}
          <span className={`absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow
            ${workout.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              workout.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}
          >
            {workout.difficulty}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow space-y-3">
          <h3 className="font-bold text-lg text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
            {workout.title}
          </h3>

          <p className="text-slate-400 text-sm line-clamp-2">
            {workout.description}
          </p>

          {/* Muscle and Equipment badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {workout.muscleGroup.slice(0, 2).map((m) => (
              <span key={m} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                {m}
              </span>
            ))}
            {workout.equipment.slice(0, 1).map((eq) => (
              <span key={eq} className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-400 text-xs font-medium border border-slate-800">
                {eq}
              </span>
            ))}
          </div>

          {/* Footer Metrics */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-slate-400 text-xs font-semibold mt-auto">
            <div className="flex items-center space-x-1">
              <Clock size={14} className="text-emerald-500" />
              <span>{workout.duration} Mins</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flame size={14} className="text-orange-500" />
              <span>{workout.caloriesBurned} Kcal</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default WorkoutCard;
