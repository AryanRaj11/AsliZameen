'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    let isMounted = true;

    // Helper to fetch the DB profile
    const getProfile = async (authUserId: string, email: string) => {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      return data;
    };

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted && session?.user) {
          const profile = await getProfile(session.user.id, session.user.email!);
          setUser(profile || session.user);
        }
      } catch (e) {
        console.error("Init error", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/');
      } else if (session?.user) {
        // 🛑 THE FIX: Use a functional update to check the current state 
        // without making 'user' a dependency of the useEffect.
        setUser((currentUser: any) => {
          // If we already have this user and their data, DO NOT update state.
          // This stops the re-render loop when you change tabs.
          if (currentUser?.id === session.user.id) {
            return currentUser; 
          }
          
          // If it's a new user, fetch their profile
          getProfile(session.user.id, session.user.email!).then(profile => {
            if (isMounted) setUser(profile || session.user);
          });

          return currentUser; // Keep old user while fetching new profile
        });
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return
    const isFav = favorites.includes(propertyId)
    const updated = isFav
      ? favorites.filter(id => id !== propertyId)
      : [...favorites, propertyId]

    setFavorites(updated)

    // Optional: Save back to Supabase metadata
    await supabase.auth.updateUser({
      data: { favorites: updated }
    })
  }

  const isFavorite = (propertyId: string) => favorites.includes(propertyId)

  const value = {
    user,
    loading,
    logout: () => supabase.auth.signOut(),
    isFavorite,
    toggleFavorite,
    role: user?.role || 'buyer'
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Logic: Only show a blank screen/spinner on the VERY FIRST load 
         if we don't have a user. Once children are mounted, we never 
         unmount them, which saves your Land Papers data.
      */}
      {loading && !user ? (
        <div className="flex h-screen items-center justify-center">Loading...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}