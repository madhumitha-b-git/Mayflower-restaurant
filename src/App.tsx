import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { UserProfile } from './types';
import { fetchUserProfile, getSupabaseCurrentUser, supabaseLogout } from './lib/authService';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mayflower_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync currentUser to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mayflower_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mayflower_current_user');
    }
  }, [currentUser]);

  // Restore session on mount and subscribe to real-time profile updates
  useEffect(() => {
    getSupabaseCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    }).catch(() => {});

    if (!isSupabaseConfigured) return;

    const profileChannel = supabase
      .channel('current-customer-profile')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, (payload) => {
        const userId = (payload.new as { id?: string }).id;
        const currentId = localStorage.getItem('mayflower_current_user_id');
        if (userId && userId === currentId) {
          fetchUserProfile(userId).then((user) => user && setCurrentUser(user)).catch(() => {});
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    supabaseLogout();
    localStorage.removeItem('mayflower_current_user');
    localStorage.removeItem('mayflower_current_user_id');
    setCurrentUser(null);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
  };

  return (
    <BrowserRouter>
      <AppRoutes
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />
    </BrowserRouter>
  );
}
