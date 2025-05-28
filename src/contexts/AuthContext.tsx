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
        console.log('🔐 Initializing authentication...')

        // Check localStorage first for debugging
        const storedSession = localStorage.getItem('brandy-shop-auth-token')
        console.log('🔍 Stored session in localStorage:', storedSession ? 'EXISTS' : 'NONE')

        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error('❌ Error getting session:', error)
          // Try to recover from localStorage if available
          if (storedSession) {
            console.log('🔄 Attempting session recovery...')
            try {
              const parsedSession = JSON.parse(storedSession)
              if (parsedSession?.access_token) {
                console.log('🔄 Found stored session, attempting to restore...')
                // Let the auth state change handler deal with this
              }
            } catch (parseError) {
              console.error('❌ Failed to parse stored session:', parseError)
              localStorage.removeItem('brandy-shop-auth-token')
            }
          }
          setLoading(false)
          return
        }

        console.log('✅ Session retrieved:', session ? `Active session found for ${session.user?.email}` : 'No active session')
        setSession(session)

        if (session?.user) {
          console.log('👤 User found in session, fetching profile...')

          // Set a very short timeout for profile fetch to avoid hanging
          const profileTimeout = setTimeout(() => {
            console.log('⚠️ Profile fetch taking too long, using session data as fallback')
            const fallbackProfile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || '',
              role: session.user.user_metadata?.role || 'customer',
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            setProfile(fallbackProfile as any)
            updateUserWithProfile(session.user, fallbackProfile as any)
            setLoading(false)
            console.log('🔓 Auth loading complete - using fallback profile')
          }, 500) // 500ms timeout - much faster

          try {
            await fetchProfile(session.user.id, session.user)
            clearTimeout(profileTimeout)
          } catch (error) {
            clearTimeout(profileTimeout)
            console.error('Profile fetch failed:', error)
          }
        } else {
          console.log('❌ No user in session, setting auth as complete')
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error)
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
      console.log('👤 Fetching profile for user:', userId)

      // Add timeout to profile fetch
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      )

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Error fetching profile:', error)

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
        console.log('✅ Profile fetched successfully:', data)
        console.log('👤 Profile data:', { role: data.role, full_name: data.full_name, is_verified: data.is_verified })
        setProfile(data)
        updateUserWithProfile(baseUser, data)
        console.log('🔓 Auth loading complete - user and profile set')
      }
    } catch (error) {
      console.error('💥 Unexpected error fetching profile:', error)

      // If it's a timeout or network error, still set the user with basic info
      if (error.message === 'Profile fetch timeout' || error instanceof TypeError) {
        console.log('⚠️ Profile fetch failed, using user metadata as fallback')
        const fallbackProfile = {
          id: userId,
          email: baseUser.email || '',
          full_name: baseUser.user_metadata?.full_name || '',
          role: baseUser.user_metadata?.role || 'customer',
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setProfile(fallbackProfile as any)
        updateUserWithProfile(baseUser, fallbackProfile as any)
        console.log('🔓 Auth loading complete - user set with fallback profile')
      } else {
        // Always set user even if profile operations fail
        updateUserWithProfile(baseUser, null)
        console.log('⚠️ Auth loading complete - user set without profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
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

      if (error) {
        console.error('Supabase auth signup error:', error)
        return { data, error }
      }

      if (!data.user) {
        return { data, error: { message: 'User creation failed - no user data returned' } }
      }

      try {
        // Wait a bit for the database trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check if profile was created by the trigger
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', data.user.id)
          .single()

        console.log('Profile check result:', { existingProfile, fetchError })

        if (!existingProfile) {
          console.log('Profile not created by trigger, creating manually...')
          // Create profile manually if trigger didn't work
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName,
              role: role,
              is_verified: false
            })

          if (insertError) {
            console.error('Error creating profile manually:', insertError)
            // Don't fail the signup, just log the error
            console.warn('Profile creation failed, but user account was created successfully')
          } else {
            console.log('Profile created manually')
          }
        } else {
          console.log('Profile exists, updating if needed...')
          // Update profile if it exists but has wrong data
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role,
              full_name: fullName,
              email: data.user.email || email
            })
            .eq('id', data.user.id)

          if (updateError) {
            console.error('Error updating profile:', updateError)
          }
        }

        // If artist, ensure artist profile exists
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

          if (artistError && artistError.code !== '23505') { // Ignore duplicate key error
            console.error('Error creating artist profile:', artistError)
            // Don't fail the signup, just log the error
            console.warn('Artist profile creation failed, but user account was created successfully')
          }
        }

        console.log('User signup completed successfully')
        return { data, error: null }

      } catch (profileError) {
        console.error('Error setting up user profile:', profileError)
        // Don't fail the signup completely, the user account was created
        console.warn('Profile setup had issues, but user account was created successfully')
        return { data, error: null }
      }
    } catch (generalError) {
      console.error('General signup error:', generalError)
      return {
        data: null,
        error: {
          message: `Signup failed: ${generalError instanceof Error ? generalError.message : 'Unknown error'}`
        }
      }
    }
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
