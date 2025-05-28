
import { Search, User, Settings, Truck, Percent, MessageSquare } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Browse & Discover",
      description: "Explore thousands of unique designs from talented Kenyan artists. Each artist sets their own commission rate (minimum 7.7%).",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <User className="h-8 w-8" />,
      title: "Choose Your Path",
      description: "Buy ready-made designs, request platform customizations, or negotiate directly with artists for custom work.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Connect & Create",
      description: "Work directly with artists through our messaging system, or submit requests to our platform team for quotes.",
      gradient: "from-pink-500 to-purple-500"
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Print & Deliver",
      description: "We handle professional printing and delivery. Artists earn commissions automatically on every sale.",
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
            From inspiration to delivery, we make it simple to get custom apparel while supporting Kenyan artists
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

        {/* Commission Info Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Percent className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Fair Commission Structure</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We believe in fair compensation for artists while keeping our platform sustainable
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">Marketplace Sales</h4>
              <p className="text-sm text-gray-600">Artists keep 92.3% of each sale, with only 7.7% going to platform operations</p>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">Custom Designs</h4>
              <p className="text-sm text-gray-600">Artists negotiate directly with customers for custom work pricing</p>
            </div>
            <div className="text-center p-6 bg-pink-50 rounded-xl">
              <h4 className="font-bold text-gray-900 mb-2">Platform Requests</h4>
              <p className="text-sm text-gray-600">Direct platform quotes with no artist commission involved</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
