import { useState, useEffect } from 'react';
import { apiLogin, apiRegister, apiGetMe } from '../api/endpoints';

function loadUser() {
  try {
    const saved = localStorage.getItem('pmc_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export default function useAuth() {
  const [user, setUser] = useState(loadUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verify token with backend on mount
  useEffect(() => {
    const token = localStorage.getItem('pmc_token');
    if (!token) return;
    apiGetMe().catch(() => {
      localStorage.removeItem('pmc_token');
      localStorage.removeItem('pmc_user');
      setUser(null);
    });
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiLogin({ email, password });
      localStorage.setItem('pmc_token', data.token);
      const userData = { id: data.user.id, name: data.user.name, email: data.user.email };
      localStorage.setItem('pmc_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, phone, password }) => {
    setLoading(true);
    setError('');
    try {
      await apiRegister({ name, email, phone, password });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pmc_token');
    localStorage.removeItem('pmc_user');
    setUser(null);
    setError('');
  };

  return { user, setUser, loading, error, login, register, logout };
}
