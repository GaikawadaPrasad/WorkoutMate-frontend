import React, { useState, useEffect } from 'react';
import WorkoutCard from '../components/WorkoutCard';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { Heart, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../utils/api';

const Favorites = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await API.get('/workouts/favorites');
      if (res.data && res.data.success) {
        setWorkouts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (id, isFav) => {
    if (!isFav) {
      // If it is unfavorited, remove from list in real time
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen bg-slate-950/20">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-2">
          <Heart className="text-red-500 fill-red-500" />
          <span>My Favorite Workouts</span>
        </h2>
        <p className="text-slate-400 text-sm">Quickly launch your bookmarked training cycles.</p>
      </div>

      {/* RESULTS GRID */}
      {loading ? (
        <GridSkeleton count={3} />
      ) : workouts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((w) => (
            <WorkoutCard key={w._id} workout={w} onFavoriteToggle={handleFavoriteToggle} />
          ))}
        </div>
      ) : (
        <div className="glass-card text-center py-16 border-slate-800 space-y-4">
          <Heart size={48} className="mx-auto text-slate-700 animate-pulse" />
          <div>
            <p className="text-slate-400 font-bold">No bookmarked workouts yet.</p>
            <p className="text-slate-500 text-xs mt-1">Explore our directory and click the heart icon on any routine to bookmark it.</p>
          </div>
          <Link
            to="/workouts"
            className="inline-flex px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Explore Workouts
          </Link>
        </div>
      )}

    </div>
  );
};

export default Favorites;
