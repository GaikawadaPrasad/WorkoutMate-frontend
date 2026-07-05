import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Dumbbell, User, Mail, Lock, Sparkles, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import API from '../utils/api';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form State
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
  });

  // Fetch dynamic categories for goal selector
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data && res.data.success) {
          setCategories(res.data.data);
          // Set initial goal if categories exist
          const goals = res.data.data.filter((c) => c.type === 'goal');
          if (goals.length > 0) {
            setFormData((prev) => ({ ...prev, goal: goals[0].name }));
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill out account credentials');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    if (step === 2) {
      if (!formData.age || !formData.height || !formData.weight) {
        setError('Please enter age, height, and weight');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = (e) => {
    e.preventDefault();
    setError('');
    setStep(step - 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({
      ...formData,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
    });

    setLoading(false);
    if (result && !result.success) {
      setError(result.message);
    } else {
      navigate('/dashboard');
    }
  };

  const goalOptions = categories.filter((c) => c.type === 'goal');
  const activityLevels = [
    'Sedentary (little or no exercise)',
    'Lightly Active (exercise 1-3 days/week)',
    'Moderately Active (exercise 3-5 days/week)',
    'Very Active (exercise 6-7 days/week)',
    'Extra Active (hard exercise daily or physical job)',
  ];

  return (
    <div className="bg-gradient-premium min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="glass-card max-w-lg w-full p-8 rounded-3xl space-y-6 shadow-2xl relative border-slate-800">
        
        {/* Progress Tracker */}
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
          <span className={step >= 1 ? 'text-emerald-400 font-extrabold' : ''}>1. Credentials</span>
          <div className="h-[2px] bg-slate-800 flex-grow mx-4 rounded" />
          <span className={step >= 2 ? 'text-emerald-400 font-extrabold' : ''}>2. Biometrics</span>
          <div className="h-[2px] bg-slate-800 flex-grow mx-4 rounded" />
          <span className={step >= 3 ? 'text-emerald-400 font-extrabold' : ''}>3. Lifestyle</span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-100">Create Account</h2>
          <p className="text-slate-400 text-sm">Let's build your personalized training profile</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 p-4 rounded-xl bg-red-950/30 border border-red-800 text-red-400 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* STEP 1: CREDENTIALS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    placeholder="•••••••• (Min 6 chars)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-2 transition-colors mt-6 shadow"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: BIOMETRICS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age (Years)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={onChange}
                    placeholder="25"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={onChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={onChange}
                    placeholder="175"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={onChange}
                    placeholder="70"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={prevStep}
                  className="w-1/3 py-3.5 rounded-xl font-bold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center justify-center space-x-1 transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  onClick={nextStep}
                  className="w-2/3 py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-1 transition-colors"
                >
                  <span>Continue</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LIFESTYLE & GOALS */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fitness Goal</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                >
                  {goalOptions.length > 0 ? (
                    goalOptions.map((g) => (
                      <option key={g._id} value={g.name}>
                        {g.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Fat Loss">Fat Loss</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="Strength">Strength</option>
                      <option value="Cardio">Cardio</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Level</label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={onChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
                >
                  {activityLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={onChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diet Preference</label>
                  <select
                    name="foodPreference"
                    value={formData.foodPreference}
                    onChange={onChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Pescatarian">Pescatarian</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={prevStep}
                  className="w-1/3 py-3.5 rounded-xl font-bold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 flex items-center justify-center space-x-1 transition-colors"
                  disabled={loading}
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-1.5 transition-colors shadow shadow-emerald-600/10"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Register & Set Up</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer info */}
        <div className="text-center text-sm text-slate-500 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-500 font-bold hover:underline">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
