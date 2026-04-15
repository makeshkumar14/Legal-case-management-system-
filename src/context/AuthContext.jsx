import { createContext, useContext, useEffect, useState } from 'react';
import { AUTH_CHANGE_EVENT } from '../services/api';

const AuthContext = createContext();
const validRoles = ['public', 'advocate', 'court'];

function getStoredUser() {
  const saved = localStorage.getItem('user');
  if (!saved) return null;

  try {
    const parsedUser = JSON.parse(saved);
    if (parsedUser && parsedUser.role && validRoles.includes(parsedUser.role)) {
      return parsedUser;
    }
  } catch (err) {
    // Fall through to clear the corrupted session below.
  }

  localStorage.removeItem('user');
  localStorage.removeItem('token');
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  useEffect(() => {
    const syncStoredAuth = () => {
      setUser(getStoredUser());
      setToken(localStorage.getItem('token') || null);
    };

    window.addEventListener('storage', syncStoredAuth);
    window.addEventListener(AUTH_CHANGE_EVENT, syncStoredAuth);

    return () => {
      window.removeEventListener('storage', syncStoredAuth);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncStoredAuth);
    };
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    if (jwtToken) localStorage.setItem('token', jwtToken);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
