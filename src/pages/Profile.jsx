import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { User, ShieldAlert, Award, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    goal: '',
    activityLevel: 'Moderately Active (exercise 3-5 days/week)',
    experienceLevel: 'Beginner',
    foodPreference: 'Veg',
    medicalConditions: '',
    allergies: '',
    equipmentAvailable: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data && res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        age: user.age || '',
        gender: user.gender || 'Male',
        height: user.height || '',
        weight: user.weight || '',
        goal: user.goal || '',
        activityLevel: user.activityLevel || 'Moderately Active (exercise 3-5 days/week)',
        experienceLevel: user.experienceLevel || 'Beginner',
        foodPreference: user.foodPreference || 'Veg',
        medicalConditions: user.medicalConditions ? user.medicalConditions.join(', ') : '',
        allergies: user.allergies ? user.allergies.join(', ') : '',
        equipmentAvailable: user.equipmentAvailable ? user.equipmentAvailable.join(', ') : '',
      });
    }
  }, [user]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map((x) => x.trim()).filter((x) => x) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map((x) => x.trim()).filter((x) => x) : [],
        equipmentAvailable: formData.equipmentAvailable ? formData.equipmentAvailable.split(',').map((x) => x.trim()).filter((x) => x) : [],
      };

      if (!payload.password) delete payload.password; // Don't send empty password

      const result = await updateProfile(payload);
      if (result && result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during update.');
    } finally {
      setLoading(false);
    }
  };

  const goals = categories.filter((c) => c.type === 'goal');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen bg-slate-950/20">
      
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100 flex items-center space-x-2">
          <User className="text-emerald-500" />
          <span>My Profile & Biometrics</span>
        </h2>
        <p className="text-slate-400 text-sm">Update your physiological metrics to calibrate daily metabolic calculations.</p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border-slate-800 relative">
        {error && (
          <div className="flex items-center space-x-2 p-4 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-sm mb-6">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800 text-emerald-400 text-sm mb-6">
            <CheckCircle2 size={18} />
            <span>Profile metrics saved successfully!</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* SECTION 1: ACCOUNT DETAILS */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider border-b border-slate-850 pb-1">Account Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Change Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={onChange}
                  placeholder="Leave empty to keep current"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: BIOMETRICS */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider border-b border-slate-850 pb-1">Biometrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: FITNESS GOALS */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider border-b border-slate-850 pb-1">Goals & Preferences</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Goal</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  {goals.map((g) => (
                    <option key={g._id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 text-sm"
                >
                  <option value="Sedentary (little or no exercise)">Sedentary (little/no exercise)</option>
                  <option value="Lightly Active (exercise 1-3 days/week)">Lightly Active (1-3 days/wk)</option>
                  <option value="Moderately Active (exercise 3-5 days/week)">Moderately Active (3-5 days/wk)</option>
                  <option value="Very Active (exercise 6-7 days/week)">Very Active (6-7 days/wk)</option>
                  <option value="Extra Active (hard exercise daily or physical job)">Extra Active (hard daily)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Diet Preference</label>
                <select
                  name="foodPreference"
                  value={formData.foodPreference}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                >
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Pescatarian">Pescatarian</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: HEALTH CONSTRAINTS */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider border-b border-slate-850 pb-1">Conditions & Equips</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Medical Conditions (comma-split)</label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 h-20 resize-none"
                  placeholder="e.g. Knee soreness, High blood pressure"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Allergies (comma-split)</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 h-20 resize-none"
                  placeholder="e.g. Peanuts, Dairy, Almonds"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Equipment at Hand (comma-split)</label>
                <textarea
                  name="equipmentAvailable"
                  value={formData.equipmentAvailable}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 h-20 resize-none"
                  placeholder="e.g. Dumbbells, Barbell, Resistance Band"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-1.5 transition-colors shadow shadow-emerald-600/10 ml-auto"
              disabled={loading}
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default Profile;
