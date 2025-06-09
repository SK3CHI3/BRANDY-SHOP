# 🧪 BRANDY-SHOP Testing Guide

## 📋 Table of Contents
- [Testing Overview](#testing-overview)
- [Test Environment Setup](#test-environment-setup)
- [Manual Testing Procedures](#manual-testing-procedures)
- [Automated Testing](#automated-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Bug Reporting](#bug-reporting)

## 🎯 Testing Overview

### Testing Scope
BRANDY-SHOP is a marketplace platform with the following key features to test:
- **User Authentication & Authorization**
- **Design Licensing System** (Core Revenue Feature)
- **Custom Design Studio** with AI Generation
- **E-commerce Functionality**
- **Real-time Messaging**
- **Admin Panel Management**
- **Payment Processing**

### Test Environments
- **Production**: https://brandyshop.netlify.app/
- **Local Development**: http://localhost:8080
- **Database**: Supabase PostgreSQL with RLS

### Test Accounts
```
Admin Account:
  Email: starshine@gmail.com
  Password: tangoDown
  Role: admin

Test Artist Account:
  Create via signup with role: artist

Test Customer Account:
  Create via signup with role: customer
```

## ⚙️ Test Environment Setup

### Prerequisites
```bash
# Clone repository
git clone https://github.com/SK3CHI3/BRANDY-SHOP.git
cd BRANDY-SHOP

# Install dependencies
npm install

# Start development server
npm run dev
```

### Browser Requirements
- **Chrome/Edge**: Latest version (recommended)
- **Firefox**: Latest version
- **Safari**: Latest version
- **Mobile**: Chrome Mobile, Safari Mobile

### System Diagnostics
```javascript
// Open browser console and run:
window.runSystemDiagnostics('user-id-here')

// This will test:
// - Database connectivity
// - Table accessibility
// - Messaging system
// - Product posting
// - Notifications
// - Storage buckets
```

## 🔍 Manual Testing Procedures

### 1. Authentication & User Management

#### **User Registration**
1. Navigate to homepage
2. Click "Join as Artist" or "Sign In"
3. Switch to "Sign Up" tab
4. Test form validation:
   - [ ] Empty fields show errors
   - [ ] Invalid email format rejected
   - [ ] Password requirements enforced
   - [ ] Role selection works (Customer/Artist only - Admin removed)
5. Complete registration
6. Check email for verification link
7. Verify email verification works

#### **User Login**
1. Navigate to login
2. Test invalid credentials
3. Test valid credentials
4. Verify role-based redirects:
   - [ ] Customer → Customer Dashboard
   - [ ] Artist → Artist Dashboard  
   - [ ] Admin → Admin Dashboard

#### **Password Reset**
1. Click "Forgot Password"
2. Enter email
3. Check email for reset link
4. Verify reset process works

### 2. Design Licensing System ⭐ CRITICAL

#### **License Purchase Flow**
1. Browse marketplace
2. Find a licensed design (not free)
3. Click "License" button
4. Test license purchase modal:
   - [ ] License type selection
   - [ ] Price calculation (5% platform fee)
   - [ ] Payment method selection (M-Pesa/Card)
   - [ ] Form validation
5. Complete purchase
6. Verify payment processing
7. Check license appears in "My Licenses"

#### **License Management**
1. Navigate to `/my-licenses`
2. Verify purchased licenses display
3. Test license status tracking:
   - [ ] Pending → Paid → Delivered
4. Test file downloads (when delivered)
5. Verify license terms display

#### **Artist License Sales**
1. Login as artist
2. Navigate to Artist Studio
3. Check "Earnings" tab
4. Verify license sales tracking
5. Test direct payment notifications

### 3. Custom Design Studio

#### **AI Design Generation**
1. Navigate to `/custom-studio`
2. Select product type
3. Test AI prompt builder:
   - [ ] Product-specific prompts
   - [ ] Color selection
   - [ ] Style options
4. Generate design with DeepAI
5. Verify image generation works
6. Test design customization

#### **Quote Request System**
1. Complete design
2. Click "Request Quote"
3. Fill quote form:
   - [ ] Contact information
   - [ ] Budget selection
   - [ ] File attachments
   - [ ] Delivery timeline
4. Submit quote request
5. Verify WhatsApp integration

### 4. Marketplace & E-commerce

#### **Product Browsing**
1. Navigate to `/marketplace`
2. Test product grid display
3. Test search functionality
4. Test category filtering
5. Test price filtering
6. Verify product cards show:
   - [ ] License badges (Free/Licensed)
   - [ ] Artist information
   - [ ] Pricing

#### **Product Details**
1. Click on product
2. Verify product details page
3. Test image gallery
4. Test "Contact Artist" button
5. Test "License" button
6. Test "Add to Cart" (for physical products)

#### **Shopping Cart**
1. Add products to cart
2. Navigate to `/cart`
3. Test quantity updates
4. Test item removal
5. Test checkout process

### 5. Real-time Messaging

#### **Chat System**
1. Click "Contact Artist" on product
2. Test message sending
3. Verify real-time delivery
4. Test message history
5. Test online/offline status
6. Test conversation list

### 6. Admin Panel

#### **Access Control**
1. Login as admin
2. Navigate to `/admin-panel`
3. Verify admin-only access
4. Test sidebar navigation

#### **User Management**
1. Navigate to Users section
2. Test user listing
3. Test user role changes
4. Test user status updates

#### **License Management**
1. Navigate to Design Licensing
2. Test license overview
3. Test status updates
4. Test file delivery
5. Verify revenue tracking

#### **System Settings**
1. Test configuration updates
2. Test payment settings
3. Test email settings

### 7. Mobile Responsiveness

#### **Mobile Testing**
1. Test on mobile devices/emulator
2. Verify responsive design
3. Test touch interactions
4. Test mobile navigation
5. Test mobile forms
6. Test mobile payments

## 🤖 Automated Testing

### System Diagnostics
```javascript
// Comprehensive system check
const results = await window.runSystemDiagnostics('user-id')
console.log('Test Results:', results)

// Expected results:
// - All database tables accessible
// - Messaging system functional
// - Product posting works
// - Notifications active
// - Storage buckets configured
```

### API Testing
```bash
# Test Supabase connection
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     https://xrqfckeuzzgnwkutxqkx.supabase.co/rest/v1/profiles

# Test InstaPay API (sandbox)
curl -X POST https://api.instapay.co.ke/v1/payments/test \
     -H "Authorization: Bearer test_key"

# Test DeepAI API
curl -X POST https://api.deepai.org/api/text2img \
     -H "api-key: 2f4d1478-155b-49d3-83be-42394d1a1152" \
     -F 'text=test prompt'
```

### Database Testing
```sql
-- Test core tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Test RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Test licensing system
SELECT COUNT(*) FROM design_licenses;
SELECT COUNT(*) FROM license_files;
```

## ⚡ Performance Testing

### Load Testing
1. **Page Load Times**
   - [ ] Homepage < 3s
   - [ ] Marketplace < 5s
   - [ ] Product details < 2s
   - [ ] Admin panel < 4s

2. **Bundle Size**
   - [ ] Total JS < 2MB
   - [ ] Initial load < 1MB
   - [ ] Images optimized

3. **Lighthouse Scores**
   - [ ] Performance > 90
   - [ ] Accessibility > 95
   - [ ] Best Practices > 90
   - [ ] SEO > 90

### Database Performance
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE is_featured = true;
EXPLAIN ANALYZE SELECT * FROM design_licenses WHERE customer_id = 'uuid';
```

## 🔒 Security Testing

### Authentication Security
1. **Session Management**
   - [ ] Sessions expire properly
   - [ ] Logout clears all data
   - [ ] No session fixation

2. **Role-Based Access**
   - [ ] Admin routes protected
   - [ ] Artist routes protected
   - [ ] Customer data isolated

3. **Input Validation**
   - [ ] SQL injection prevention
   - [ ] XSS protection
   - [ ] File upload security

### Data Security
1. **Row Level Security (RLS)**
   - [ ] Users see only their data
   - [ ] Cross-user data access blocked
   - [ ] Admin override works

2. **API Security**
   - [ ] API keys not exposed
   - [ ] CORS configured properly
   - [ ] Rate limiting active

## 🐛 Bug Reporting

### Bug Report Template
```markdown
**Bug Title**: [Clear, descriptive title]

**Environment**: 
- URL: [Production/Local]
- Browser: [Chrome/Firefox/Safari + version]
- Device: [Desktop/Mobile/Tablet]

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Behavior**: 
[What should happen]

**Actual Behavior**: 
[What actually happens]

**Screenshots**: 
[Attach if applicable]

**Console Errors**: 
[Any JavaScript errors]

**Priority**: [Critical/High/Medium/Low]
```

### Critical Issues (Report Immediately)
- [ ] Payment processing failures
- [ ] Data loss or corruption
- [ ] Security vulnerabilities
- [ ] Complete system outages
- [ ] License delivery failures

### Reporting Channels
- **GitHub Issues**: https://github.com/SK3CHI3/BRANDY-SHOP/issues
- **Email**: vomollo101@gmail.com
- **WhatsApp**: +254714525667

## ✅ Test Completion Checklist

### Pre-Release Testing
- [ ] All authentication flows tested
- [ ] License purchase system verified
- [ ] Payment processing confirmed
- [ ] Mobile responsiveness checked
- [ ] Admin panel functionality verified
- [ ] Performance benchmarks met
- [ ] Security tests passed
- [ ] Cross-browser compatibility confirmed

### Post-Release Monitoring
- [ ] Error tracking active
- [ ] Performance monitoring setup
- [ ] User feedback collection
- [ ] Payment success rates tracked
- [ ] License delivery rates monitored

---

**Testing Contact**: vomollo101@gmail.com  
**Last Updated**: January 2025  
**Version**: 1.1.0
