import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Helper function to safely access localStorage (handles mobile/SSR issues)
const getStoredToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

const setStoredToken = (token) => {
  try {
    localStorage.setItem('token', token);
    return true;
  } catch (error) {
    console.error('Error setting localStorage:', error);
    return false;
  }
};

const removeStoredToken = () => {
  try {
    localStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    console.log('Initializing auth, stored token exists:', !!storedToken);
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify = token) => {
    try {
      console.log('Verifying token...');
      const response = await axios.get(`${API_URL}/api/auth/me`);
      setUser(response.data);
      console.log('Token verified successfully, user:', response.data.username);
    } catch (error) {
      console.error('Token verification failed:', error.response?.status, error.message);
      
      // Only logout if token is actually invalid (401), not on network errors
      if (error.response?.status === 401) {
        console.log('Token is invalid (401), logging out');
        logout();
      } else {
        console.log('Network error during verification, keeping user logged in');
        // On network errors, keep the token but set loading to false
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
        remember_me: rememberMe,
      });
      const { access_token, username: userName, role } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser({ username: userName, role });
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};