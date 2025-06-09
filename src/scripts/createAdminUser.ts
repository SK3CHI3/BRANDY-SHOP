// Script to create admin user
// This should be run once to create the admin user with specified credentials

import { supabase } from '@/lib/supabase'

export const createAdminUser = async () => {
  try {
    console.log('Creating admin user...')

    // Admin credentials
    const adminEmail = 'starshine@gmail.com'
    const adminPassword = 'tangoDown'
    const adminName = 'Admin User'

    // First, try to sign up the admin user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: adminName,
          role: 'admin',
        },
      },
    })

    if (signUpError) {
      console.error('Error creating admin user:', signUpError)
      
      // If user already exists, try to update their role
      if (signUpError.message.includes('already registered')) {
        console.log('User already exists, updating role to admin...')
        
        // Sign in first to get the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        })

        if (signInError) {
          console.error('Error signing in:', signInError)
          return { success: false, error: signInError.message }
        }

        if (signInData.user) {
          // Update the user's role to admin
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: 'admin',
              full_name: adminName,
              is_verified: true 
            })
            .eq('id', signInData.user.id)

          if (updateError) {
            console.error('Error updating user role:', updateError)
            return { success: false, error: updateError.message }
          }

          console.log('✅ Admin user role updated successfully!')
          return { success: true, message: 'Admin user role updated successfully' }
        }
      }
      
      return { success: false, error: signUpError.message }
    }

    if (signUpData.user) {
      console.log('✅ Admin user created successfully!')
      
      // Wait a moment for the profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Ensure the profile has admin role and is verified
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          is_verified: true,
          full_name: adminName
        })
        .eq('id', signUpData.user.id)

      if (updateError) {
        console.error('Error updating admin profile:', updateError)
        return { success: false, error: updateError.message }
      }

      console.log('✅ Admin profile updated successfully!')
      return { success: true, message: 'Admin user created and configured successfully' }
    }

    return { success: false, error: 'Unknown error occurred' }

  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Function to verify admin user exists and has correct permissions
export const verifyAdminUser = async () => {
  try {
    const { data: adminProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'starshine@gmail.com')
      .eq('role', 'admin')
      .single()

    if (error) {
      console.error('Admin user not found:', error)
      return { exists: false, error: error.message }
    }

    if (adminProfile) {
      console.log('✅ Admin user verified:', {
        email: adminProfile.email,
        role: adminProfile.role,
        verified: adminProfile.is_verified,
        name: adminProfile.full_name
      })
      return { exists: true, profile: adminProfile }
    }

    return { exists: false, error: 'Admin user not found' }
  } catch (error) {
    console.error('Error verifying admin user:', error)
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
