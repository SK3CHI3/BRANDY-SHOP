# 🚀 BRANDY-SHOP Developer & Tester Guide

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Services](#api-services)
- [Authentication & Authorization](#authentication--authorization)
- [Business Logic](#business-logic)
- [Testing Guide](#testing-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🏗️ System Overview

BRANDY-SHOP is a Kenyan creative marketplace connecting artists with customers for custom apparel and design licensing. The platform operates on a **direct payment model** where artists receive payments directly from customers.

### 🎯 Core Business Model
- **Artists**: Upload designs, receive direct payments (95% of sales)
- **Platform**: Earns from printing markup (25% over cost) + featured listings
- **Customers**: Buy licenses directly from artists or order custom prints
- **No Withdrawal System**: Direct payments eliminate complex withdrawal management

### 🌐 Production URLs
- **Live Site**: https://brandyshop.netlify.app/
- **Admin Panel**: https://brandyshop.netlify.app/admin-panel
- **Admin Credentials**: `starshine@gmail.com` / `tangoDown`

## 🏛️ Architecture

### Tech Stack
```
Frontend:  React 18 + TypeScript + Tailwind CSS + Shadcn/ui
Backend:   Supabase (PostgreSQL + Auth + Storage + Realtime)
Payments:  InstaPay API + M-Pesa Integration
AI:        DeepAI API for design generation
Hosting:   Netlify (Frontend) + Supabase (Backend)
```

### Project Structure
```
brandy-shop/
├── 📁 src/
│   ├── 🎨 components/          # Reusable UI components
│   │   ├── ui/                 # Shadcn/ui base components
│   │   ├── auth/               # Authentication components
│   │   ├── admin/              # Admin panel components
│   │   ├── design/             # Design studio components
│   │   └── forms/              # Form components
│   ├── 📄 pages/               # Page components (routes)
│   ├── 🔧 hooks/               # Custom React hooks
│   ├── 🌐 contexts/            # React context providers
│   ├── 🔌 services/            # API services & integrations
│   ├── 🛠️ lib/                 # Utility functions & configs
│   ├── 📊 database/            # Database schemas & setup scripts
│   └── 🎨 styles/              # Global styles
├── 📚 docs/                    # Documentation
├── 🌐 public/                  # Static assets
└── ⚙️ config files             # Build & deployment configs
```

## 🗄️ Database Schema

### Core Tables (23 total)

#### **User Management**
- `profiles` - User accounts & roles (customer/artist/admin)
- `artist_profiles` - Extended artist information
- `user_status` - Online/offline tracking

#### **Product Catalog**
- `products` - Product listings with licensing info
- `categories` - Product categories
- `favorites` - User wishlists
- `reviews` - Product reviews

#### **E-commerce**
- `orders` - Customer orders
- `order_items` - Order line items
- `order_tracking` - Shipping & delivery status
- `cart_items` - Shopping cart persistence

#### **Design Licensing** ⭐ NEW
- `design_licenses` - License purchases & tracking
- `license_files` - Delivered design files

#### **Communication**
- `conversations` - Chat conversations
- `messages` - Chat messages
- `notifications` - System notifications

#### **Business Operations**
- `custom_design_requests` - Custom design orders
- `featured_listings` - Paid featured products
- `artist_earnings` - Artist revenue tracking
- `artist_withdrawals` - Legacy withdrawal records (deprecated)
- `withdrawal_transactions` - Legacy transactions (deprecated)

#### **System**
- `maintenance_log` - System maintenance records

### Key Database Features
- **Row Level Security (RLS)** enabled on all tables
- **Real-time subscriptions** for chat & notifications
- **Automatic triggers** for earnings calculation
- **Foreign key constraints** for data integrity

## 🔌 API Services

### External Integrations

#### **Supabase** (Primary Backend)
```typescript
// Configuration
const supabaseUrl = 'https://xrqfckeuzzgnwkutxqkx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// Usage
import { supabase } from '@/lib/supabase'
```

#### **InstaPay API** (Payments)
```typescript
// Configuration
const config = {
  apiKey: process.env.VITE_INSTAPAY_API_KEY,
  baseUrl: 'https://api.instapay.co.ke',
  environment: 'sandbox' // or 'production'
}

// Usage
import { instaPayService } from '@/services/instapay'
```

#### **DeepAI** (AI Design Generation)
```typescript
// Configuration
const apiKey = '2f4d1478-155b-49d3-83be-42394d1a1152'
const baseUrl = 'https://api.deepai.org/api'

// Usage
import { deepAIService } from '@/services/deepai'
```

### Internal Services

#### **Licensing Service** (`src/services/licensing.ts`)
- License purchase processing
- File delivery management
- Revenue tracking

#### **Messaging Service** (`src/services/messaging.ts`)
- Real-time chat functionality
- Conversation management

#### **Notifications Service** (`src/services/notifications.ts`)
- System notifications
- Real-time updates

## 🔐 Authentication & Authorization

### User Roles
- **Customer**: Browse, purchase, license designs
- **Artist**: Upload designs, manage sales, receive payments
- **Admin**: Platform management, user oversight

### Route Protection
```typescript
// Public routes
<Route path="/marketplace" element={<Marketplace />} />

// Authenticated routes
<Route path="/profile" element={
  <AuthenticatedRoute>
    <Profile />
  </AuthenticatedRoute>
} />

// Role-specific routes
<Route path="/artist-studio" element={
  <ArtistRoute>
    <ArtistStudio />
  </ArtistRoute>
} />

<Route path="/admin-panel" element={
  <AdminRoute>
    <AdminPanel />
  </AdminRoute>
} />
```

### Email Verification
- **Site URL**: `https://brandyshop.netlify.app`
- **Redirect URLs**: Production + localhost for development
- **Email Templates**: Supabase default templates

## 💼 Business Logic

### Design Licensing System
```typescript
// License Types
type LicenseType = 'free' | 'standard' | 'exclusive' | 'commercial'

// Revenue Split
const platformFee = licensePrice * 0.05  // 5%
const artistEarnings = licensePrice * 0.95 // 95%

// License Purchase Flow
1. Customer selects design
2. Chooses license type
3. Makes payment (M-Pesa/Card)
4. Artist receives 95% directly
5. Platform retains 5% fee
6. High-res files delivered
```

### Direct Payment Model
- **No withdrawal system** - Artists paid directly
- **Platform revenue** from printing markup + featured listings
- **WhatsApp integration** for payment support
- **Real-time payment processing** via InstaPay

### Custom Design Studio
- **AI-powered design generation** using DeepAI
- **Product-specific prompts** for different items
- **Quote request system** for custom work
- **File attachment support** for inspiration

## 🧪 Testing Guide

### Manual Testing Checklist

#### **Authentication**
- [ ] User registration (customer/artist)
- [ ] Email verification
- [ ] Login/logout
- [ ] Role-based access control

#### **Marketplace**
- [ ] Product browsing
- [ ] Search & filtering
- [ ] Product details
- [ ] Add to cart/favorites

#### **Design Licensing**
- [ ] License purchase flow
- [ ] Payment processing
- [ ] File delivery
- [ ] License tracking

#### **Custom Studio**
- [ ] AI design generation
- [ ] Quote requests
- [ ] File uploads
- [ ] Product customization

#### **Admin Panel**
- [ ] User management
- [ ] Product management
- [ ] Order tracking
- [ ] License oversight

### Automated Testing
```bash
# Run system diagnostics
npm run dev
# Open browser console and run:
window.runSystemDiagnostics('user-id-here')
```

### Test Accounts
```
Admin:    starshine@gmail.com / tangoDown
Artist:   [Create via signup]
Customer: [Create via signup]
```

### API Testing
```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://xrqfckeuzzgnwkutxqkx.supabase.co/rest/v1/profiles

# Test InstaPay (sandbox)
curl -X POST https://api.instapay.co.ke/v1/payments/mpesa \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"amount": 100, "phone_number": "254700000000"}'
```

## 🚀 Deployment

### Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=https://xrqfckeuzzgnwkutxqkx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# InstaPay
VITE_INSTAPAY_API_KEY=your_instapay_key
VITE_INSTAPAY_BASE_URL=https://api.instapay.co.ke
VITE_INSTAPAY_ENV=production

# DeepAI
VITE_DEEPAI_API_KEY=2f4d1478-155b-49d3-83be-42394d1a1152
```

### Build & Deploy
```bash
# Development
npm run dev

# Production build
npm run build

# Deploy to Netlify
git push origin main  # Auto-deploys via Netlify
```

### Database Setup
```sql
-- Run in Supabase SQL Editor
-- 1. Core tables
\i src/database/supabase-setup.sql

-- 2. Licensing system
\i src/database/licensing-setup.sql

-- 3. Missing tables
\i src/database/missing-tables-setup.sql

-- 4. Fix any issues
\i src/database/fix-database-issues.sql
```

## 🔧 Troubleshooting

### Common Issues

#### **Authentication Problems**
```typescript
// Check auth state
console.log('Auth user:', supabase.auth.getUser())
console.log('Session:', supabase.auth.getSession())

// Clear auth cache
localStorage.removeItem('brandy-shop-auth-token')
```

#### **Database Connection**
```typescript
// Test database connectivity
const { data, error } = await supabase.from('profiles').select('count(*)')
console.log('DB Test:', { data, error })
```

#### **Payment Issues**
```typescript
// Check InstaPay configuration
console.log('InstaPay Config:', {
  apiKey: import.meta.env.VITE_INSTAPAY_API_KEY,
  environment: import.meta.env.VITE_INSTAPAY_ENV
})
```

### System Diagnostics
```javascript
// Run comprehensive system check
window.runSystemDiagnostics('user-id')
```

### Performance Monitoring
- **Lighthouse scores**: 90+ for all metrics
- **Bundle size**: < 2MB total
- **Load time**: < 3s on 3G

## 📞 Support Contacts

- **Technical Issues**: vomollo101@gmail.com
- **Business Inquiries**: +254714525667
- **WhatsApp Support**: https://wa.me/254714525667

---

**Last Updated**: January 2025  
**Version**: 1.1.0  
**Status**: Production Ready ✅
