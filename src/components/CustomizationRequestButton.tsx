
import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { commissionService } from '@/services/commissions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { Edit3, MessageSquare } from 'lucide-react'

interface CustomizationRequestButtonProps {
  productId: string
  artistId: string
  productTitle: string
  disabled?: boolean
}

const CustomizationRequestButton: React.FC<CustomizationRequestButtonProps> = ({
  productId,
  artistId,
  productTitle,
  disabled = false
}) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customizationDetails, setCustomizationDetails] = useState('')

  const handleSubmit = async () => {
    if (!user || !customizationDetails.trim()) return

    setLoading(true)
    try {
      const { data, error } = await commissionService.requestCustomization({
        artist_id: artistId,
        product_id: productId,
        customization_details: customizationDetails
      })

      if (error) throw new Error(error)

      toast({
        title: 'Request Sent',
        description: 'Your customization request has been sent to the artist',
      })

      setOpen(false)
      setCustomizationDetails('')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.id === artistId) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
          disabled={disabled}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Request Customization
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Request Customization
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Design: <span className="font-medium">{productTitle}</span></p>
          </div>
          
          <div>
            <Label htmlFor="customization">Describe your customization request</Label>
            <Textarea
              id="customization"
              value={customizationDetails}
              onChange={(e) => setCustomizationDetails(e.target.value)}
              placeholder="E.g., Change the color to blue, add my company logo, modify the text..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !customizationDetails.trim()}
              className="flex-1"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            The artist will review your request and may charge additional fees for customizations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CustomizationRequestButton
