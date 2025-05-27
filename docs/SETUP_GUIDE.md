# 🚀 Brandy Shop - Setup & Installation Guide

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: Latest version for version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Development Tools (Recommended)
- **VS Code**: With TypeScript and React extensions
- **Supabase CLI**: For local development and database management
- **Postman**: For API testing (optional)

## 🛠️ Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/SK3CHI3/brandy-shop.git
cd brandy-shop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# InstaPay Configuration (for payments)
VITE_INSTAPAY_API_KEY=your_instapay_api_key
VITE_INSTAPAY_BASE_URL=https://api.instapay.co.ke
VITE_INSTAPAY_ENV=sandbox

# App Configuration
VITE_APP_NAME=Brandy Shop
VITE_APP_URL=http://localhost:8080
```

### 4. Database Setup

#### Option A: Use Existing Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing one
3. Copy the project URL and anon key to your `.env.local`
4. Run the database setup script:
```bash
npm run db:setup
```

#### Option B: Local Supabase Development
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

### 5. Run Database Migrations
Execute the SQL scripts in the following order:
1. `src/database/supabase-setup.sql` - Core tables and policies
2. `src/database/fix-existing-users.sql` - User role fixes (if needed)

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🗄️ Database Configuration

### Required Tables
The application requires the following database tables:
- `profiles` - User profiles and roles
- `artist_profiles` - Extended artist information
- `categories` - Product categories
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `favorites` - User wishlists
- `cart_items` - Shopping cart
- `reviews` - Product reviews
- `messages` - User communications

### Sample Data
To populate the database with sample data:
```bash
npm run db:seed
```

Or use the admin panel:
1. Navigate to `/admin-panel`
2. Go to "Database Debug" tab
3. Click "Create Sample Data"

## 🔧 Configuration Options

### Authentication Setup
1. **Supabase Auth**: Configure providers in Supabase dashboard
2. **Email Templates**: Customize in Supabase Auth settings
3. **Redirect URLs**: Add your domain to allowed redirects

### Payment Integration
1. **InstaPay**: Register for API access at InstaPay
2. **Test Mode**: Use sandbox credentials for development
3. **Webhooks**: Configure payment status webhooks

### File Storage
1. **Supabase Storage**: Create buckets for:
   - `avatars` - User profile pictures
   - `products` - Product images
   - `designs` - Artist design files

### Email Configuration
1. **SMTP Settings**: Configure in Supabase dashboard
2. **Email Templates**: Customize for:
   - Welcome emails
   - Order confirmations
   - Password resets

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Artist profile creation
- [ ] Product upload and management
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] Order tracking
- [ ] Admin panel access

## 🚀 Deployment

### Netlify Deployment (Recommended)
1. **Connect Repository**: Link your GitHub repo to Netlify
2. **Environment Variables**: Add all env vars in Netlify dashboard
3. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Deploy**: Automatic deployment on push to main

### Manual Deployment
```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Deploy to your hosting provider
# Upload the 'dist' folder contents
```

### Environment Variables for Production
Ensure all environment variables are set in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_INSTAPAY_API_KEY`
- `VITE_INSTAPAY_BASE_URL`
- `VITE_INSTAPAY_ENV`

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```
Error: Failed to connect to Supabase
```
**Solution**: Check your Supabase URL and anon key in `.env.local`

#### 2. 403 Forbidden Errors
```
Error: 403 Forbidden when fetching data
```
**Solution**: Verify Row Level Security policies are correctly configured

#### 3. Build Errors
```
Error: TypeScript compilation failed
```
**Solution**: Run `npm run type-check` to identify type errors

#### 4. Payment Integration Issues
```
Error: InstaPay API connection failed
```
**Solution**: Verify API credentials and endpoint URLs

### Debug Tools
The application includes built-in debug tools:
1. **Admin Panel**: `/admin-panel` - Database and user debugging
2. **Browser Console**: Debug functions available globally
3. **Network Tab**: Monitor API calls and responses

### Getting Help
- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Report bugs on GitHub Issues
- **Community**: Join our Discord for support
- **Email**: Contact brandyshop.ke@gmail.com

## 📚 Additional Resources

### Development
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

### Design
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Figma Design System](link-to-figma)

### Business
- [InstaPay API Docs](https://instapay.co.ke/docs)
- [Kenyan E-commerce Regulations](link-to-regulations)
- [Artist Onboarding Guide](docs/ARTIST_GUIDE.md)

---

**Need help?** Check our [FAQ](docs/FAQ.md) or reach out to the development team!
