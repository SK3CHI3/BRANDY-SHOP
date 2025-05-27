# Custom Design Studio - Documentation

## 🎯 Overview
The AI Custom Design Studio is a comprehensive design tool that allows users to create custom branded products using AI-powered design generation, manual text customization, and image uploads. The studio features a progressive 3-step design process for optimal user experience.

## ✨ Features Implemented

### 🎨 Progressive Design Process
1. **Step 1: Product Selection**
   - Product category dropdown (Apparel, Promotional, Corporate)
   - Popular products quick selection grid
   - Comprehensive product browser with 15+ product types
   - Custom design request system for unique requirements

2. **Step 2: Design Canvas**
   - Real-time product preview
   - AI-generated design overlay
   - Custom text overlay with styling
   - Responsive canvas that fits all screen sizes

3. **Step 3: Design Tools & Actions**
   - Tabbed interface (AI, Text, Upload)
   - Dynamic pricing calculator
   - Save design functionality
   - Add to cart integration

### 🤖 AI Integration
- **DeepAI API Integration** for image generation
- **Smart prompt building** based on product type
- **AI complexity levels** (simple, medium, complex)
- **Real-time generation status** with loading indicators

### 💰 Dynamic Pricing System
- **Base product pricing** with size/color variations
- **AI generation fees** based on complexity
- **Quantity discounts** for bulk orders
- **Real-time price updates** as users customize

### 📱 Responsive Design
- **Mobile-first approach** with proper breakpoints
- **Progressive enhancement** for larger screens
- **Touch-friendly interface** for mobile users
- **Optimized layouts** for different screen sizes

### 📝 Custom Request System
- **Direct admin communication** for unique requirements
- **Structured request forms** with all necessary details
- **Database storage** for admin review and processing
- **User authentication** required for requests

## 🏗️ Technical Architecture

### Core Components
1. **CustomStudio.tsx** - Main studio component
2. **AIPromptBuilder.tsx** - AI generation interface
3. **Product Selection System** - Category and product browsing
4. **Design Canvas** - Real-time preview system
5. **Pricing Calculator Service** - Dynamic pricing logic
6. **Custom Request System** - Admin communication

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **AI Service**: DeepAI API (deepai.org)
- **Backend**: Supabase
- **State Management**: React Hooks + Context
- **UI Components**: Shadcn/ui + Lucide Icons

### Database Schema
```sql
-- Custom design requests table
CREATE TABLE custom_design_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_type TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  budget TEXT,
  deadline DATE,
  contact_info TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart items with customization support
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  customization JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Usage Guide

### For Customers
1. **Browse Products**: Select from categories or use the dropdown
2. **Design**: Use AI generation, add text, or upload images
3. **Customize**: Adjust size, color, and quantity
4. **Review**: Check pricing and preview
5. **Order**: Add to cart or save design

### For Admins
1. **Review Requests**: Check custom design requests in database
2. **Process Orders**: Handle custom design orders
3. **Manage Products**: Add/remove products from catalog
4. **Monitor Usage**: Track AI generation usage and costs

## 🔧 Configuration

### Environment Variables
```env
# DeepAI Configuration
VITE_DEEPAI_API_KEY=your_deepai_api_key

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Product Categories
The system supports multiple product categories:
- **Apparel**: T-shirts, Hoodies, Polo shirts, Jackets
- **Promotional**: Mugs, Water bottles, Umbrellas, Bags
- **Corporate**: Power banks, Executive pens, Gift sets

## 📊 Analytics & Monitoring

### Key Metrics
- **Design Generation Count**: Track AI usage
- **Conversion Rate**: Designs to orders
- **Popular Products**: Most customized items
- **Custom Requests**: Admin workload tracking

### Performance Optimization
- **Image Optimization**: Compressed previews
- **Lazy Loading**: Components load on demand
- **Caching**: Product data and AI responses
- **Error Handling**: Graceful fallbacks

## 🔒 Security Considerations

### User Data Protection
- **Authentication Required**: For cart and requests
- **Input Validation**: All form inputs sanitized
- **Rate Limiting**: AI generation limits
- **Secure Storage**: Encrypted user data

### API Security
- **Environment Variables**: Secure key storage
- **CORS Configuration**: Restricted origins
- **Error Handling**: No sensitive data exposure
- **Audit Logging**: Track admin actions

## 🚀 Future Enhancements

### Planned Features
1. **Advanced AI Models**: Multiple AI providers
2. **Design Templates**: Pre-made design library
3. **Collaboration Tools**: Share designs with team
4. **Bulk Ordering**: Enterprise features
5. **Design History**: Save and reuse designs
6. **Social Sharing**: Share designs on social media

### Technical Improvements
1. **Performance**: Faster loading and rendering
2. **Offline Support**: PWA capabilities
3. **Advanced Analytics**: Detailed usage metrics
4. **A/B Testing**: Optimize conversion rates
5. **Mobile App**: Native mobile experience

## 📞 Support & Maintenance

### Regular Tasks
- **Monitor AI Usage**: Track API costs
- **Update Product Catalog**: Add new products
- **Review Custom Requests**: Process admin queue
- **Performance Monitoring**: Check load times
- **Security Updates**: Keep dependencies current

### Troubleshooting
- **AI Generation Fails**: Check API key and limits
- **Pricing Issues**: Verify calculation logic
- **Upload Problems**: Check file size limits
- **Mobile Issues**: Test responsive design

## 📚 Resources

### Documentation Links
- [DeepAI API Documentation](https://deepai.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Support Channels
- **Email**: brandyshop.ke@gmail.com
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check `/docs` folder for guides
