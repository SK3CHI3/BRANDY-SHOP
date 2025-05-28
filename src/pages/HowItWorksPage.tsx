
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
  Play,
  Percent,
  DollarSign,
  Users2
} from 'lucide-react'

const HowItWorksPage = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Browse & Discover",
      description: "Explore thousands of unique designs from talented Kenyan artists with transparent commission rates.",
      gradient: "from-orange-500 to-red-500",
      details: [
        "Browse by category (T-shirts, Hoodies, Mugs, Bags)",
        "Filter by price, artist commission rate, and ratings",
        "Use advanced search to find specific designs",
        "View detailed product information and artist profiles"
      ]
    },
    {
      icon: <User className="h-8 w-8" />,
      title: "Choose Your Path",
      description: "Multiple ways to get what you want: marketplace purchases, platform requests, or direct artist collaboration.",
      gradient: "from-red-500 to-pink-500",
      details: [
        "Purchase ready-made designs with automatic artist commission",
        "Submit platform requests for admin-managed quotes",
        "Request custom artwork directly from specific artists",
        "Negotiate pricing independently with artists"
      ]
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Connect & Create",
      description: "Use our messaging system to communicate with artists or submit platform requests for custom quotes.",
      gradient: "from-pink-500 to-purple-500",
      details: [
        "Direct messaging with artists for negotiations",
        "Platform request system for admin-managed projects",
        "Real-time collaboration on design requirements",
        "Secure communication and file sharing"
      ]
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Print & Deliver",
      description: "Professional printing and delivery with automatic commission tracking for artists.",
      gradient: "from-purple-500 to-orange-500",
      details: [
        "High-quality printing on premium materials",
        "Automatic commission calculation and tracking",
        "Real-time order tracking and updates",
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
      description: "Explore our artist marketplace",
      icon: <Search className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Choose Path",
      description: "Marketplace, platform request, or artist direct",
      icon: <ArrowRight className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Order",
      description: "Purchase or negotiate pricing",
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
      title: "Set Commission",
      description: "Configure your rates (min 7.7%)",
      icon: <Percent className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Upload Designs",
      description: "List your artwork in marketplace",
      icon: <Palette className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Connect",
      description: "Message with customers directly",
      icon: <MessageCircle className="h-5 w-5" />
    },
    {
      step: 5,
      title: "Earn",
      description: "Automatic commission on every sale",
      icon: <DollarSign className="h-5 w-5" />
    }
  ]

  const pricingModels = [
    {
      title: "Marketplace Sales",
      description: "Ready-made designs with standard commission",
      icon: <ShoppingCart className="h-6 w-6 text-blue-500" />,
      features: [
        "Artist sets product pricing",
        "Minimum 7.7% platform commission",
        "Artist keeps 92.3% of sale price",
        "Automatic commission calculation"
      ],
      color: "blue"
    },
    {
      title: "Platform Requests",
      description: "Admin-managed custom projects",
      icon: <Settings className="h-6 w-6 text-green-500" />,
      features: [
        "Admin provides complete quote",
        "No artist commission involved",
        "Direct platform revenue",
        "Professional project management"
      ],
      color: "green"
    },
    {
      title: "Artist Direct",
      description: "Customer-artist negotiations",
      icon: <Users2 className="h-6 w-6 text-purple-500" />,
      features: [
        "Independent price negotiations",
        "Artists set their own rates",
        "Platform handles fulfillment only",
        "Direct artist-customer relationships"
      ],
      color: "purple"
    }
  ]

  const features = [
    {
      title: "Fair Commissions",
      description: "Artists keep 92.3% with transparent 7.7% platform fee",
      icon: <Percent className="h-6 w-6 text-yellow-500" />
    },
    {
      title: "Multiple Pricing Models",
      description: "Marketplace, platform requests, and direct negotiations",
      icon: <DollarSign className="h-6 w-6 text-blue-500" />
    },
    {
      title: "Artist Autonomy",
      description: "Artists control their pricing and customer relationships",
      icon: <Star className="h-6 w-6 text-purple-500" />
    },
    {
      title: "Fast Delivery",
      description: "3-5 business days delivery across Kenya",
      icon: <Truck className="h-6 w-6 text-green-500" />
    },
    {
      title: "Secure Messaging",
      description: "Built-in communication system for all interactions",
      icon: <MessageCircle className="h-6 w-6 text-orange-500" />
    },
    {
      title: "Quality Guarantee",
      description: "Premium materials and printing quality guaranteed",
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
            A fair marketplace that empowers Kenyan artists while giving customers multiple ways to get custom designs
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
              Simple Steps, Fair Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process supports artists while giving customers flexible options
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

        {/* Pricing Models */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Three Ways to Work</h2>
            <p className="text-gray-600">Different approaches for different needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {pricingModels.map((model, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {model.icon}
                    {model.title}
                  </CardTitle>
                  <p className="text-gray-600">{model.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {model.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
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
              <>
                <div key={index} className="flex flex-col items-center text-center">
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
              </>
            ))}
          </div>
        </section>

        {/* Artist Journey */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Artists</h2>
            <p className="text-gray-600">Join our platform and start earning fair commissions</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6">
            {artistJourney.map((item, index) => (
              <>
                <div key={index} className="flex flex-col items-center text-center">
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
              </>
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
            <p className="text-gray-600">Fair, transparent, and artist-focused marketplace</p>
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
                <CardTitle className="text-lg">How do artist commissions work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Artists keep 92.3% of marketplace sales, with only 7.7% going to platform operations. For direct negotiations, artists set their own pricing.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's the difference between platform requests and artist direct?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Platform requests are quoted by our admin team with no artist commission. Artist direct involves negotiations between customers and artists.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I modify existing artist designs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You need explicit permission from the artist to modify their designs. You can request customizations through our messaging system.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How long does delivery take?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Standard delivery takes 3-5 business days within Kenya. We handle all printing and shipping professionally.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join a fair marketplace that values both artists and customers</p>
          <div className="flex justify-center gap-4">
            <Link to="/marketplace">
              <Button size="lg" variant="secondary">
                Browse Marketplace
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
