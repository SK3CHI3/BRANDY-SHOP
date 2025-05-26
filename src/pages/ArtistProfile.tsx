
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MapPin, Calendar, MessageCircle, Heart, Share2, User } from 'lucide-react';

const ArtistProfile = () => {
  const [isFollowing, setIsFollowing] = useState(false);

  const artist = {
    name: "Amina Wanjiku",
    specialty: "Traditional Patterns",
    location: "Nairobi, Kenya",
    joinDate: "March 2023",
    avatar: "/placeholder.svg",
    coverImage: "/placeholder.svg",
    bio: "I'm a passionate artist specializing in traditional Kenyan patterns with modern twists. My work celebrates our rich cultural heritage while making it accessible to contemporary audiences. I believe art should tell stories and preserve our history for future generations.",
    rating: 4.9,
    reviews: 156,
    completedOrders: 234,
    responseTime: "2 hours",
    followers: 1247,
    following: 89,
    isVerified: true,
    languages: ["English", "Swahili", "Kikuyu"],
    skills: ["Pattern Design", "Cultural Art", "T-shirt Design", "Logo Design"],
    priceRange: "KSh 1,500 - 5,000"
  };

  const portfolio = [
    {
      id: 1,
      title: "Maasai Warrior T-shirt",
      price: 1800,
      image: "/placeholder.svg",
      likes: 45,
      category: "T-Shirts"
    },
    {
      id: 2,
      title: "Kikuyu Proverb Design",
      price: 2200,
      image: "/placeholder.svg",
      likes: 67,
      category: "Hoodies"
    },
    // Add more portfolio items...
  ];

  const reviews = [
    {
      id: 1,
      customer: "John Mutua",
      rating: 5,
      comment: "Amazing work! The design exceeded my expectations. Will definitely order again.",
      date: "2 weeks ago",
      verified: true
    },
    {
      id: 2,
      customer: "Sarah Wambui",
      rating: 5,
      comment: "Professional and creative. Delivered exactly what I wanted.",
      date: "1 month ago",
      verified: true
    },
    // Add more reviews...
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        {/* Cover Image */}
        <div className="h-64 bg-gradient-to-r from-orange-400 to-red-500 relative">
          <img src={artist.coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end -mt-16 pb-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-end mb-6 lg:mb-0">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg relative">
                <img src={artist.avatar} alt={artist.name} className="w-full h-full rounded-full object-cover" />
                {artist.isVerified && (
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-gray-900">{artist.name}</h1>
                <p className="text-lg text-purple-600 font-medium">{artist.specialty}</p>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{artist.location}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {artist.joinDate}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 lg:ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsFollowing(!isFollowing)}
                className={isFollowing ? 'bg-purple-50 border-purple-200' : ''}
              >
                <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-purple-500 text-purple-500' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio" className="mt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {portfolio.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-200 rounded-t-lg">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-t-lg" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <div className="flex items-center text-gray-600">
                            <Heart className="h-4 w-4 mr-1" />
                            <span>{item.likes}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-lg font-bold text-purple-600">KSh {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="mt-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">About {artist.name}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{artist.bio}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Skills & Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {artist.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {artist.languages.map((language) => (
                          <Badge key={language} variant="outline">{language}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{review.customer}</p>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                          {review.verified && (
                            <Badge className="ml-2 bg-green-100 text-green-800">Verified</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Artist Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{artist.rating}</span>
                    <span className="text-gray-500 ml-1">({artist.reviews})</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Orders</span>
                  <span className="font-medium">{artist.completedOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">{artist.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-medium">{artist.followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price Range</span>
                  <span className="font-medium">{artist.priceRange}</span>
                </div>
              </div>
            </div>
            
            {/* Commission Card */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold mb-3">Commission a Design</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get a custom design made just for you by {artist.name}
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Start Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArtistProfile;
