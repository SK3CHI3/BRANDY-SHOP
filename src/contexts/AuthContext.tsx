import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile, UserRole } from '@/lib/supabase'

interface ExtendedUser extends User {
  role?: UserRole
  full_name?: string
}

interface AuthContextType {
  user: ExtendedUser | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const updateUserWithProfile = (baseUser: User | null, profileData: Profile | null) => {
    if (!baseUser) {
      setUser(null)
      return
    }

    const extendedUser: ExtendedUser = {
      ...baseUser,
      role: profileData?.role || baseUser.user_metadata?.role || 'customer',
      full_name: profileData?.full_name || baseUser.user_metadata?.full_name || ''
    }

    console.log('Setting user with profile:', {
      email: extendedUser.email,
      role: extendedUser.role,
      full_name: extendedUser.full_name
    })

    setUser(extendedUser)
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        setSession(session)

        if (session?.user) {
          await fetchProfile(session.user.id, session.user)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth state changed:', event, session?.user?.email)
      setSession(session)

      if (session?.user) {
        await fetchProfile(session.user.id, session.user)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string, baseUser: User) => {
    try {
      console.log('Fetching profile for user:', userId)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)

        // If profile doesn't exist, try to create a basic one
        if (error.code === 'PGRST116') { // Not found error
          console.log('Profile not found, creating new profile...')

          const profileData = {
            id: userId,
            email: baseUser.email,
            full_name: baseUser.user_metadata?.full_name || '',
            role: baseUser.user_metadata?.role || 'customer',
            is_verified: false
          }

          const { error: createError } = await supabase
            .from('profiles')
            .insert(profileData)

          if (!createError) {
            console.log('Profile created successfully')
            // Retry fetching the profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single()

            if (newProfile) {
              console.log('Profile fetched after creation:', newProfile)
              setProfile(newProfile)
              updateUserWithProfile(baseUser, newProfile)
            } else {
              console.log('Failed to fetch profile after creation, using fallback')
              // Use the data we tried to insert as fallback
              setProfile(profileData as any)
              updateUserWithProfile(baseUser, profileData as any)
            }
          } else {
            console.error('Error creating profile:', createError)
            // Still set user even if profile creation fails
            updateUserWithProfile(baseUser, null)
          }
        } else {
          console.error('Profile fetch error (not 404):', error)
          // Still set user even if profile fetch fails
          updateUserWithProfile(baseUser, null)
        }
      } else {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
        updateUserWithProfile(baseUser, data)
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      // Always set user even if profile operations fail
      updateUserWithProfile(baseUser, null)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (!error && data.user) {
      try {
        // Wait a bit for the profile to be created by the trigger
        await new Promise(resolve => setTimeout(resolve, 1000))

        // First, check if profile exists, if not create it
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
              role: role,
              is_verified: false
            })

          if (insertError) {
            console.error('Error creating profile:', insertError)
          }
        } else {
          // Update existing profile with the selected role
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role,
              full_name: fullName,
              email: data.user.email
            })
            .eq('id', data.user.id)

          if (updateError) {
            console.error('Error updating profile:', updateError)
          }
        }

        // If artist, create artist profile
        if (role === 'artist') {
          const { error: artistError } = await supabase
            .from('artist_profiles')
            .insert({
              id: data.user.id,
              response_time: '24 hours',
              languages: ['English'],
              skills: [],
              total_earnings: 0,
              completed_orders: 0,
              rating: 0,
              total_reviews: 0
            })

          if (artistError) {
            console.error('Error creating artist profile:', artistError)
          }
        }
      } catch (profileError) {
        console.error('Error setting up user profile:', profileError)
      }
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      const updatedProfile = profile ? { ...profile, ...updates } : null
      setProfile(updatedProfile)
      updateUserWithProfile(user, updatedProfile)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
