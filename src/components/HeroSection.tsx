
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useStats, useFeaturedProducts } from '@/hooks/useData';
import { ArrowRight, Sparkles, Palette, Users, Star, Heart, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
// Import debug utility for development
import '@/utils/statsDebug';

const HeroSection = () => {
  const { stats, loading } = useStats();
  const { featuredProducts, loading: productsLoading } = useFeaturedProducts();

  // Carousel state management
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Create showcase items (featured products + custom design option)
  const showcaseItems = React.useMemo(() => {
    const items = [];

    // Add featured products
    if (featuredProducts.length > 0) {
      items.push(...featuredProducts.slice(0, 3).map(product => ({
        type: 'product',
        data: product,
        title: product.title,
        subtitle: `by ${product.artist?.full_name || 'Artist'}`,
        price: `KSh ${product.price.toLocaleString()}`,
        image: product.image_url,
        link: `/product/${product.id}`,
        badge: 'Featured Design',
        gradient: 'from-orange-500 via-red-500 to-pink-500'
      })));
    }

    // Add custom design option
    items.push({
      type: 'custom',
      title: 'Custom Design Studio',
      subtitle: 'Work directly with talented artists',
      price: 'From KSh 2,000',
      link: '/custom-studio',
      badge: 'Create Your Own',
      gradient: 'from-purple-500 via-indigo-500 to-blue-500'
    });

    // Add marketplace promotion
    items.push({
      type: 'marketplace',
      title: 'Explore Marketplace',
      subtitle: 'Thousands of unique designs',
      price: 'Starting KSh 800',
      link: '/marketplace',
      badge: 'Browse All',
      gradient: 'from-green-500 via-teal-500 to-cyan-500'
    });

    return items;
  }, [featuredProducts]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused || showcaseItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseItems.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, showcaseItems.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % showcaseItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[80vh]">
          <div className="space-y-3">
            <div className="space-y-3">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 shadow-sm">
                <Sparkles className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Where Creativity Meets Commerce</span>
              </div>

              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-tight">
                Wear Your
                <span className="block bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
                  Story
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Connect with Kenya's most talented artists to create custom apparel that speaks your language.
                From unique designs to personalized masterpieces, we bring your vision to life.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/marketplace">
                <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-lg px-8 py-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                  Explore Designs
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/custom-studio">
                <Button variant="outline" size="lg" className="text-lg px-8 py-5 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 w-full sm:w-auto">
                  Start Creating
                  <Palette className="ml-2 h-6 w-6" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-2">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-semibold text-gray-700">
                  {loading ? '...' : stats.artistCount > 0 ? `${stats.artistCount}+` : '0'}
                </div>
                <div className="text-sm lg:text-base text-gray-500 font-medium">Active Artists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-semibold text-gray-700">
                  {loading ? '...' : stats.productCount > 0 ? `${stats.productCount}+` : '0'}
                </div>
                <div className="text-sm lg:text-base text-gray-500 font-medium">Designs Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-semibold text-gray-700">
                  {loading ? '...' : stats.orderCount > 0 ? `${stats.orderCount}+` : '0'}
                </div>
                <div className="text-sm lg:text-base text-gray-500 font-medium">Orders Completed</div>
              </div>
            </div>
          </div>

          <div className="relative mt-16">
            <div className="relative z-10">
              {/* Showcase Carousel Container */}
              <div className="relative max-w-2xl mx-auto group">
                {/* Carousel Controls */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    onClick={toggleAutoPlay}
                    className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
                  >
                    {isAutoPlaying ? (
                      <Pause className="h-4 w-4 text-gray-700" />
                    ) : (
                      <Play className="h-4 w-4 text-gray-700" />
                    )}
                  </button>
                </div>

                {/* Navigation Arrows - Only visible on hover */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>

                {/* Carousel Content */}
                <div
                  className="relative overflow-hidden shadow-2xl"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    borderRadius: '24px',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {productsLoading ? (
                    // Loading skeleton
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-[16/10] animate-pulse">
                      <div className="h-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-xl animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    // Showcase carousel with single full-sized cards
                    <div className="relative">
                      <div
                        className="flex transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                      >
                        {showcaseItems.map((item, index) => (
                          <div key={index} className="w-full flex-shrink-0">
                            <Link to={item.link} className="block group">
                              <div
                                className={`relative bg-gradient-to-br ${item.gradient} aspect-[16/10] overflow-hidden transition-all duration-500 hover:scale-[1.02]`}
                                style={{
                                  borderRadius: '24px',
                                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                }}
                              >
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                                </div>

                                {/* Content */}
                                <div className="relative h-full flex items-center justify-between p-8 lg:p-12">
                                  {/* Left Content */}
                                  <div className="flex-1 text-white space-y-4">
                                    {/* Badge */}
                                    <div
                                      className="inline-flex items-center px-4 py-2 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-105"
                                      style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                      }}
                                    >
                                      <Sparkles className="h-4 w-4 mr-2" />
                                      <span className="text-sm font-medium">{item.badge}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-3xl lg:text-4xl font-bold leading-tight">
                                      {item.title}
                                    </h3>

                                    {/* Subtitle */}
                                    <p className="text-lg lg:text-xl text-white/90 max-w-md">
                                      {item.subtitle}
                                    </p>

                                    {/* Price */}
                                    <div className="text-2xl lg:text-3xl font-bold">
                                      {item.price}
                                    </div>

                                    {/* CTA Button */}
                                    <Button
                                      size="lg"
                                      className="text-white hover:scale-105 transition-all duration-300 mt-6 border-0"
                                      style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                                      }}
                                    >
                                      {item.type === 'product' ? 'View Design' :
                                       item.type === 'custom' ? 'Start Creating' : 'Browse All'}
                                      <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                  </div>

                                  {/* Right Visual */}
                                  <div className="hidden lg:flex flex-1 justify-center items-center">
                                    <div className="relative">
                                      {item.type === 'product' && item.image ? (
                                        <div
                                          className="w-64 h-64 overflow-hidden transform group-hover:scale-105 transition-transform duration-500"
                                          style={{
                                            borderRadius: '20px',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                                          }}
                                        >
                                          <img
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          className="w-64 h-64 backdrop-blur-sm flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500"
                                          style={{
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            borderRadius: '20px',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                          }}
                                        >
                                          {item.type === 'custom' ? (
                                            <Palette className="h-24 w-24 text-white drop-shadow-lg" />
                                          ) : (
                                            <Sparkles className="h-24 w-24 text-white drop-shadow-lg" />
                                          )}
                                        </div>
                                      )}

                                      {/* Floating elements */}
                                      <div
                                        className="absolute -top-4 -right-4 w-8 h-8 rounded-full animate-pulse"
                                        style={{
                                          background: 'rgba(255, 255, 255, 0.2)',
                                          backdropFilter: 'blur(10px)',
                                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                        }}
                                      ></div>
                                      <div
                                        className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full animate-pulse delay-1000"
                                        style={{
                                          background: 'rgba(255, 255, 255, 0.15)',
                                          backdropFilter: 'blur(10px)',
                                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Slide Indicators */}
                <div className="flex justify-center mt-6 space-x-3">
                  {showcaseItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? 'scale-125'
                          : 'hover:scale-110'
                      }`}
                      style={{
                        background: index === currentSlide
                          ? 'linear-gradient(135deg, #f97316, #dc2626)'
                          : 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: index === currentSlide
                          ? '0 8px 32px rgba(249, 115, 22, 0.3)'
                          : '0 4px 16px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
