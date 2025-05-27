
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Search, Settings, LogOut, Palette, ShoppingBag, Shield, ShoppingCart, Menu, X, Heart, MessageCircle, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useData';
import { AuthModal } from '@/components/auth/AuthModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { cartCount } = useCart();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'artist':
        return <Palette className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'artist':
        return '/artist-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/customer-dashboard';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
                    Brandy
                  </span>
                  <span className="text-xs text-gray-500 -mt-0.5 hidden sm:block">Kenyan Art Marketplace</span>
                </div>
              </Link>
            </div>
            <nav className="hidden lg:ml-8 lg:flex space-x-1">
              <Link
                to="/marketplace"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/marketplace')
                    ? 'bg-orange-100 text-orange-700 shadow-sm'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                Marketplace
              </Link>
              <Link
                to="/custom-studio"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/custom-studio')
                    ? 'bg-orange-100 text-orange-700 shadow-sm'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                Custom Studio
              </Link>
              <Link
                to="/artists"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/artists')
                    ? 'bg-orange-100 text-orange-700 shadow-sm'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                Artists
              </Link>
              <Link
                to="/how-it-works"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/how-it-works')
                    ? 'bg-orange-100 text-orange-700 shadow-sm'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                How It Works
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 border border-gray-200 transition-colors duration-200 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search designs, artists..."
                className="bg-transparent outline-none text-sm w-48 placeholder-gray-500"
              />
            </div>

            {/* Cart Icon */}
            <Link to="/cart" className="relative group">
              <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-lg hover:bg-orange-50 transition-all duration-200">
                <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-orange-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-md">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
                      <AvatarFallback>
                        {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile.full_name || 'User'}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {profile.email}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getRoleIcon(profile.role)}
                        <span className="capitalize">{profile.role}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardPath(profile.role)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/favorites">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/order-tracking">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {profile.role === 'artist' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/artist-studio">
                          <Palette className="mr-2 h-4 w-4" />
                          <span>Studio</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/analytics">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Analytics</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/upload-design">
                          <Palette className="mr-2 h-4 w-4" />
                          <span>Upload Design</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {profile.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin-panel">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAuthModal('signin')}
                  className="border-gray-300 hover:border-orange-500 hover:text-orange-600 transition-all duration-200"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() => openAuthModal('signup')}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Join as Artist
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Search */}
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                <Search className="h-4 w-4 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search designs, artists..."
                  className="bg-transparent outline-none text-sm w-full placeholder-gray-500"
                />
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-2">
                <Link
                  to="/marketplace"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/marketplace')
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-700 hover:bg-orange-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Marketplace
                </Link>
                <Link
                  to="/custom-studio"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/custom-studio')
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-700 hover:bg-orange-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Custom Studio
                </Link>
                <Link
                  to="/artists"
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/artists')
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-700 hover:bg-orange-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Artists
                </Link>
                <Link
                  to="/how-it-works"
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  to="/size-guide"
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Size Guide
                </Link>
              </nav>

              {/* Mobile Auth Buttons */}
              {!user ? (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:border-orange-500 hover:text-orange-600"
                    onClick={() => {
                      openAuthModal('signin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600"
                    onClick={() => {
                      openAuthModal('signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Join as Artist
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) || profile?.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{profile?.full_name || 'User'}</div>
                      <div className="text-sm text-gray-500 capitalize">{profile?.role}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to={getDashboardPath(profile?.role || 'customer')}
                      className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Dashboard
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4 mr-3" />
                      Favorites
                    </Link>
                    <Link
                      to="/order-tracking"
                      className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="h-4 w-4 mr-3" />
                      My Orders
                    </Link>
                    <Link
                      to="/messages"
                      className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MessageCircle className="h-4 w-4 mr-3" />
                      Messages
                    </Link>
                    {profile?.role === 'artist' && (
                      <>
                        <Link
                          to="/artist-studio"
                          className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Palette className="h-4 w-4 mr-3" />
                          Studio
                        </Link>
                        <Link
                          to="/analytics"
                          className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Analytics
                        </Link>
                        <Link
                          to="/upload-design"
                          className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Palette className="h-4 w-4 mr-3" />
                          Upload Design
                        </Link>
                      </>
                    )}
                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin-panel"
                        className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-3" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </header>
  );
};

export default Header;
