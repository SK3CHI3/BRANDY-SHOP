import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Hand,
  Type,
  Navigation,
  Image,
  MousePointer
} from 'lucide-react'

interface TestResult {
  name: string
  passed: boolean
  details: string
  category: 'touch' | 'text' | 'layout' | 'navigation' | 'images'
}

const MobileTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [testing, setTesting] = useState(false)

  // Detect current breakpoint
  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth
      if (width < 768) {
        setCurrentBreakpoint('mobile')
      } else if (width < 1024) {
        setCurrentBreakpoint('tablet')
      } else {
        setCurrentBreakpoint('desktop')
      }
    }

    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [])

  const runMobileTests = async () => {
    setTesting(true)
    const results: TestResult[] = []

    // Test 1: Touch Target Sizes
    const buttons = document.querySelectorAll('button, a[role="button"], [role="button"]')
    let touchTargetsPassed = 0
    buttons.forEach(button => {
      const rect = button.getBoundingClientRect()
      if (rect.width >= 44 && rect.height >= 44) {
        touchTargetsPassed++
      }
    })
    
    results.push({
      name: 'Touch Target Sizes',
      passed: touchTargetsPassed / buttons.length > 0.8,
      details: `${touchTargetsPassed}/${buttons.length} buttons meet 44px minimum`,
      category: 'touch'
    })

    // Test 2: Font Sizes
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')
    let readableFontsPassed = 0
    textElements.forEach(element => {
      const fontSize = parseFloat(window.getComputedStyle(element).fontSize)
      if (fontSize >= 16) {
        readableFontsPassed++
      }
    })

    results.push({
      name: 'Readable Font Sizes',
      passed: readableFontsPassed / textElements.length > 0.7,
      details: `${readableFontsPassed}/${textElements.length} elements have 16px+ font`,
      category: 'text'
    })

    // Test 3: Horizontal Scrolling
    const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth
    results.push({
      name: 'No Horizontal Scrolling',
      passed: !hasHorizontalScroll,
      details: hasHorizontalScroll ? 'Page has horizontal scroll' : 'No horizontal scroll detected',
      category: 'layout'
    })

    // Test 4: Mobile Navigation
    const mobileMenuButton = document.querySelector('[data-mobile-menu], .lg\\:hidden button')
    const mobileMenuVisible = window.innerWidth < 1024 ? !!mobileMenuButton : true
    results.push({
      name: 'Mobile Navigation',
      passed: mobileMenuVisible,
      details: mobileMenuVisible ? 'Mobile menu available' : 'Mobile menu not found',
      category: 'navigation'
    })

    // Test 5: Image Responsiveness
    const images = document.querySelectorAll('img')
    let responsiveImagesPassed = 0
    images.forEach(img => {
      const style = window.getComputedStyle(img)
      if (style.maxWidth === '100%' || style.width === '100%') {
        responsiveImagesPassed++
      }
    })

    results.push({
      name: 'Responsive Images',
      passed: responsiveImagesPassed / images.length > 0.8,
      details: `${responsiveImagesPassed}/${images.length} images are responsive`,
      category: 'images'
    })

    // Test 6: Form Input Sizes
    const inputs = document.querySelectorAll('input, textarea, select')
    let accessibleInputsPassed = 0
    inputs.forEach(input => {
      const rect = input.getBoundingClientRect()
      if (rect.height >= 44) {
        accessibleInputsPassed++
      }
    })

    results.push({
      name: 'Form Input Accessibility',
      passed: accessibleInputsPassed / inputs.length > 0.9,
      details: `${accessibleInputsPassed}/${inputs.length} inputs meet height requirements`,
      category: 'touch'
    })

    setTestResults(results)
    setTesting(false)
  }

  const getBreakpointIcon = (breakpoint: string) => {
    switch (breakpoint) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'tablet': return <Tablet className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
      default: return <Smartphone className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'touch': return <Hand className="h-4 w-4" />
      case 'text': return <Type className="h-4 w-4" />
      case 'layout': return <Eye className="h-4 w-4" />
      case 'navigation': return <Navigation className="h-4 w-4" />
      case 'images': return <Image className="h-4 w-4" />
      default: return <MousePointer className="h-4 w-4" />
    }
  }

  const passedTests = testResults.filter(test => test.passed).length
  const totalTests = testResults.length

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Responsiveness Test
          </CardTitle>
          <div className="flex items-center gap-2">
            {getBreakpointIcon(currentBreakpoint)}
            <Badge variant="outline" className="capitalize">
              {currentBreakpoint}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={runMobileTests} 
            disabled={testing}
            className="min-h-[48px]"
          >
            {testing ? 'Testing...' : 'Run Mobile Tests'}
          </Button>
          
          {testResults.length > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {passedTests}/{totalTests}
              </div>
              <div className="text-sm text-gray-600">Tests Passing</div>
            </div>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Test Results</h3>
            
            {testResults.map((test, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(test.category)}
                  <div>
                    <div className="font-medium text-sm">{test.name}</div>
                    <div className="text-xs text-gray-600">{test.details}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {test.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Badge 
                    variant={test.passed ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {test.passed ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Mobile Optimization Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Touch targets should be at least 44px × 44px</li>
            <li>• Text should be at least 16px for readability</li>
            <li>• No horizontal scrolling on mobile devices</li>
            <li>• Images should be responsive and scale properly</li>
            <li>• Navigation should be touch-friendly on mobile</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default MobileTestSuite
