import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');

      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
          console.error('Failed to fetch user profile, falling back to local storage', error);
          if (userInfo) {
            setUser(JSON.parse(userInfo));
          }
        }
      } else if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      const errData = error.response?.data;
      const errorMsg = errData?.errors ? errData.errors[0].msg : errData?.msg || 'Login failed';
      toast.error(errorMsg);
      return false;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      toast.success('Signed up successfully');
      return true;
    } catch (error) {
      const errData = error.response?.data;
      const errorMsg = errData?.errors ? errData.errors[0].msg : errData?.msg || 'Signup failed';
      toast.error(errorMsg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
