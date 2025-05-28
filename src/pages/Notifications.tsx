import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsService, type Notification } from '@/services/notifications';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Package,
  Heart,
  MessageCircle,
  Star,
  ShoppingCart,
  Palette,
  DollarSign,
  Settings,
  Check,
  X,
  MoreVertical,
  Lock,
  ArrowLeft,
  User,
  AlertCircle
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

// Notification interface is now imported from the service

const Notifications = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { notifications, error } = await notificationsService.getUserNotifications(user.id);

      if (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notifications',
          variant: 'destructive',
        });
        return;
      }

      setNotifications(notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to real-time notifications
      const subscription = notificationsService.subscribeToNotifications(
        user.id,
        (newNotification) => {
          setNotifications(prev => [newNotification, ...prev]);

          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      );

      setRealtimeSubscription(subscription);
    }

    // Cleanup
    return () => {
      if (realtimeSubscription) {
        notificationsService.unsubscribeFromNotifications(realtimeSubscription);
      }
    };
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'favorite':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const markAsRead = async (id: string) => {
    try {
      const { success, error } = await notificationsService.markAsRead(id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      if (success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { success, error } = await notificationsService.markAllAsRead(user.id);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark notifications as read',
          variant: 'destructive',
        });
        return;
      }

      if (success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
        );
        toast({
          title: 'All notifications marked as read',
          description: 'Your notifications have been updated',
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { success, error } = await notificationsService.deleteNotification(id);

      if (error) {
        console.error('Error deleting notification:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete notification',
          variant: 'destructive',
        });
        return;
      }

      if (success) {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        toast({
          title: 'Notification deleted',
          description: 'The notification has been removed',
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read_at;
    return notif.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Icon with lock overlay */}
            <div className="relative inline-block mb-8">
              <Bell className="h-24 w-24 text-gray-300" />
              <div className="absolute -bottom-2 -right-2 bg-yellow-600 rounded-full p-2">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Stay in the Loop
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Sign in to access your notifications and stay updated with your orders,
              messages, reviews, and important account activity.
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <Package className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Order Updates</h3>
                <p className="text-sm text-gray-600">Track your orders and deliveries</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <MessageCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Message Alerts</h3>
                <p className="text-sm text-gray-600">Never miss important messages</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Account Activity</h3>
                <p className="text-sm text-gray-600">Stay informed about your account</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => openAuthModal('signin')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 text-lg"
              >
                <User className="h-5 w-5 mr-2" />
                Sign In for Notifications
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openAuthModal('signup')}
                className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 px-8 py-3 text-lg"
              >
                <Palette className="h-5 w-5 mr-2" />
                Create Account
              </Button>
            </div>

            {/* Continue shopping link */}
            <div className="mt-8">
              <Link
                to="/marketplace"
                className="inline-flex items-center text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Explore marketplace
              </Link>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultTab={authModalTab}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Stay updated with your orders, messages, and account activity
            </p>
          </div>

          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm" className="w-full sm:w-auto">
              <Check className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mark all as read</span>
              <span className="sm:hidden">Mark all read</span> ({unreadCount})
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 gap-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Unread</span>
              <span className="sm:hidden">📬</span>
              {unreadCount > 0 && <Badge className="ml-1 text-xs">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="order" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">📦</span>
            </TabsTrigger>
            <TabsTrigger value="message" className="text-xs sm:text-sm hidden sm:flex">Messages</TabsTrigger>
            <TabsTrigger value="review" className="text-xs sm:text-sm hidden sm:flex">Reviews</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs sm:text-sm hidden sm:flex">Payments</TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm hidden sm:flex">System</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4 animate-pulse">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'unread'
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications in this category yet."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read_at ? 'bg-blue-50' : ''
                    }`}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`text-sm font-medium line-clamp-2 ${
                              !notification.read_at ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.created_at)}
                              </span>
                              {!notification.read_at && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-3">
                            {notification.message}
                          </p>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
                            {notification.action_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full sm:w-auto text-xs"
                                onClick={() => {
                                  markAsRead(notification.id);
                                  window.location.href = notification.action_url!;
                                }}
                              >
                                View Details
                              </Button>
                            )}

                            <div className="flex gap-2 w-full sm:w-auto">
                              {!notification.read_at && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="flex-1 sm:flex-none text-xs"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="hidden sm:inline">Mark as read</span>
                                  <span className="sm:hidden">Read</span>
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 sm:flex-none text-xs"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                <span className="hidden sm:inline">Delete</span>
                                <span className="sm:hidden">Del</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Notifications;
