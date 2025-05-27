import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Ruler, 
  Shirt, 
  Coffee, 
  ShoppingBag,
  Info,
  ArrowLeft,
  Download,
  Printer
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SizeGuide = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('tshirts')

  const sizeData = {
    tshirts: {
      title: 'T-Shirts & Polos',
      icon: <Shirt className="h-5 w-5" />,
      description: 'All measurements are in centimeters (cm)',
      sizes: [
        { size: 'XS', chest: '81-86', length: '66', shoulder: '41' },
        { size: 'S', chest: '86-91', length: '69', shoulder: '44' },
        { size: 'M', chest: '91-97', length: '72', shoulder: '47' },
        { size: 'L', chest: '97-102', length: '75', shoulder: '50' },
        { size: 'XL', chest: '102-107', length: '78', shoulder: '53' },
        { size: 'XXL', chest: '107-112', length: '81', shoulder: '56' },
        { size: 'XXXL', chest: '112-117', length: '84', shoulder: '59' }
      ],
      headers: ['Size', 'Chest', 'Length', 'Shoulder']
    },
    hoodies: {
      title: 'Hoodies & Sweatshirts',
      icon: <Shirt className="h-5 w-5" />,
      description: 'All measurements are in centimeters (cm)',
      sizes: [
        { size: 'XS', chest: '86-91', length: '68', sleeve: '58', shoulder: '43' },
        { size: 'S', chest: '91-97', length: '71', sleeve: '61', shoulder: '46' },
        { size: 'M', chest: '97-102', length: '74', sleeve: '64', shoulder: '49' },
        { size: 'L', chest: '102-107', length: '77', sleeve: '67', shoulder: '52' },
        { size: 'XL', chest: '107-112', length: '80', sleeve: '70', shoulder: '55' },
        { size: 'XXL', chest: '112-117', length: '83', sleeve: '73', shoulder: '58' },
        { size: 'XXXL', chest: '117-122', length: '86', sleeve: '76', shoulder: '61' }
      ],
      headers: ['Size', 'Chest', 'Length', 'Sleeve', 'Shoulder']
    },
    mugs: {
      title: 'Mugs & Drinkware',
      icon: <Coffee className="h-5 w-5" />,
      description: 'Capacity and dimensions',
      sizes: [
        { size: '11oz', capacity: '325ml', height: '9.5cm', diameter: '8.2cm' },
        { size: '15oz', capacity: '444ml', height: '11cm', diameter: '8.7cm' },
        { size: '20oz', capacity: '591ml', height: '12.5cm', diameter: '9.5cm' }
      ],
      headers: ['Size', 'Capacity', 'Height', 'Diameter']
    },
    bags: {
      title: 'Bags & Accessories',
      icon: <ShoppingBag className="h-5 w-5" />,
      description: 'Dimensions in centimeters (cm)',
      sizes: [
        { size: 'Tote Bag', width: '38cm', height: '42cm', depth: '10cm', handle: '25cm' },
        { size: 'Canvas Bag', width: '35cm', height: '40cm', depth: '8cm', handle: '30cm' },
        { size: 'Drawstring', width: '33cm', height: '40cm', depth: '0cm', handle: 'Rope' },
        { size: 'Backpack', width: '30cm', height: '40cm', depth: '15cm', handle: 'Straps' }
      ],
      headers: ['Type', 'Width', 'Height', 'Depth', 'Handle']
    }
  }

  const measurementTips = [
    {
      title: 'Chest Measurement',
      description: 'Measure around the fullest part of your chest, keeping the tape horizontal.'
    },
    {
      title: 'Length Measurement',
      description: 'Measure from the highest point of the shoulder to the bottom hem.'
    },
    {
      title: 'Shoulder Measurement',
      description: 'Measure from shoulder point to shoulder point across the back.'
    },
    {
      title: 'Sleeve Measurement',
      description: 'Measure from the shoulder seam to the end of the sleeve.'
    }
  ]

  const fitGuide = [
    {
      fit: 'Slim Fit',
      description: 'Close to body, tailored silhouette',
      recommendation: 'Choose your exact size or size down for tighter fit'
    },
    {
      fit: 'Regular Fit',
      description: 'Comfortable, not too tight or loose',
      recommendation: 'Choose your normal size'
    },
    {
      fit: 'Relaxed Fit',
      description: 'Loose and comfortable',
      recommendation: 'Choose your normal size or size up for looser fit'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Size Guide</h1>
              <p className="text-gray-600">
                Find the perfect fit for all our products
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print Guide
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ruler className="h-5 w-5 mr-2" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(sizeData).map(([key, data]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(key)}
                    >
                      {data.icon}
                      <span className="ml-2">{data.title}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Measurement Tips */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  How to Measure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {measurementTips.map((tip, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {tip.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    {sizeData[selectedCategory as keyof typeof sizeData].icon}
                    <span className="ml-2">
                      {sizeData[selectedCategory as keyof typeof sizeData].title}
                    </span>
                  </CardTitle>
                  <Badge variant="outline">
                    {sizeData[selectedCategory as keyof typeof sizeData].description}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Size Chart */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        {sizeData[selectedCategory as keyof typeof sizeData].headers.map((header, index) => (
                          <th key={index} className="text-left py-3 px-4 font-medium text-gray-900">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sizeData[selectedCategory as keyof typeof sizeData].sizes.map((size, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          {Object.values(size).map((value, valueIndex) => (
                            <td key={valueIndex} className="py-3 px-4 text-gray-700">
                              {valueIndex === 0 ? (
                                <Badge variant="outline" className="font-medium">
                                  {value}
                                </Badge>
                              ) : (
                                value
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Fit Guide for Clothing */}
                {(selectedCategory === 'tshirts' || selectedCategory === 'hoodies') && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fit Guide</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {fitGuide.map((fit, index) => (
                        <Card key={index} className="border-l-4 border-l-orange-500">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{fit.fit}</h4>
                            <p className="text-sm text-gray-600 mb-2">{fit.description}</p>
                            <p className="text-xs text-orange-600 font-medium">{fit.recommendation}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Important Notes</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• All measurements are approximate and may vary by ±1-2cm</li>
                    <li>• Sizes may vary slightly between different product styles</li>
                    <li>• For the best fit, compare with a similar garment you own</li>
                    <li>• When in doubt, size up for a more comfortable fit</li>
                    <li>• Contact our support team if you need help choosing the right size</li>
                  </ul>
                </div>

                {/* Size Conversion */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">International Size Conversion</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-medium">Kenya/UK</th>
                          <th className="text-left py-2 px-3 font-medium">US</th>
                          <th className="text-left py-2 px-3 font-medium">EU</th>
                          <th className="text-left py-2 px-3 font-medium">Chest (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-3">XS</td>
                          <td className="py-2 px-3">XS</td>
                          <td className="py-2 px-3">44</td>
                          <td className="py-2 px-3">81-86</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3">S</td>
                          <td className="py-2 px-3">S</td>
                          <td className="py-2 px-3">46</td>
                          <td className="py-2 px-3">86-91</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3">M</td>
                          <td className="py-2 px-3">M</td>
                          <td className="py-2 px-3">48</td>
                          <td className="py-2 px-3">91-97</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3">L</td>
                          <td className="py-2 px-3">L</td>
                          <td className="py-2 px-3">50</td>
                          <td className="py-2 px-3">97-102</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3">XL</td>
                          <td className="py-2 px-3">XL</td>
                          <td className="py-2 px-3">52</td>
                          <td className="py-2 px-3">102-107</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Support */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Still Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Our customer support team is here to help you find the perfect fit
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">
                Contact Support
              </Button>
              <Button>
                Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  )
}

export default SizeGuide
