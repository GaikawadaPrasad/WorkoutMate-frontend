import React, { createContext, useState, useEffect } from 'react';
import API from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('workoutmate_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data && res.data.success) {
            setUser(res.data.data);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Error fetching current user:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token, userProfile } = res.data;
        localStorage.setItem('workoutmate_token', token);
        setToken(token);
        setUser(userProfile);
        return { success: true };
      }
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);
      if (res.data && res.data.success) {
        const { token, name, email, role } = res.data;
        localStorage.setItem('workoutmate_token', token);
        setToken(token);
        setUser({ _id: res.data._id, name, email, role, ...userData });
        return { success: true };
      }
    } catch (err) {
      console.error('Registration error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Try again.',
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('workoutmate_token');
    setToken(null);
    setUser(null);
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const res = await API.put('/auth/profile', profileData);
      if (res.data && res.data.success) {
        setUser(res.data.data);
        return { success: true };
      }
    } catch (err) {
      console.error('Profile update error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
