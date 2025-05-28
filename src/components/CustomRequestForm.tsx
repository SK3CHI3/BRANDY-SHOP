
import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { commissionService } from '@/services/commissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Calendar, DollarSign, MessageSquare, Palette } from 'lucide-react'

interface CustomRequestFormProps {
  artistId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

const CustomRequestForm: React.FC<CustomRequestFormProps> = ({ 
  artistId, 
  onSuccess, 
  onCancel 
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
    request_type: artistId ? 'artist_direct' : 'platform_managed'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const requestData = {
        artist_id: artistId,
        title: formData.title,
        description: formData.description,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : undefined,
        deadline: formData.deadline || undefined,
        request_type: formData.request_type as 'artist_direct' | 'platform_managed'
      }

      const { data, error } = await commissionService.createCustomRequest(requestData)

      if (error) throw new Error(error)

      toast({
        title: 'Request Submitted',
        description: artistId 
          ? 'Your custom design request has been sent to the artist'
          : 'Your request has been submitted to our team',
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit request',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Project Title
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Custom Logo Design for Restaurant"
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Project Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your design requirements, style preferences, colors, etc."
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budget_min" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Min Budget (KSh)
            </Label>
            <Input
              id="budget_min"
              type="number"
              value={formData.budget_min}
              onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
              placeholder="2000"
            />
          </div>
          <div>
            <Label htmlFor="budget_max">Max Budget (KSh)</Label>
            <Input
              id="budget_max"
              type="number"
              value={formData.budget_max}
              onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value }))}
              placeholder="5000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="deadline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Deadline (Optional)
          </Label>
          <Input
            id="deadline"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {!artistId && (
          <div>
            <Label htmlFor="request_type">Request Type</Label>
            <Select 
              value={formData.request_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, request_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform_managed">Platform Managed (Admin Quote)</SelectItem>
                <SelectItem value="artist_direct">Find Artist for Me</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default CustomRequestForm
