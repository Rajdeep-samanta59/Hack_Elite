import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  biometricEnabled: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        biometricEnabled: action.payload.user.biometricEnabled || false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        biometricEnabled: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'ENABLE_BIOMETRIC':
      return {
        ...state,
        biometricEnabled: true,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
  try {
          const response = await authAPI.verify();
          // Normalize full name coming from backend (may be _fullName)
          const userFromServer = response.data.user || {};
          userFromServer.fullName = userFromServer.fullName || userFromServer._fullName || userFromServer.fullname || userFromServer.email || 'User';
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userFromServer,
              token,
            },
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGIN_FAILURE' });
        }
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      // Normalize fullName field (backend may return _fullName)
      user.fullName = user.fullName || user._fullName || user.fullname || user.email || 'User';
      localStorage.setItem('token', token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success('Login successful!');
      // Redirect based on role
      if (user.role === 'doctor') {
        navigate('/doctor/portal');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  };

  const biometricLogin = async (biometricData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.biometricVerify(biometricData);
      const { user, token } = response.data;
      user.fullName = user.fullName || user._fullName || user.fullname || user.email || 'User';
      localStorage.setItem('token', token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success('Biometric authentication successful!');
      // Navigation still happens here; return the response so caller can react too
      if (user.role === 'doctor') {
        navigate('/doctor/portal');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/patient/dashboard');
      }
      return { user, token };
    } catch (error) {
      console.error('Biometric login error:', error);
      const message = error.response?.data?.message || 'Biometric authentication failed';
      toast.error(message);
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      user.fullName = user.fullName || user._fullName || user.fullname || user.email || 'User';
      localStorage.setItem('token', token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success('Account created successfully!');
      if (user.role === 'doctor') {
        navigate('/doctor/portal');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    navigate('/');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      // For now, just update the local state
      // In a real implementation, you would call the API
      dispatch({ type: 'UPDATE_USER', payload: profileData });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    }
  };

  const enableBiometric = async (biometricTemplate) => {
    try {
      await authAPI.enableBiometric(biometricTemplate);
      dispatch({ type: 'ENABLE_BIOMETRIC' });
      toast.success('Biometric authentication enabled!');
    } catch (error) {
      console.error('Enable biometric error:', error);
      const message = error.response?.data?.message || 'Failed to enable biometric';
      toast.error(message);
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    biometricLogin,
    register,
    logout,
    updateProfile,
    enableBiometric,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 