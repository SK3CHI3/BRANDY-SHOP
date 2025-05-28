import React from 'react'
import { Link } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  User, 
  Settings, 
  Truck, 
  Palette,
  ShoppingCart,
  CreditCard,
  Package,
  Star,
  MessageCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react'

const HowItWorksPage = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Browse & Discover",
      description: "Explore thousands of unique designs from talented Kenyan artists or search for exactly what you need.",
      gradient: "from-orange-500 to-red-500",
      details: [
        "Browse by category (T-shirts, Hoodies, Mugs, Bags)",
        "Filter by price, rating, and artist",
        "Use advanced search to find specific designs",
        "View detailed product information and reviews"
      ]
    },
    {
      icon: <User className="h-8 w-8" />,
      title: "Choose Your Path",
      description: "Buy a ready-made design, customize an existing one, or commission a completely new creation.",
      gradient: "from-red-500 to-pink-500",
      details: [
        "Purchase ready-made designs instantly",
        "Customize existing designs with our studio",
        "Request custom artwork from artists",
        "Collaborate directly with artists on your vision"
      ]
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Personalize",
      description: "Use our design studio to add text, change colors, or work directly with artists for custom designs.",
      gradient: "from-pink-500 to-purple-500",
      details: [
        "Add custom text and choose fonts",
        "Change colors and adjust design elements",
        "Preview your design in real-time",
        "Save and share your customizations"
      ]
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Receive & Enjoy",
      description: "We handle printing and delivery. Track your order and receive your unique product within 3-5 days.",
      gradient: "from-purple-500 to-orange-500",
      details: [
        "High-quality printing on premium materials",
        "Careful packaging and quality control",
        "Real-time order tracking",
        "Fast delivery across Kenya (3-5 business days)"
      ]
    }
  ]

  const customerJourney = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create your account in seconds",
      icon: <User className="h-5 w-5" />
    },
    {
      step: 2,
      title: "Browse",
      description: "Explore our marketplace",
      icon: <Search className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Customize",
      description: "Make it uniquely yours",
      icon: <Palette className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Order",
      description: "Add to cart and checkout",
      icon: <ShoppingCart className="h-5 w-5" />
    },
    {
      step: 5,
      title: "Pay",
      description: "Secure payment via M-Pesa or card",
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      step: 6,
      title: "Receive",
      description: "Get your custom product delivered",
      icon: <Package className="h-5 w-5" />
    }
  ]

  const artistJourney = [
    {
      step: 1,
      title: "Apply",
      description: "Submit your portfolio for review",
      icon: <User className="h-5 w-5" />
    },
    {
      step: 2,
      title: "Get Approved",
      description: "Our team reviews your application",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Upload Designs",
      description: "Add your artwork to the marketplace",
      icon: <Palette className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Earn Money",
      description: "Get paid for every sale",
      icon: <Star className="h-5 w-5" />
    },
    {
      step: 5,
      title: "Grow",
      description: "Build your brand and following",
      icon: <ArrowRight className="h-5 w-5" />
    }
  ]

  const features = [
    {
      title: "Quality Guarantee",
      description: "Premium materials and printing quality guaranteed",
      icon: <Star className="h-6 w-6 text-yellow-500" />
    },
    {
      title: "Fast Delivery",
      description: "3-5 business days delivery across Kenya",
      icon: <Truck className="h-6 w-6 text-blue-500" />
    },
    {
      title: "Custom Designs",
      description: "Work directly with artists for unique creations",
      icon: <Palette className="h-6 w-6 text-purple-500" />
    },
    {
      title: "Secure Payments",
      description: "M-Pesa and card payments with full security",
      icon: <CreditCard className="h-6 w-6 text-green-500" />
    },
    {
      title: "24/7 Support",
      description: "Customer support whenever you need help",
      icon: <MessageCircle className="h-6 w-6 text-orange-500" />
    },
    {
      title: "Easy Returns",
      description: "Hassle-free returns within 30 days",
      icon: <CheckCircle className="h-6 w-6 text-red-500" />
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">How Brandy Works</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            From inspiration to delivery, we make it simple to get custom apparel that tells your story
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-orange-600">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Steps */}
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Simple Steps to Custom Apparel
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes it easy to get exactly what you want
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-8">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${step.gradient} text-white rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full border-4 border-orange-200 flex items-center justify-center text-sm font-bold text-orange-600 shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-6">{step.description}</p>
                  
                  <ul className="text-sm text-gray-500 space-y-2 text-left">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Customer Journey */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Customer Journey</h2>
            <p className="text-gray-600">From browsing to receiving your custom product</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4">
            {customerJourney.map((item, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                    {item.icon}
                  </div>
                  <Badge variant="outline" className="mb-2">Step {item.step}</Badge>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-600 max-w-20">{item.description}</p>
                </div>
                {index < customerJourney.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Artist Journey */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Artists</h2>
            <p className="text-gray-600">Join our platform and start earning from your creativity</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6">
            {artistJourney.map((item, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    {item.icon}
                  </div>
                  <Badge variant="outline" className="mb-2">Step {item.step}</Badge>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-600 max-w-24">{item.description}</p>
                </div>
                {index < artistJourney.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/artists">
              <Button size="lg">
                <Palette className="h-5 w-5 mr-2" />
                Join as Artist
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Brandy?</h2>
            <p className="text-gray-600">We're committed to providing the best experience for both customers and artists</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How long does delivery take?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Standard delivery takes 3-5 business days within Kenya. Express delivery options are available for faster shipping.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I return my order?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, we offer hassle-free returns within 30 days of delivery if you're not satisfied with your order.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do custom designs work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can either customize existing designs using our studio or request completely new artwork from our artists.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept M-Pesa, credit/debit cards, and bank transfers for your convenience.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of satisfied customers and talented artists</p>
          <div className="flex justify-center gap-4">
            <Link to="/marketplace">
              <Button size="lg" variant="secondary">
                Start Shopping
              </Button>
            </Link>
            <Link to="/artists">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-orange-600">
                Become an Artist
              </Button>
            </Link>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  )
}

export default HowItWorksPage
