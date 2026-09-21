import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Normalize Supabase user to include convenient aliases (e.g. .uid, .displayName)
const normalizeUser = (user) => {
  if (!user) return null;
  const displayName = user.user_metadata?.display_name || user.user_metadata?.name || '';
  return {
    ...user,
    uid: user.id,
    displayName: displayName,
  };
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // 1. Sign Up with display name passed into user_metadata
  const signup = async (email, password, displayName) => {
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName ? displayName.trim() : '',
          },
        },
      });

      if (error) throw error;
      const normalized = normalizeUser(data.user);
      if (normalized) setCurrentUser(normalized);
      return normalized;
    } catch (err) {
      const msg = err.message || 'Error during sign up';
      setAuthError(msg);
      throw err;
    }
  };

  // 2. Sign In with email and password
  const login = async (email, password) => {
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      const normalized = normalizeUser(data.user);
      setCurrentUser(normalized);
      return normalized;
    } catch (err) {
      const msg = err.message || 'Invalid login credentials';
      setAuthError(msg);
      throw err;
    }
  };

  // 3. Sign Out
  const logout = async () => {
    setAuthError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentUser(null);
    } catch (err) {
      setAuthError(err.message || 'Error signing out');
    }
  };

  // 4. Password Recovery via Email
  const resetPassword = async (email) => {
    setAuthError('');
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      const msg = err.message || 'Error requesting password reset';
      setAuthError(msg);
      throw err;
    }
  };

  // 5. Update Display Name in Supabase Auth Metadata
  const updateDisplayName = async (newDisplayName) => {
    setAuthError('');
    try {
      const trimmed = newDisplayName ? newDisplayName.trim() : '';
      const { data, error } = await supabase.auth.updateUser({
        data: {
          display_name: trimmed,
        },
      });

      if (error) throw error;
      const normalized = normalizeUser(data.user);
      setCurrentUser(normalized);
      return normalized;
    } catch (err) {
      const msg = err.message || 'Error updating display name';
      setAuthError(msg);
      throw err;
    }
  };

  // 6. Listen to Supabase Auth State Changes
  useEffect(() => {
    let mounted = true;

    // Fetch initial active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (mounted) {
        if (session?.user) {
          setCurrentUser(normalizeUser(session.user));
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session?.user) {
          setCurrentUser(normalizeUser(session.user));
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateDisplayName,
    authError,
    setAuthError,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
