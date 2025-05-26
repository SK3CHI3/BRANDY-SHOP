
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Search, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
                  Brandy
                </h1>
              </Link>
            </div>
            <nav className="hidden md:ml-10 md:flex space-x-8">
              <Link 
                to="/marketplace" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/marketplace') 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-gray-900 hover:text-orange-600'
                }`}
              >
                Marketplace
              </Link>
              <Link 
                to="/custom-studio" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/custom-studio') 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-gray-900 hover:text-orange-600'
                }`}
              >
                Custom Studio
              </Link>
              <Link 
                to="/artists" 
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/artists') 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-gray-900 hover:text-orange-600'
                }`}
              >
                Artists
              </Link>
              <a href="#how-it-works" className="text-gray-900 hover:text-orange-600 px-3 py-2 text-sm font-medium transition-colors">
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
            <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              Join as Artist
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
