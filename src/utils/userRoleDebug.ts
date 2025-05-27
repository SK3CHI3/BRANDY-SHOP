// User Role Debug Utilities
// This file contains utilities to debug and fix user role issues

import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/supabase'

export interface UserDebugInfo {
  userId: string
  email: string
  authMetadata: any
  profileExists: boolean
  profileData: any
  artistProfileExists: boolean
  artistProfileData: any
}

// Debug function to check user role setup
export const debugUserRole = async (userId: string): Promise<UserDebugInfo> => {
  try {
    // Get auth user data - DISABLED admin call to prevent 403 errors
    // const { data: authData } = await supabase.auth.admin.getUserById(userId)
    const authData = { user: { email: 'Unknown', user_metadata: {} } }

    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Check if artist profile exists
    const { data: artistProfileData, error: artistError } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return {
      userId,
      email: authData.user?.email || 'Unknown',
      authMetadata: authData.user?.user_metadata || {},
      profileExists: !profileError,
      profileData: profileData || null,
      artistProfileExists: !artistError,
      artistProfileData: artistProfileData || null
    }
  } catch (error) {
    console.error('Error debugging user role:', error)
    throw error
  }
}

// Fix user role function
export const fixUserRole = async (userId: string, correctRole: UserRole): Promise<{ success: boolean; message: string }> => {
  try {
    // Get current profile data directly instead of using admin calls
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const { data: artistProfileData } = await supabase
      .from('artist_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const debugInfo = {
      userId,
      email: profileData?.email || 'Unknown',
      authMetadata: {},
      profileExists: !!profileData,
      profileData: profileData || null,
      artistProfileExists: !!artistProfileData,
      artistProfileData: artistProfileData || null
    }

    // Update or create profile with correct role
    if (debugInfo.profileExists) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: correctRole })
        .eq('id', userId)

      if (updateError) {
        return { success: false, message: `Failed to update profile: ${updateError.message}` }
      }
    } else {
      // Create new profile
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: debugInfo.email,
          full_name: debugInfo.authMetadata.full_name || '',
          role: correctRole,
          is_verified: false
        })

      if (createError) {
        return { success: false, message: `Failed to create profile: ${createError.message}` }
      }
    }

    // Handle artist profile
    if (correctRole === 'artist') {
      if (!debugInfo.artistProfileExists) {
        // Create artist profile
        const { error: artistError } = await supabase
          .from('artist_profiles')
          .insert({
            id: userId,
            response_time: '24 hours',
            languages: ['English'],
            skills: [],
            total_earnings: 0,
            completed_orders: 0,
            rating: 0,
            total_reviews: 0
          })

        if (artistError) {
          return { success: false, message: `Failed to create artist profile: ${artistError.message}` }
        }
      }
    } else {
      // If changing from artist to another role, optionally remove artist profile
      if (debugInfo.artistProfileExists) {
        const { error: deleteError } = await supabase
          .from('artist_profiles')
          .delete()
          .eq('id', userId)

        if (deleteError) {
          console.warn('Failed to delete artist profile:', deleteError.message)
        }
      }
    }

    return { success: true, message: `User role successfully updated to ${correctRole}` }
  } catch (error) {
    return { success: false, message: `Error fixing user role: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

// Get all users with role issues
export const findUsersWithRoleIssues = async (): Promise<any[]> => {
  try {
    // Get all profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')

    // Get all artist profiles
    const { data: artistProfiles } = await supabase
      .from('artist_profiles')
      .select('id')

    const artistIds = new Set(artistProfiles?.map(ap => ap.id) || [])
    const issues: any[] = []

    profiles?.forEach(profile => {
      // Check for role mismatches
      if (profile.role === 'artist' && !artistIds.has(profile.id)) {
        issues.push({
          userId: profile.id,
          email: profile.email,
          issue: 'Artist role but no artist profile',
          currentRole: profile.role
        })
      }

      if (profile.role !== 'artist' && artistIds.has(profile.id)) {
        issues.push({
          userId: profile.id,
          email: profile.email,
          issue: 'Has artist profile but not artist role',
          currentRole: profile.role
        })
      }
    })

    return issues
  } catch (error) {
    console.error('Error finding role issues:', error)
    return []
  }
}

// Batch fix all role issues
export const batchFixRoleIssues = async (): Promise<{ fixed: number; errors: string[] }> => {
  const issues = await findUsersWithRoleIssues()
  let fixed = 0
  const errors: string[] = []

  for (const issue of issues) {
    try {
      let targetRole: UserRole = issue.currentRole

      // Determine correct role based on issue
      if (issue.issue === 'Artist role but no artist profile') {
        // Keep as artist and create artist profile
        targetRole = 'artist'
      } else if (issue.issue === 'Has artist profile but not artist role') {
        // Change to artist role
        targetRole = 'artist'
      }

      const result = await fixUserRole(issue.userId, targetRole)
      if (result.success) {
        fixed++
      } else {
        errors.push(`${issue.email}: ${result.message}`)
      }
    } catch (error) {
      errors.push(`${issue.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return { fixed, errors }
}

// Console helper functions for debugging
export const debugCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const debugInfo = await debugUserRole(user.id)
    console.log('Current User Debug Info:', debugInfo)
    return debugInfo
  } else {
    console.log('No authenticated user')
    return null
  }
}

export const fixCurrentUserRole = async (role: UserRole) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const result = await fixUserRole(user.id, role)
    console.log('Fix Result:', result)
    return result
  } else {
    console.log('No authenticated user')
    return { success: false, message: 'No authenticated user' }
  }
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).debugUserRole = debugUserRole
  (window as any).fixUserRole = fixUserRole
  (window as any).debugCurrentUser = debugCurrentUser
  (window as any).fixCurrentUserRole = fixCurrentUserRole
  (window as any).findUsersWithRoleIssues = findUsersWithRoleIssues
  (window as any).batchFixRoleIssues = batchFixRoleIssues
}
