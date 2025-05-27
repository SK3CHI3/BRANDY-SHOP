import { supabase } from '@/lib/supabase'

// Debug function to check actual data in the database
export const debugStats = async () => {
  console.log('🔍 Starting stats debug...')

  try {
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_verified, created_at')
      .order('created_at', { ascending: false })

    console.log('📊 Profiles data:', {
      total: profiles?.length || 0,
      profiles: profiles?.slice(0, 5), // Show first 5
      error: profilesError
    })

    // Check artists specifically
    const { data: artists, error: artistsError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_verified, created_at')
      .eq('role', 'artist')
      .order('created_at', { ascending: false })

    console.log('🎨 Artists data:', {
      total: artists?.length || 0,
      artists: artists,
      error: artistsError
    })

    // Check products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, artist_id, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('🛍️ Products data:', {
      total: products?.length || 0,
      products: products,
      error: productsError
    })

    // Check orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('📦 Orders data:', {
      total: orders?.length || 0,
      orders: orders,
      error: ordersError
    })

    // Get counts using the same method as useStats
    const { count: artistCount, error: artistCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'artist')

    const { count: productCount, error: productCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: orderCount, error: orderCountError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    console.log('📈 Final counts:', {
      artistCount,
      artistCountError,
      productCount,
      productCountError,
      orderCount,
      orderCountError
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

// Function to create test artists if none exist
export const createTestArtists = async () => {
  console.log('🎨 Creating test artists...')

  try {
    // Check if we already have artists
    const { count: existingArtists } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'artist')

    if (existingArtists && existingArtists > 0) {
      console.log(`✅ Already have ${existingArtists} artists, skipping creation`)
      return { success: true, message: `Already have ${existingArtists} artists` }
    }

    // Create test artists
    const testArtists = [
      {
        id: crypto.randomUUID(),
        email: 'sarah.wanjiku@example.com',
        full_name: 'Sarah Wanjiku',
        role: 'artist',
        is_verified: true,
        bio: 'Passionate artist specializing in traditional Kenyan patterns with modern twists.',
        phone: '+254712345678',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        email: 'john.mwangi@example.com',
        full_name: 'John Mwangi',
        role: 'artist',
        is_verified: true,
        bio: 'Contemporary artist focusing on urban Kenyan culture and street art.',
        phone: '+254723456789',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        email: 'grace.njeri@example.com',
        full_name: 'Grace Njeri',
        role: 'artist',
        is_verified: false,
        bio: 'Wildlife artist inspired by Kenya\'s beautiful national parks.',
        phone: '+254734567890',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const { data, error } = await supabase
      .from('profiles')
      .insert(testArtists)
      .select()

    if (error) {
      console.error('❌ Failed to create test artists:', error)
      return { success: false, message: error.message }
    }

    console.log('✅ Created test artists:', data)

    // Create artist profiles for each
    const artistProfiles = testArtists.map(artist => ({
      id: artist.id,
      bio: artist.bio,
      response_time: '24 hours',
      languages: ['English', 'Swahili'],
      skills: ['Pattern Design', 'Cultural Art', 'T-shirt Design'],
      total_earnings: Math.floor(Math.random() * 50000),
      completed_orders: Math.floor(Math.random() * 100),
      rating: 4 + Math.random(),
      total_reviews: Math.floor(Math.random() * 50),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { error: profileError } = await supabase
      .from('artist_profiles')
      .insert(artistProfiles)

    if (profileError) {
      console.error('❌ Failed to create artist profiles:', profileError)
    } else {
      console.log('✅ Created artist profiles')
    }

    return { success: true, message: `Created ${testArtists.length} test artists` }

  } catch (error) {
    console.error('❌ Error creating test artists:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Make function available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).createTestArtists = createTestArtists
  (window as any).debugStats = debugStats
}

// Auto-run debug when this file is imported in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run after a short delay to ensure Supabase is initialized
  setTimeout(async () => {
    await debugStats()
    // Optionally create test artists if none exist
    // await createTestArtists()
  }, 2000)
}
