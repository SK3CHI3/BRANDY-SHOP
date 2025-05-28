import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import {
  Smartphone,
  CheckCircle,
  XCircle,
  Eye,
  Touch,
  Type,
  Layout,
  Navigation,
  ShoppingCart,
  Upload,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Heart,
  Star,
  User,
  Settings,
  Menu,
  X
} from 'lucide-react'

const MobileTest = () => {
  const { user, profile } = useAuth()
  const { addToCart } = useCart()
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [testInput, setTestInput] = useState('')
  const [testSelect, setTestSelect] = useState('')
  const [testTextarea, setTestTextarea] = useState('')

  const markTest = (testId: string, passed: boolean) => {
    setTestResults(prev => ({ ...prev, [testId]: passed }))
    toast({
      title: passed ? 'Test Passed' : 'Test Failed',
      description: `${testId}: ${passed ? 'Meets mobile standards' : 'Needs improvement'}`,
      variant: passed ? 'default' : 'destructive',
    })
  }

  const TestSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )

  const TestItem = ({ 
    id, 
    label, 
    children, 
    requirement 
  }: { 
    id: string; 
    label: string; 
    children: React.ReactNode; 
    requirement: string;
  }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{label}</Label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => markTest(id, true)}
            className="min-h-[44px] min-w-[44px]"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => markTest(id, false)}
            className="min-h-[44px] min-w-[44px]"
          >
            <XCircle className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-600">{requirement}</p>
      <div className="bg-gray-50 p-3 rounded">
        {children}
      </div>
      {testResults[id] !== undefined && (
        <Badge variant={testResults[id] ? 'default' : 'destructive'}>
          {testResults[id] ? 'PASSED' : 'FAILED'}
        </Badge>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            📱 Mobile Responsiveness Test Suite
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Comprehensive testing for mobile accessibility and responsiveness standards
          </p>
        </div>

        {/* Touch Target Tests */}
        <TestSection title="Touch Target Standards (44px minimum)">
          <TestItem
            id="button-touch-targets"
            label="Button Touch Targets"
            requirement="All interactive buttons must be at least 44px in height and width"
          >
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="min-h-[44px]">Primary Button</Button>
              <Button variant="outline" size="sm" className="min-h-[44px]">Outline Button</Button>
              <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px]">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" className="min-h-[44px] min-w-[44px]">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TestItem>

          <TestItem
            id="icon-button-targets"
            label="Icon Button Touch Targets"
            requirement="Icon-only buttons must meet 44px minimum touch target"
          >
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </TestItem>
        </TestSection>

        {/* Form Input Tests */}
        <TestSection title="Form Input Standards (16px+ font, 48px+ height)">
          <TestItem
            id="text-input-standards"
            label="Text Input Fields"
            requirement="Input fields must be 48px+ height with 16px+ font to prevent zoom"
          >
            <div className="space-y-3">
              <Input
                placeholder="Standard text input"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="min-h-[48px] text-base"
                style={{ fontSize: '16px' }}
              />
              <Input
                type="email"
                placeholder="Email input"
                className="min-h-[48px] text-base"
                style={{ fontSize: '16px' }}
              />
              <Input
                type="password"
                placeholder="Password input"
                className="min-h-[48px] text-base"
                style={{ fontSize: '16px' }}
              />
            </div>
          </TestItem>

          <TestItem
            id="select-dropdown-standards"
            label="Select Dropdowns"
            requirement="Select elements must be 48px+ height with proper touch targets"
          >
            <Select value={testSelect} onValueChange={setTestSelect}>
              <SelectTrigger className="min-h-[48px] text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1" className="min-h-[44px]">Option 1</SelectItem>
                <SelectItem value="option2" className="min-h-[44px]">Option 2</SelectItem>
                <SelectItem value="option3" className="min-h-[44px]">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </TestItem>

          <TestItem
            id="textarea-standards"
            label="Textarea Fields"
            requirement="Textarea must have 16px+ font and adequate height"
          >
            <Textarea
              placeholder="Enter your message here..."
              value={testTextarea}
              onChange={(e) => setTestTextarea(e.target.value)}
              className="min-h-[120px] text-base resize-none"
              style={{ fontSize: '16px' }}
              rows={4}
            />
          </TestItem>
        </TestSection>

        {/* Navigation Tests */}
        <TestSection title="Mobile Navigation Standards">
          <TestItem
            id="mobile-menu-visibility"
            label="Mobile Menu Visibility"
            requirement="Mobile menu should be easily accessible and visible"
          >
            <div className="flex items-center gap-4">
              <Button variant="outline" className="min-h-[44px] min-w-[44px]">
                <Menu className="h-6 w-6" />
              </Button>
              <span className="text-sm">Hamburger menu button (tap to test)</span>
            </div>
          </TestItem>

          <TestItem
            id="mobile-menu-scroll-containment"
            label="Mobile Menu Scroll Containment"
            requirement="Mobile menu should prevent background page scrolling and contain scroll within menu"
          >
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Test Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Open the mobile menu (hamburger button in header)</li>
                  <li>Try scrolling within the mobile menu</li>
                  <li>Verify that the background page does not scroll</li>
                  <li>Check that menu has proper scroll containment</li>
                  <li>Close menu and verify normal page scrolling resumes</li>
                </ol>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-green-800">
                  ✅ Expected: Menu scrolls independently, background stays fixed
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <p className="text-sm text-red-800">
                  ❌ Issue: Background page scrolls when scrolling in menu
                </p>
              </div>
            </div>
          </TestItem>

          <TestItem
            id="mobile-menu-backdrop"
            label="Mobile Menu Backdrop & Overlay"
            requirement="Mobile menu should have proper backdrop overlay and z-index layering"
          >
            <div className="space-y-3">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Test Instructions:</h4>
                <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
                  <li>Open the mobile menu</li>
                  <li>Verify dark backdrop overlay appears behind menu</li>
                  <li>Tap on backdrop to close menu</li>
                  <li>Press Escape key to close menu</li>
                  <li>Check that menu appears above all other content</li>
                </ol>
              </div>
            </div>
          </TestItem>

          <TestItem
            id="navigation-links"
            label="Navigation Link Touch Targets"
            requirement="All navigation links must be easily tappable"
          >
            <div className="space-y-2">
              <div className="block px-4 py-4 rounded-lg bg-orange-100 text-orange-700 min-h-[48px] flex items-center">
                Marketplace
              </div>
              <div className="block px-4 py-4 rounded-lg hover:bg-orange-50 min-h-[48px] flex items-center">
                Custom Studio
              </div>
              <div className="block px-4 py-4 rounded-lg hover:bg-orange-50 min-h-[48px] flex items-center">
                Artists
              </div>
            </div>
          </TestItem>

          <TestItem
            id="mobile-menu-accessibility"
            label="Mobile Menu Accessibility"
            requirement="Mobile menu should support keyboard navigation and screen readers"
          >
            <div className="space-y-3">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-2">Accessibility Features:</h4>
                <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
                  <li>ARIA labels for menu button and navigation</li>
                  <li>Proper focus management</li>
                  <li>Keyboard navigation support (Tab, Escape)</li>
                  <li>Screen reader announcements</li>
                  <li>High contrast mode support</li>
                </ul>
              </div>
            </div>
          </TestItem>
        </TestSection>

        {/* Layout Tests */}
        <TestSection title="Responsive Layout Standards">
          <TestItem
            id="horizontal-scrolling"
            label="No Horizontal Scrolling"
            requirement="Content must fit within viewport without horizontal scrolling"
          >
            <div className="bg-blue-100 p-4 rounded">
              <p className="text-sm">
                This content should fit within the screen width without causing horizontal scrolling.
                Test by resizing your browser window or viewing on different mobile devices.
              </p>
            </div>
          </TestItem>

          <TestItem
            id="responsive-breakpoints"
            label="Responsive Breakpoints"
            requirement="Layout should adapt properly at 320px, 375px, and 768px breakpoints"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-green-100 p-3 rounded text-center">320px+</div>
              <div className="bg-yellow-100 p-3 rounded text-center">375px+</div>
              <div className="bg-purple-100 p-3 rounded text-center">768px+</div>
            </div>
          </TestItem>
        </TestSection>

        {/* Interactive Elements Tests */}
        <TestSection title="Interactive Elements">
          <TestItem
            id="cart-functionality"
            label="Cart Interaction"
            requirement="Cart buttons should be easily tappable and functional"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] min-w-[44px]"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value="1"
                className="w-16 text-center min-h-[44px] text-base"
                style={{ fontSize: '16px' }}
              />
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] min-w-[44px]"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                className="min-h-[44px]"
                onClick={() => toast({ title: 'Added to cart!', description: 'Test item added successfully' })}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </TestItem>

          <TestItem
            id="search-functionality"
            label="Search Interface"
            requirement="Search input and filters should be mobile-friendly"
          >
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search designs, artists..."
                  className="pl-10 min-h-[48px] text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="min-h-[48px]">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TestItem>
        </TestSection>

        {/* Test Results Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Test Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Passed Tests</h4>
                <div className="space-y-1">
                  {Object.entries(testResults)
                    .filter(([_, passed]) => passed)
                    .map(([testId]) => (
                      <Badge key={testId} variant="default" className="mr-2 mb-1">
                        {testId}
                      </Badge>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Failed Tests</h4>
                <div className="space-y-1">
                  {Object.entries(testResults)
                    .filter(([_, passed]) => !passed)
                    .map(([testId]) => (
                      <Badge key={testId} variant="destructive" className="mr-2 mb-1">
                        {testId}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Testing Instructions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Test each element by tapping/clicking</li>
                <li>• Verify touch targets are at least 44px</li>
                <li>• Check that inputs don't cause mobile zoom</li>
                <li>• Ensure no horizontal scrolling occurs</li>
                <li>• Test on multiple screen sizes (320px, 375px, 768px)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}

export default MobileTest
