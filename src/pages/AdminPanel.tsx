import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Navigate } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminDashboard from '@/pages/admin/AdminDashboard'

// This component now serves as a router for admin functionality

const AdminPanel = () => {
  const { user, profile } = useAuth()

  // Redirect if not admin
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )


}

export default AdminPanel
