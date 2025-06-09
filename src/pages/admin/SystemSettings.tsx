import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Mail,
  CreditCard,
  Globe,
  Bell,
  Database,
  Server,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    supportEmail: string
    maintenanceMode: boolean
    allowRegistration: boolean
  }
  payments: {
    mpesaEnabled: boolean
    mpesaShortcode: string
    mpesaPasskey: string
    cardPaymentsEnabled: boolean
    platformFeePercentage: number

  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    orderUpdates: boolean
    marketingEmails: boolean
  }
  security: {
    requireEmailVerification: boolean
    twoFactorAuth: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
  }
  features: {
    artistVerification: boolean
    productReviews: boolean
    wishlist: boolean
    guestCheckout: boolean
    multipleImages: boolean
  }
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'BRANDY-SHOP',
      siteDescription: 'Kenyan Creative Marketplace connecting artists with customers for custom apparel and branded products',
      contactEmail: 'contact@brandyshop.com',
      supportEmail: 'support@brandyshop.com',
      maintenanceMode: false,
      allowRegistration: true
    },
    payments: {
      mpesaEnabled: true,
      mpesaShortcode: '174379',
      mpesaPasskey: '••••••••••••••••',
      cardPaymentsEnabled: true,
      platformFeePercentage: 15,

    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderUpdates: true,
      marketingEmails: false
    },
    security: {
      requireEmailVerification: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    },
    features: {
      artistVerification: true,
      productReviews: true,
      wishlist: true,
      guestCheckout: false,
      multipleImages: true
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [showPasskey, setShowPasskey] = useState(false)

  const updateSettings = async (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Settings Saved',
        description: 'System settings have been updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return
    }

    try {
      // Reset to default values
      toast({
        title: 'Settings Reset',
        description: 'All settings have been reset to default values',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset settings',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            System Settings
          </h1>
          <p className="text-gray-600">Configure platform settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={loading} className="bg-red-600 hover:bg-red-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Site Name</label>
              <Input
                value={settings.general.siteName}
                onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Email</label>
              <Input
                type="email"
                value={settings.general.contactEmail}
                onChange={(e) => updateSettings('general', 'contactEmail', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Site Description</label>
            <Textarea
              value={settings.general.siteDescription}
              onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) => updateSettings('general', 'supportEmail', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Maintenance Mode</label>
                <p className="text-xs text-gray-500">Temporarily disable the site for maintenance</p>
              </div>
              <Switch
                checked={settings.general.maintenanceMode}
                onCheckedChange={(checked) => updateSettings('general', 'maintenanceMode', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Allow New Registrations</label>
                <p className="text-xs text-gray-500">Allow new users to register accounts</p>
              </div>
              <Switch
                checked={settings.general.allowRegistration}
                onCheckedChange={(checked) => updateSettings('general', 'allowRegistration', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Platform Fee (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.payments.platformFeePercentage}
                onChange={(e) => updateSettings('payments', 'platformFeePercentage', Number(e.target.value))}
              />
            </div>

          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">M-Pesa Payments</label>
                <p className="text-xs text-gray-500">Enable M-Pesa payment integration</p>
              </div>
              <Switch
                checked={settings.payments.mpesaEnabled}
                onCheckedChange={(checked) => updateSettings('payments', 'mpesaEnabled', checked)}
              />
            </div>

            {settings.payments.mpesaEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="text-sm font-medium">M-Pesa Shortcode</label>
                  <Input
                    value={settings.payments.mpesaShortcode}
                    onChange={(e) => updateSettings('payments', 'mpesaShortcode', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">M-Pesa Passkey</label>
                  <div className="relative">
                    <Input
                      type={showPasskey ? 'text' : 'password'}
                      value={settings.payments.mpesaPasskey}
                      onChange={(e) => updateSettings('payments', 'mpesaPasskey', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasskey(!showPasskey)}
                    >
                      {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Card Payments</label>
                <p className="text-xs text-gray-500">Enable credit/debit card payments</p>
              </div>
              <Switch
                checked={settings.payments.cardPaymentsEnabled}
                onCheckedChange={(checked) => updateSettings('payments', 'cardPaymentsEnabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Session Timeout (minutes)</label>
              <Input
                type="number"
                min="5"
                max="1440"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSettings('security', 'sessionTimeout', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Login Attempts</label>
              <Input
                type="number"
                min="3"
                max="10"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSettings('security', 'maxLoginAttempts', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Min Password Length</label>
              <Input
                type="number"
                min="6"
                max="20"
                value={settings.security.passwordMinLength}
                onChange={(e) => updateSettings('security', 'passwordMinLength', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Require Email Verification</label>
                <p className="text-xs text-gray-500">Users must verify email before accessing account</p>
              </div>
              <Switch
                checked={settings.security.requireEmailVerification}
                onCheckedChange={(checked) => updateSettings('security', 'requireEmailVerification', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Two-Factor Authentication</label>
                <p className="text-xs text-gray-500">Enable 2FA for enhanced security</p>
              </div>
              <Switch
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) => updateSettings('security', 'twoFactorAuth', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Artist Verification</label>
                <p className="text-xs text-gray-500">Require admin approval for new artists</p>
              </div>
              <Switch
                checked={settings.features.artistVerification}
                onCheckedChange={(checked) => updateSettings('features', 'artistVerification', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Product Reviews</label>
                <p className="text-xs text-gray-500">Allow customers to review products</p>
              </div>
              <Switch
                checked={settings.features.productReviews}
                onCheckedChange={(checked) => updateSettings('features', 'productReviews', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Wishlist Feature</label>
                <p className="text-xs text-gray-500">Allow users to save products to wishlist</p>
              </div>
              <Switch
                checked={settings.features.wishlist}
                onCheckedChange={(checked) => updateSettings('features', 'wishlist', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Guest Checkout</label>
                <p className="text-xs text-gray-500">Allow purchases without account registration</p>
              </div>
              <Switch
                checked={settings.features.guestCheckout}
                onCheckedChange={(checked) => updateSettings('features', 'guestCheckout', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Multiple Product Images</label>
                <p className="text-xs text-gray-500">Allow multiple images per product</p>
              </div>
              <Switch
                checked={settings.features.multipleImages}
                onCheckedChange={(checked) => updateSettings('features', 'multipleImages', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Email Notifications</label>
                <p className="text-xs text-gray-500">Send notifications via email</p>
              </div>
              <Switch
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">SMS Notifications</label>
                <p className="text-xs text-gray-500">Send notifications via SMS</p>
              </div>
              <Switch
                checked={settings.notifications.smsNotifications}
                onCheckedChange={(checked) => updateSettings('notifications', 'smsNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Order Updates</label>
                <p className="text-xs text-gray-500">Notify users about order status changes</p>
              </div>
              <Switch
                checked={settings.notifications.orderUpdates}
                onCheckedChange={(checked) => updateSettings('notifications', 'orderUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Marketing Emails</label>
                <p className="text-xs text-gray-500">Send promotional and marketing emails</p>
              </div>
              <Switch
                checked={settings.notifications.marketingEmails}
                onCheckedChange={(checked) => updateSettings('notifications', 'marketingEmails', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-gray-500">Connected</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Payment Gateway</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Email Service</div>
                <div className="text-sm text-gray-500">Operational</div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SystemSettings
