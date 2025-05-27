import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, ShoppingBag, Shield, User, Settings, BarChart3, Package, Users } from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please sign in to access your dashboard.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'artist':
        return <Palette className="h-6 w-6" />;
      case 'admin':
        return <Shield className="h-6 w-6" />;
      default:
        return <ShoppingBag className="h-6 w-6" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'artist':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case 'artist':
        return 'Welcome to your Artist Studio! Manage your designs, track earnings, and connect with customers.';
      case 'admin':
        return 'Welcome to the Admin Panel! Monitor platform activity, manage users, and oversee operations.';
      default:
        return 'Welcome to your Customer Dashboard! Explore designs, track orders, and manage your profile.';
    }
  };

  const getDashboardCards = (role: string) => {
    switch (role) {
      case 'artist':
        return [
          { title: 'Total Designs', value: '12', icon: <Palette className="h-4 w-4" />, color: 'text-purple-600' },
          { title: 'Total Earnings', value: 'KSh 45,000', icon: <BarChart3 className="h-4 w-4" />, color: 'text-green-600' },
          { title: 'Active Orders', value: '8', icon: <Package className="h-4 w-4" />, color: 'text-blue-600' },
          { title: 'Rating', value: '4.8', icon: <User className="h-4 w-4" />, color: 'text-yellow-600' },
        ];
      case 'admin':
        return [
          { title: 'Total Users', value: '1,234', icon: <Users className="h-4 w-4" />, color: 'text-blue-600' },
          { title: 'Total Artists', value: '156', icon: <Palette className="h-4 w-4" />, color: 'text-purple-600' },
          { title: 'Total Orders', value: '2,890', icon: <Package className="h-4 w-4" />, color: 'text-green-600' },
          { title: 'Revenue', value: 'KSh 890,000', icon: <BarChart3 className="h-4 w-4" />, color: 'text-orange-600' },
        ];
      default:
        return [
          { title: 'Orders', value: '5', icon: <Package className="h-4 w-4" />, color: 'text-blue-600' },
          { title: 'Favorites', value: '23', icon: <User className="h-4 w-4" />, color: 'text-red-600' },
          { title: 'Wishlist', value: '12', icon: <ShoppingBag className="h-4 w-4" />, color: 'text-purple-600' },
          { title: 'Reviews', value: '8', icon: <BarChart3 className="h-4 w-4" />, color: 'text-green-600' },
        ];
    }
  };

  const dashboardCards = getDashboardCards(profile.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {getRoleIcon(profile.role)}
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.role === 'artist' ? 'Artist Studio' : 
                 profile.role === 'admin' ? 'Admin Panel' : 
                 'Customer Dashboard'}
              </h1>
            </div>
            <Badge className={getRoleColor(profile.role)}>
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </Badge>
          </div>
          <p className="text-gray-600 text-lg">
            {getWelcomeMessage(profile.role)}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={card.color}>{card.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.role === 'artist' && (
                <>
                  <Button className="h-20 flex flex-col gap-2">
                    <Palette className="h-6 w-6" />
                    Upload New Design
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Package className="h-6 w-6" />
                    Manage Orders
                  </Button>
                </>
              )}
              
              {profile.role === 'admin' && (
                <>
                  <Button className="h-20 flex flex-col gap-2">
                    <Users className="h-6 w-6" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Settings className="h-6 w-6" />
                    Platform Settings
                  </Button>
                </>
              )}
              
              {profile.role === 'customer' && (
                <>
                  <Button className="h-20 flex flex-col gap-2">
                    <ShoppingBag className="h-6 w-6" />
                    Browse Marketplace
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Package className="h-6 w-6" />
                    Track Orders
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <User className="h-6 w-6" />
                    Update Profile
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
