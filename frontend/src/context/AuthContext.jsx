import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try getting user from backend (Cookie Auth)
        const response = await api.get('/auth/profile');
        if (response.data?.success) {
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        // If fetch fails, fallback to local storage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            localStorage.removeItem('user');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, role = 'driver') => {
    try {
      let endpoint = '/auth/login';
      if (role === 'admin') {
        endpoint = '/admin/login';
      } else if (role === 'traffic') {
        endpoint = '/traffic/login';
      }

      const response = await api.post(endpoint, { email, password });
      const { token, user: userData, admin } = response.data;

      const userInfo = userData || admin || response.data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      setUser(userInfo);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success('Registration successful! Please check your email for OTP.');
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-email', { email, otp });
      toast.success('Email verified successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email');
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successful!');
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout failed", error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logout,
    isAuthenticated: !!user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || user?.role === 'admin',
    isAgent: user?.isAgent || user?.role === 'agent',
    isTraffic: user?.isTraffic || user?.role === 'traffic',
    isDriver: user?.role === 'driver' || (!user?.isAdmin && !user?.isAgent && !user?.isTraffic), // Default state
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};