import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Palette, Shirt, Crown, Coffee, ShoppingBag, Smartphone, Briefcase, Gift } from 'lucide-react';

const ProductShowcase = () => {
  const products = [
    {
      id: 'tshirt',
      name: 'T-Shirts',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
      description: 'Classic cotton t-shirts',
      icon: <Shirt className="h-5 w-5" />
    },
    {
      id: 'hoodie',
      name: 'Hoodies',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center',
      description: 'Comfortable premium hoodies',
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 'cap',
      name: 'Caps',
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop&crop=center',
      description: 'Stylish caps and hats',
      icon: <Crown className="h-5 w-5" />
    },
    {
      id: 'mug',
      name: 'Mugs',
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=400&fit=crop&crop=center',
      description: 'Custom ceramic mugs',
      icon: <Coffee className="h-5 w-5" />
    },
    {
      id: 'bag',
      name: 'Tote Bags',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
      description: 'Eco-friendly canvas bags',
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      id: 'phone-case',
      name: 'Phone Cases',
      image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400&h=400&fit=crop&crop=center',
      description: 'Custom phone protection',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      id: 'notebook',
      name: 'Notebooks',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop&crop=center',
      description: 'Personalized journals',
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      id: 'sticker',
      name: 'Stickers',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
      description: 'Custom vinyl stickers',
      icon: <Gift className="h-5 w-5" />
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            What We Create
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your canvas and bring your ideas to life with our premium products
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/design/${product.id}`}
              className="block group"
            >
              <Card className="relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="aspect-square relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Palette className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                      <h3 className="text-lg font-bold mb-1">Design Here</h3>
                      <p className="text-xs opacity-90">Click to start</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-orange-100 rounded-md text-orange-600">
                      {product.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{product.description}</p>

                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs"
                  >
                    Start Designing
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
