import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { Shield, Users, Dumbbell, Apple, Sparkles, RefreshCw, Plus, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [workoutsList, setWorkoutsList] = useState([]);
  const [foodsList, setFoodsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editing / Addition Modal states
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [workoutForm, setWorkoutForm] = useState({
    title: '', description: '', goal: '', difficulty: 'Beginner',
    muscleGroup: '', equipment: '', duration: 20, caloriesBurned: 150,
    videoUrl: '', image: '', steps: '', tips: ''
  });

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: '', protein: 0, carbs: 0, fat: 0, calories: 0, mealType: 'Breakfast', vegNonVeg: 'Veg', image: ''
  });

  const [categoryForm, setCategoryForm] = useState({ name: '', type: 'goal', description: '' });

  // Load admin stats and lists
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, userRes, workoutRes, foodRes, catRes, planRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/workouts?limit=100'),
        API.get('/foods?limit=100'),
        API.get('/categories'),
        API.get('/admin/plans')
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (userRes.data?.success) setUsersList(userRes.data.data);
      if (workoutRes.data?.success) setWorkoutsList(workoutRes.data.data);
      if (foodRes.data?.success) setFoodsList(foodRes.data.data);
      if (catRes.data?.success) setCategoriesList(catRes.data.data);
      if (planRes.data?.success) setPlansList(planRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Error loading administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const triggerToast = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3500);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 3500);
    }
  };

  // DELETE HANDLERS
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsersList(usersList.filter((u) => u._id !== id));
      triggerToast('User account deleted');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Delete failed', false);
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      await API.delete(`/admin/workouts/${id}`);
      setWorkoutsList(workoutsList.filter((w) => w._id !== id));
      triggerToast('Workout deleted');
    } catch (err) {
      triggerToast('Workout delete failed', false);
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await API.delete(`/admin/foods/${id}`);
      setFoodsList(foodsList.filter((f) => f._id !== id));
      triggerToast('Food item deleted');
    } catch (err) {
      triggerToast('Food delete failed', false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await API.delete(`/admin/categories/${id}`);
      setCategoriesList(categoriesList.filter((c) => c._id !== id));
      triggerToast('Category deleted');
    } catch (err) {
      triggerToast('Category delete failed', false);
    }
  };

  // WORKOUT MODAL HANDLERS
  const openAddWorkout = () => {
    setEditingWorkout(null);
    setWorkoutForm({
      title: '', description: '', goal: '', difficulty: 'Beginner',
      muscleGroup: '', equipment: '', duration: 20, caloriesBurned: 150,
      videoUrl: '', image: '', steps: '', tips: ''
    });
    setShowWorkoutModal(true);
  };

  const openEditWorkout = (w) => {
    setEditingWorkout(w);
    setWorkoutForm({
      title: w.title,
      description: w.description,
      goal: w.goal.join(', '),
      difficulty: w.difficulty,
      muscleGroup: w.muscleGroup.join(', '),
      equipment: w.equipment.join(', '),
      duration: w.duration,
      caloriesBurned: w.caloriesBurned,
      videoUrl: w.videoUrl,
      image: w.image,
      steps: w.steps.join('\n'),
      tips: w.tips.join('\n')
    });
    setShowWorkoutModal(true);
  };

  const submitWorkout = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...workoutForm,
        goal: workoutForm.goal.split(',').map((x) => x.trim()).filter((x) => x),
        muscleGroup: workoutForm.muscleGroup.split(',').map((x) => x.trim()).filter((x) => x),
        equipment: workoutForm.equipment.split(',').map((x) => x.trim()).filter((x) => x),
        duration: parseInt(workoutForm.duration),
        caloriesBurned: parseInt(workoutForm.caloriesBurned),
        steps: workoutForm.steps.split('\n').map((x) => x.trim()).filter((x) => x),
        tips: workoutForm.tips.split('\n').map((x) => x.trim()).filter((x) => x)
      };

      if (editingWorkout) {
        const res = await API.put(`/admin/workouts/${editingWorkout._id}`, payload);
        setWorkoutsList(workoutsList.map((w) => (w._id === editingWorkout._id ? res.data.data : w)));
        triggerToast('Workout modified successfully');
      } else {
        const res = await API.post('/admin/workouts', payload);
        setWorkoutsList([res.data.data, ...workoutsList]);
        triggerToast('New workout added successfully');
      }
      setShowWorkoutModal(false);
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Error submitting workout form', false);
    }
  };

  // FOOD MODAL HANDLERS
  const openAddFood = () => {
    setEditingFood(null);
    setFoodForm({ name: '', protein: 0, carbs: 0, fat: 0, calories: 0, mealType: 'Breakfast', vegNonVeg: 'Veg', image: '' });
    setShowFoodModal(true);
  };

  const openEditFood = (f) => {
    setEditingFood(f);
    setFoodForm({ ...f });
    setShowFoodModal(true);
  };

  const submitFood = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...foodForm,
        protein: parseFloat(foodForm.protein),
        carbs: parseFloat(foodForm.carbs),
        fat: parseFloat(foodForm.fat),
        calories: parseInt(foodForm.calories)
      };

      if (editingFood) {
        const res = await API.put(`/admin/foods/${editingFood._id}`, payload);
        setFoodsList(foodsList.map((f) => (f._id === editingFood._id ? res.data.data : f)));
        triggerToast('Food item updated');
      } else {
        const res = await API.post('/admin/foods', payload);
        setFoodsList([res.data.data, ...foodsList]);
        triggerToast('Food item created');
      }
      setShowFoodModal(false);
    } catch (err) {
      triggerToast('Error saving food product details', false);
    }
  };

  // CATEGORY SUBMIT
  const submitCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) return;
    try {
      const res = await API.post('/admin/categories', categoryForm);
      setCategoriesList([...categoriesList, res.data.data]);
      setCategoryForm({ name: '', type: 'goal', description: '' });
      triggerToast('Dynamic category registered');
    } catch (err) {
      triggerToast('Category registry failed', false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading admin console...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen bg-slate-950/20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-2">
            <Shield className="text-amber-500" />
            <span>Admin Control Panel</span>
          </h2>
          <p className="text-slate-400 text-sm">System configuration, workout directory curating, and dynamic databases.</p>
        </div>
        <button onClick={loadAdminData} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* TOAST ALERTS */}
      {error && (
        <div className="flex items-center space-x-2 p-4 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-xs">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-2 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800 text-emerald-400 text-xs">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* DASHBOARD TABS BAR */}
      <div className="flex flex-wrap border-b border-slate-800 gap-1">
        {['overview', 'workouts', 'foods', 'categories', 'users', 'aiPlans'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2
              ${activeTab === tab ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            {tab.replace(/([A-Z])/g, ' $1')}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERVIEW STATS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Users</span>
                <div className="text-2xl font-black">{stats.counts.users}</div>
              </div>
              <Users className="text-blue-400 h-8 w-8 opacity-40" />
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Workouts</span>
                <div className="text-2xl font-black">{stats.counts.workouts}</div>
              </div>
              <Dumbbell className="text-emerald-400 h-8 w-8 opacity-40" />
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Food Database</span>
                <div className="text-2xl font-black">{stats.counts.foods}</div>
              </div>
              <Apple className="text-orange-400 h-8 w-8 opacity-40" />
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">AI Plans Generated</span>
                <div className="text-2xl font-black">{stats.counts.plans}</div>
              </div>
              <Sparkles className="text-purple-400 h-8 w-8 opacity-40" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Registrants */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h4 className="font-extrabold text-slate-100 border-b border-slate-800 pb-2">Recent User Registrations</h4>
              <div className="space-y-3">
                {stats.recentUsers.map((u) => (
                  <div key={u._id} className="flex justify-between items-center text-xs p-2.5 bg-slate-950/40 rounded-xl">
                    <div>
                      <span className="font-bold block text-slate-200">{u.name}</span>
                      <span className="text-slate-500">{u.email}</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">{u.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Plans */}
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h4 className="font-extrabold text-slate-100 border-b border-slate-800 pb-2">Recent AI Generation Logs</h4>
              <div className="space-y-3">
                {stats.recentPlans.map((p) => (
                  <div key={p._id} className="flex justify-between items-center text-xs p-2.5 bg-slate-950/40 rounded-xl">
                    <div>
                      <span className="font-bold block text-slate-200">{p.user?.name || 'Unknown User'}</span>
                      <span className="text-slate-500">Goal: {p.inputCriteria.goal}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WORKOUTS MANAGER */}
      {activeTab === 'workouts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Routines Directory ({workoutsList.length})</span>
            <button
              onClick={openAddWorkout}
              className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
            >
              <Plus size={14} />
              <span>Add Workout</span>
            </button>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden overflow-x-auto border-slate-850">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-850">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Goal</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Muscle Group</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {workoutsList.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-900/30">
                    <td className="p-4 font-bold text-slate-200">{w.title}</td>
                    <td className="p-4 text-slate-400">{w.goal.join(', ')}</td>
                    <td className="p-4 text-slate-400">{w.difficulty}</td>
                    <td className="p-4 text-slate-400">{w.muscleGroup.join(', ')}</td>
                    <td className="p-4 text-slate-400">{w.duration} mins</td>
                    <td className="p-4 flex items-center justify-center space-x-2">
                      <button onClick={() => openEditWorkout(w)} className="p-1.5 bg-blue-950/40 text-blue-400 border border-blue-900/30 rounded hover:bg-blue-900 hover:text-white transition-colors">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => handleDeleteWorkout(w._id)} className="p-1.5 bg-red-950/40 text-red-400 border border-red-900/30 rounded hover:bg-red-900 hover:text-white transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FOOD MANAGER */}
      {activeTab === 'foods' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Food catalog Items ({foodsList.length})</span>
            <button
              onClick={openAddFood}
              className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
            >
              <Plus size={14} />
              <span>Add Food Item</span>
            </button>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden overflow-x-auto border-slate-850">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-850">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Meal Type</th>
                  <th className="p-4">Veg/Non-Veg</th>
                  <th className="p-4">Protein/Carbs/Fat</th>
                  <th className="p-4">Calories</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {foodsList.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-900/30">
                    <td className="p-4 font-bold text-slate-200">{f.name}</td>
                    <td className="p-4 text-slate-400">{f.mealType}</td>
                    <td className="p-4 text-slate-400">{f.vegNonVeg}</td>
                    <td className="p-4 text-slate-400">{f.protein}g / {f.carbs}g / {f.fat}g</td>
                    <td className="p-4 text-slate-200 font-bold">{f.calories} kcal</td>
                    <td className="p-4 flex items-center justify-center space-x-2">
                      <button onClick={() => openEditFood(f)} className="p-1.5 bg-blue-950/40 text-blue-400 border border-blue-900/30 rounded hover:bg-blue-900 hover:text-white transition-colors">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => handleDeleteFood(f._id)} className="p-1.5 bg-red-950/40 text-red-400 border border-red-900/30 rounded hover:bg-red-900 hover:text-white transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CATEGORY CONTROL */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Create category */}
          <div className="glass-card p-6 rounded-3xl h-fit border-slate-800">
            <h3 className="font-extrabold text-slate-100 border-b border-slate-800 pb-2 mb-4">Add Category</h3>
            <form onSubmit={submitCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Kettlebells, Chest"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Category Type</label>
                <select
                  value={categoryForm.type}
                  onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="goal">Goal (Fitness Goal)</option>
                  <option value="muscle">Muscle (Muscle Group)</option>
                  <option value="difficulty">Difficulty (Difficulty Level)</option>
                  <option value="equipment">Equipment (Available gear)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow"
              >
                Register Category
              </button>
            </form>
          </div>

          {/* List categories */}
          <div className="md:col-span-2 glass-card p-6 rounded-3xl border-slate-800">
            <h3 className="font-extrabold text-slate-100 border-b border-slate-800 pb-2 mb-4">Active dynamic Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {['goal', 'muscle', 'difficulty', 'equipment'].map((type) => (
                <div key={type} className="space-y-2">
                  <h4 className="font-bold text-xs uppercase text-emerald-400 tracking-wider border-b border-slate-850 pb-0.5">{type} tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {categoriesList.filter((c) => c.type === type).map((cat) => (
                      <span
                        key={cat._id}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs flex items-center space-x-1.5"
                      >
                        <span>{cat.name}</span>
                        <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-400 hover:text-red-500 font-extrabold">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: USERS CONTROL */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl overflow-hidden overflow-x-auto border-slate-850">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-850">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {usersList.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/30">
                  <td className="p-4 font-bold text-slate-200">{u.name}</td>
                  <td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4 text-slate-450">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${u.role === 'admin' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="p-1.5 bg-red-950/40 text-red-400 border border-red-900/30 rounded hover:bg-red-900 hover:text-white transition-colors"
                      disabled={u.role === 'admin'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: AI PLANS LOG LIST */}
      {activeTab === 'aiPlans' && (
        <div className="glass-card rounded-3xl overflow-hidden overflow-x-auto border-slate-850">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-bold border-b border-slate-850">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Goal Goal</th>
                <th className="p-4">Daily Calories</th>
                <th className="p-4">Macros (P/C/F)</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {plansList.map((p) => (
                <tr key={p._id} className="hover:bg-slate-900/30">
                  <td className="p-4 font-bold text-slate-200">{p.user?.name || 'Deleted User'}</td>
                  <td className="p-4 text-slate-450">{p.user?.email || 'N/A'}</td>
                  <td className="p-4 text-slate-350">{p.inputCriteria.goal}</td>
                  <td className="p-4 text-slate-200 font-bold">{p.dailyCalories} kcal</td>
                  <td className="p-4 text-slate-400">{p.protein}g / {p.carbs}g / {p.fat}g</td>
                  <td className="p-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* WORKOUT ADD/EDIT MODAL */}
      {showWorkoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl space-y-4 border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold border-b border-slate-850 pb-2">
              {editingWorkout ? 'Edit Workout Details' : 'Register New Workout'}
            </h3>
            
            <form onSubmit={submitWorkout} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Workout Title</label>
                <input
                  type="text"
                  value={workoutForm.title}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, title: e.target.value })}
                  placeholder="e.g. Barbell Squats Masterclass"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Goals (comma-separated)</label>
                <input
                  type="text"
                  value={workoutForm.goal}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, goal: e.target.value })}
                  placeholder="e.g. Legs, Strength, Muscle Gain"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  value={workoutForm.description}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, description: e.target.value })}
                  placeholder="Focus on squat depth..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 h-16 resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Difficulty</label>
                <select
                  value={workoutForm.difficulty}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, difficulty: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Muscle Groups (comma-separated)</label>
                <input
                  type="text"
                  value={workoutForm.muscleGroup}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, muscleGroup: e.target.value })}
                  placeholder="e.g. Quadriceps, Glutes"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Equipment Required (comma-separated)</label>
                <input
                  type="text"
                  value={workoutForm.equipment}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, equipment: e.target.value })}
                  placeholder="e.g. Barbell"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mins</label>
                  <input
                    type="number"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, duration: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Burn Kcal</label>
                  <input
                    type="number"
                    value={workoutForm.caloriesBurned}
                    onChange={(e) => setWorkoutForm({ ...workoutForm, caloriesBurned: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Video URL</label>
                <input
                  type="url"
                  value={workoutForm.videoUrl}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, videoUrl: e.target.value })}
                  placeholder="MP4 URL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Image URL / Path</label>
                <input
                  type="text"
                  value={workoutForm.image}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, image: e.target.value })}
                  placeholder="HTTP Image path"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Instructions Steps (one per line)</label>
                <textarea
                  value={workoutForm.steps}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, steps: e.target.value })}
                  placeholder="Stand with feet shoulder width apart..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 h-20 resize-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tips (one per line)</label>
                <textarea
                  value={workoutForm.tips}
                  onChange={(e) => setWorkoutForm({ ...workoutForm, tips: e.target.value })}
                  placeholder="Keep knees pushed outward..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 h-16 resize-none"
                />
              </div>

              <div className="md:col-span-2 flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWorkoutModal(false)}
                  className="w-1/2 py-3 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOD ADD/EDIT MODAL */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl space-y-4 border-slate-800">
            <h3 className="text-xl font-bold border-b border-slate-850 pb-2">
              {editingFood ? 'Edit Nutrient Item' : 'Add Food Item'}
            </h3>
            
            <form onSubmit={submitFood} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Food Name</label>
                <input
                  type="text"
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  placeholder="e.g. Raw Almonds"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Meal Type</label>
                  <select
                    value={foodForm.mealType}
                    onChange={(e) => setFoodForm({ ...foodForm, mealType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Veg/Non-Veg</label>
                  <select
                    value={foodForm.vegNonVeg}
                    onChange={(e) => setFoodForm({ ...foodForm, vegNonVeg: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={foodForm.protein}
                    onChange={(e) => setFoodForm({ ...foodForm, protein: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 text-center"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={foodForm.carbs}
                    onChange={(e) => setFoodForm({ ...foodForm, carbs: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 text-center"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={foodForm.fat}
                    onChange={(e) => setFoodForm({ ...foodForm, fat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 text-center"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Kcal</label>
                  <input
                    type="number"
                    value={foodForm.calories}
                    onChange={(e) => setFoodForm({ ...foodForm, calories: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 text-center"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Image Link / Path</label>
                <input
                  type="text"
                  value={foodForm.image}
                  onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                  placeholder="HTTP path to item photo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFoodModal(false)}
                  className="w-1/2 py-3 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
