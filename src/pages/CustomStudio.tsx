import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomRequestForm from '@/components/CustomRequestForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Users, 
  MessageSquare, 
  Zap, 
  Clock, 
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const CustomStudio = () => {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);

  const customOptions = [
    {
      title: "Platform Custom Design",
      description: "Get a custom design created by our expert team",
      icon: <Zap className="h-6 w-6" />,
      badge: "Admin Managed",
      badgeColor: "bg-blue-100 text-blue-800",
      features: [
        "Professional design team",
        "Fixed pricing quote",
        "Quality guarantee",
        "Fast turnaround"
      ],
      action: "Request Quote",
      requestType: "platform_managed"
    },
    {
      title: "Work with Artist",
      description: "Connect directly with talented artists for custom work",
      icon: <Users className="h-6 w-6" />,
      badge: "Artist Direct",
      badgeColor: "bg-purple-100 text-purple-800",
      features: [
        "Choose your artist",
        "Direct communication",
        "Negotiate pricing",
        "Unique artistic styles"
      ],
      action: "Find Artists",
      requestType: "artist_direct"
    }
  ];

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full">
                <Palette className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Custom Design Studio</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Bring your ideas to life with custom designs from our platform team or talented artists
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Custom Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {customOptions.map((option, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                    {option.icon}
                  </div>
                </div>
                <div className="flex justify-center mb-2">
                  <Badge className={option.badgeColor}>
                    {option.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <p className="text-gray-600">{option.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {option.requestType === 'platform_managed' ? (
                  <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        {option.action}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Request Custom Design</DialogTitle>
                      </DialogHeader>
                      <CustomRequestForm 
                        onSuccess={handleRequestSuccess}
                        onCancel={() => setShowRequestForm(false)}
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Link to="/artists">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      {option.action}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">How Custom Design Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  step: "1",
                  title: "Submit Request",
                  description: "Tell us about your design needs and budget",
                  icon: <MessageSquare className="h-6 w-6" />
                },
                {
                  step: "2", 
                  title: "Get Quote",
                  description: "Receive pricing and timeline from our team or artist",
                  icon: <Clock className="h-6 w-6" />
                },
                {
                  step: "3",
                  title: "Design Creation",
                  description: "Work with designer to create your perfect design",
                  icon: <Palette className="h-6 w-6" />
                },
                {
                  step: "4",
                  title: "Production",
                  description: "Once approved, we print on your chosen products",
                  icon: <Star className="h-6 w-6" />
                }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Existing Design Customization */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-4">Or Customize Existing Designs</CardTitle>
            <p className="text-gray-600">
              Browse our marketplace and request modifications to existing artist designs
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                Browse Marketplace
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default CustomStudio;
