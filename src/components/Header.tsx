
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Search, Settings } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ArtistryHub
              </h1>
            </div>
            <nav className="hidden md:ml-10 md:flex space-x-8">
              <a href="#" className="text-gray-900 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
                Marketplace
              </a>
              <a href="#" className="text-gray-900 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
                Custom Studio
              </a>
              <a href="#" className="text-gray-900 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
                Artists
              </a>
              <a href="#" className="text-gray-900 hover:text-purple-600 px-3 py-2 text-sm font-medium transition-colors">
                How It Works
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search designs..." 
                className="bg-transparent outline-none text-sm w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Join as Artist
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
