
import React from 'react';
import { Search, User, Settings, Truck } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Browse & Discover",
      description: "Explore thousands of unique designs from talented Kenyan artists or search for exactly what you need.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <User className="h-8 w-8" />,
      title: "Choose Your Path",
      description: "Buy a ready-made design, customize an existing one, or commission a completely new creation.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Personalize",
      description: "Use our design studio to add text, change colors, or work directly with artists for custom designs.",
      gradient: "from-pink-500 to-purple-500"
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Receive & Enjoy",
      description: "We handle printing and delivery. Track your order and receive your unique product within 3-5 days.",
      gradient: "from-purple-500 to-orange-500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From inspiration to delivery, we make it simple to get custom apparel that tells your story
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${step.gradient} text-white rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full border-4 border-orange-200 flex items-center justify-center text-sm font-bold text-orange-600 shadow-md">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-1 bg-gradient-to-r from-orange-300 via-red-300 to-transparent transform -translate-x-10" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
