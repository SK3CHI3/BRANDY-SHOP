
import React from 'react';
import { Search, User, Settings, Truck } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Browse & Discover",
      description: "Explore thousands of unique designs from talented Kenyan artists or search for exactly what you need."
    },
    {
      icon: <User className="h-8 w-8" />,
      title: "Choose Your Path",
      description: "Buy a ready-made design, customize an existing one, or commission a completely new creation."
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Personalize",
      description: "Use our design studio to add text, change colors, or work directly with artists for custom designs."
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Receive & Enjoy",
      description: "We handle printing and delivery. Track your order and receive your unique product within 3-5 days."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From inspiration to delivery, we make it simple to get custom apparel that tells your story
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full mb-4">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-4 border-purple-200 flex items-center justify-center text-sm font-bold text-purple-600">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-transparent transform -translate-x-8" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
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
