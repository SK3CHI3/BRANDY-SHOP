
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Footer = () => {
  const { user, profile } = useAuth();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
              Brandy
            </h3>
            <p className="text-gray-400 mb-4">
              Connecting Kenyan artists with customers who value unique, personalized design.
            </p>
            <div className="text-sm text-gray-500">
              Made with ❤️ in Nairobi
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Customers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Browse Designs</Link></li>
              <li><Link to="/custom-studio" className="hover:text-white transition-colors">Custom Studio</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Artists</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/artists" className="hover:text-white transition-colors">Join Platform</Link></li>
              {/* Protected artist-only links */}
              {user && profile?.role === 'artist' && (
                <>
                  <li><Link to="/artist-studio" className="hover:text-white transition-colors">Artist Studio</Link></li>
                  <li><Link to="/upload-design" className="hover:text-white transition-colors">Upload Design</Link></li>
                  <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
                </>
              )}
              {/* Show alternative links for non-artists */}
              {(!user || profile?.role !== 'artist') && (
                <>
                  <li><span className="text-gray-500 cursor-not-allowed">Artist Studio (Login Required)</span></li>
                  <li><span className="text-gray-500 cursor-not-allowed">Upload Design (Artist Only)</span></li>
                  <li><span className="text-gray-500 cursor-not-allowed">Analytics (Artist Only)</span></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/contact" className="hover:text-white transition-colors">Help Center</Link></li>
              {/* Order tracking - available for logged in users */}
              {user ? (
                <li><Link to="/order-tracking" className="hover:text-white transition-colors">Track Order</Link></li>
              ) : (
                <li><span className="text-gray-500 cursor-not-allowed">Track Order (Login Required)</span></li>
              )}
              <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 Brandy. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
