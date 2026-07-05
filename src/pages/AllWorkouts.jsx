import React, { useState, useEffect } from 'react';
import WorkoutCard from '../components/WorkoutCard';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import API from '../utils/api';

const AllWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Filter States
  const [searchVal, setSearchVal] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch dynamic categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data && res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch workouts matching filters
  const fetchWorkouts = async () => {
    setSearching(true);
    try {
      const params = {
        page,
        limit: 6,
        search: searchVal || undefined,
        goal: selectedGoal || undefined,
        difficulty: selectedDifficulty || undefined,
        muscle: selectedMuscle || undefined,
        equipment: selectedEquipment || undefined,
        sortBy: sortBy || undefined,
        order: sortBy ? order : undefined,
      };

      const res = await API.get('/workouts', { params });
      if (res.data && res.data.success) {
        setWorkouts(res.data.data);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      console.error('Error fetching workouts:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [page, selectedGoal, selectedDifficulty, selectedMuscle, selectedEquipment, sortBy, order]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 1) {
        fetchWorkouts();
      } else {
        setPage(1); // will trigger fetch via page dependency
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal]);

  const handleResetFilters = () => {
    setSearchVal('');
    setSelectedGoal('');
    setSelectedDifficulty('');
    setSelectedMuscle('');
    setSelectedEquipment('');
    setSortBy('');
    setOrder('asc');
    setPage(1);
  };

  // Group categories dynamically
  const goals = categories.filter((c) => c.type === 'goal');
  const muscles = categories.filter((c) => c.type === 'muscle');
  const difficulties = categories.filter((c) => c.type === 'difficulty');
  const equipmentOptions = categories.filter((c) => c.type === 'equipment');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-950/20 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100">Workout Directory</h2>
          <p className="text-slate-400 text-sm">Explore and filter training routines matching your fitness levels.</p>
        </div>
        <button
          onClick={handleResetFilters}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors self-start md:self-auto"
        >
          <RefreshCw size={14} />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-500" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search workouts by name or description..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searching && (
            <span className="absolute right-4 top-3.5 h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Filters Select Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Goal Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Goal</label>
            <select
              value={selectedGoal}
              onChange={(e) => { setSelectedGoal(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Goals</option>
              {goals.map((g) => (
                <option key={g._id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Difficulties</option>
              {difficulties.map((d) => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Muscle Group Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Muscle Group</label>
            <select
              value={selectedMuscle}
              onChange={(e) => { setSelectedMuscle(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Muscles</option>
              {muscles.map((m) => (
                <option key={m._id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Equipment Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Equipment</label>
            <select
              value={selectedEquipment}
              onChange={(e) => { setSelectedEquipment(e.target.value); setPage(1); }}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Any Equipment</option>
              {equipmentOptions.map((eq) => (
                <option key={eq._id} value={eq.name}>{eq.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sorting controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-800/80 pt-4 mt-2 text-xs text-slate-400 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-1">
            <SlidersHorizontal size={14} className="text-emerald-500" />
            <span className="font-bold">Sorting & Reordering:</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
              >
                <option value="">Default (Date Added)</option>
                <option value="duration">Duration</option>
                <option value="caloriesBurned">Calories Burned</option>
              </select>
            </div>
            {sortBy && (
              <div className="flex items-center space-x-2">
                <span>Order:</span>
                <select
                  value={order}
                  onChange={(e) => { setOrder(e.target.value); setPage(1); }}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RESULTS GRID */}
      {loading ? (
        <GridSkeleton count={6} />
      ) : workouts.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((w) => (
              <WorkoutCard key={w._id} workout={w} />
            ))}
          </div>

          {/* PAGINATION PANEL */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-4">
              <button
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-bold text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(page + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card text-center py-16 space-y-2">
          <p className="text-slate-400 font-medium">No workouts matching your search filters.</p>
          <button
            onClick={handleResetFilters}
            className="text-emerald-400 text-xs font-bold hover:underline"
          >
            Clear Filters & View All
          </button>
        </div>
      )}
    </div>
  );
};

export default AllWorkouts;
