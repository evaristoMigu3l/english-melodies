import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          // Small delay to let the trigger create the profile first
          if (event === 'SIGNED_IN') {
            setTimeout(() => fetchProfile(session.user.id), 1000)
          } else {
            fetchProfile(session.user.id)
          }
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = () => {
    if (user) {
      fetchProfile(user.id)
    }
  }

  const canGenerate = () => {
    if (!profile) return false
    return profile.generations_used < profile.generation_limit
  }

  const incrementGenerations = async () => {
    if (!profile) return
    const newCount = profile.generations_used + 1
    const { error } = await supabase
      .from('user_profiles')
      .update({ generations_used: newCount, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating generations:', error)
      throw error
    }
    setProfile(prev => ({ ...prev, generations_used: newCount }))
  }

  const value = {
    user,
    profile,
    loading,
    signInWithGoogle,
    signOut,
    refreshProfile,
    canGenerate,
    incrementGenerations,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
