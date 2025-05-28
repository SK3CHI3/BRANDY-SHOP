import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { toast } from '@/hooks/use-toast'

interface RefreshButtonProps {
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
  showText?: boolean
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  size = 'sm', 
  variant = 'ghost', 
  className = '',
  showText = false 
}) => {
  const { forceRefreshAll } = useData()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await forceRefreshAll()
      toast({
        title: 'Data Refreshed',
        description: 'All content has been updated with the latest data',
      })
    } catch (error) {
      console.error('Refresh error:', error)
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={refreshing}
      size={size}
      variant={variant}
      className={className}
    >
      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''} ${showText ? 'mr-2' : ''}`} />
      {showText && (refreshing ? 'Refreshing...' : 'Refresh')}
    </Button>
  )
}

export default RefreshButton
