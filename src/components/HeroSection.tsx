
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { ArrowRight, Sparkles, Palette, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const HeroSection = () => {
  const { stats, statsLoading, featuredProducts, featuredLoading } = useData();

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-0 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-8 items-center min-h-[85vh] sm:min-h-[80vh]">
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-1">
            <div className="space-y-4 sm:space-y-6">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 shadow-sm">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 mr-1.5 sm:mr-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Fair Artist Marketplace</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                Support
                <span className="block bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
                  Kenyan Artists
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Connect with Kenya's most talented artists in a fair marketplace. Artists keep 92.3% of every sale with our transparent 7.7% commission structure.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Link to="/marketplace" className="w-full sm:w-auto">
                <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full min-h-[48px]">
                  Support Artists
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </Button>
              </Link>
              <Link to="/custom-studio" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 w-full min-h-[48px]">
                  Request Custom
                  <Palette className="ml-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-6 sm:pt-4">
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-700">
                  {statsLoading ? '...' : stats.artistCount > 0 ? `${stats.artistCount}+` : '50+'}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium">Active Artists</div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-700">
                  92.3%
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium">Artist Keeps</div>
              </div>
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-700">
                  {statsLoading ? '...' : stats.orderCount > 0 ? `${stats.orderCount}+` : '100+'}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium">Orders Completed</div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 sm:mt-10 lg:mt-0 order-2 lg:order-2">
            <div className="relative z-10">
              {/* Showcase Carousel Container */}
              <div className="relative max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto group">
                {/* Carousel Controls */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 flex items-center gap-2">
                  <button
                    onClick={toggleAutoPlay}
                    className="w-6 h-6 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
                  >
                    {isAutoPlaying ? (
                      <Pause className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
                    ) : (
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
                    )}
                  </button>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transform sm:-translate-x-2 sm:group-hover:translate-x-0"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-gray-700" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-x-2 sm:group-hover:translate-x-0"
                >
                  <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-gray-700" />
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
                  {featuredLoading ? (
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
                                <div className="relative h-full flex items-center justify-between p-3 sm:p-4 md:p-6 lg:p-8">
                                  {/* Left Content */}
                                  <div className="flex-1 text-white space-y-1 sm:space-y-2 md:space-y-3 max-w-[70%] sm:max-w-[65%] lg:max-w-[60%]">
                                    {/* Badge */}
                                    <div
                                      className="inline-flex items-center px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-105"
                                      style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                                      }}
                                    >
                                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                      <span className="text-xs sm:text-sm font-medium truncate">{item.badge}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold leading-tight line-clamp-2">
                                      {item.title}
                                    </h3>

                                    {/* Subtitle */}
                                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 line-clamp-2">
                                      {item.subtitle}
                                    </p>

                                    {/* Price */}
                                    <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold">
                                      {item.price}
                                    </div>

                                    {/* CTA Button */}
                                    <Button
                                      size="sm"
                                      className="text-white hover:scale-105 transition-all duration-300 mt-1 sm:mt-2 lg:mt-3 border-0 text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 min-h-[32px] sm:min-h-[36px]"
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
                                      <span className="truncate">
                                        {item.type === 'product' ? 'View Design' :
                                         item.type === 'custom' ? 'Start Creating' : 'Browse All'}
                                      </span>
                                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                                    </Button>
                                  </div>

                                  {/* Right Visual */}
                                  <div className="flex-shrink-0 ml-2 sm:ml-3 lg:ml-4 flex justify-center items-center">
                                    <div className="relative">
                                      {item.type === 'product' && item.image ? (
                                        <div
                                          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 overflow-hidden transform group-hover:scale-105 transition-transform duration-500"
                                          style={{
                                            borderRadius: '12px',
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
                                          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 backdrop-blur-sm flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500"
                                          style={{
                                            background: 'rgba(255, 255, 255, 0.15)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                          }}
                                        >
                                          {item.type === 'custom' ? (
                                            <Palette className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-12 lg:w-12 xl:h-16 xl:w-16 text-white drop-shadow-lg" />
                                          ) : (
                                            <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-12 lg:w-12 xl:h-16 xl:w-16 text-white drop-shadow-lg" />
                                          )}
                                        </div>
                                      )}
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
                <div className="flex justify-center mt-4 sm:mt-6 space-x-2 sm:space-x-3">
                  {showcaseItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
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
