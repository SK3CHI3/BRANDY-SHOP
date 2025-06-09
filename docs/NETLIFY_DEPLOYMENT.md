# 🚀 BRANDY-SHOP Netlify Deployment Guide

## 📋 Table of Contents
- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Netlify Configuration](#netlify-configuration)
- [Environment Variables](#environment-variables)
- [Build Settings](#build-settings)
- [Domain Configuration](#domain-configuration)
- [Troubleshooting](#troubleshooting)

## ✅ Pre-deployment Checklist

### **Code Preparation**
- [ ] All imports fixed (no `@/components/ui` bulk imports)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Preview works locally (`npm run preview`)

### **Configuration Files**
- [ ] `public/_redirects` file created for SPA routing
- [ ] `netlify.toml` configuration file added
- [ ] `.env.example` template provided
- [ ] `package.json` build scripts optimized

### **Environment Variables Ready**
- [ ] Supabase URL and keys
- [ ] InstaPay API credentials
- [ ] DeepAI API key
- [ ] Contact information variables

## 🔧 Netlify Configuration

### **1. Site Creation**
```bash
# Option 1: Connect GitHub repository
1. Go to https://app.netlify.com/
2. Click "Add new site" > "Import an existing project"
3. Connect to GitHub and select BRANDY-SHOP repository
4. Configure build settings (see below)

# Option 2: Manual deployment
1. Run: npm run build
2. Drag and drop the 'dist' folder to Netlify
```

### **2. Build Settings**
```
Build command: npm run build
Publish directory: dist
Node version: 18
```

### **3. Deploy Configuration**
The `netlify.toml` file automatically configures:
- Build settings
- Redirect rules for React Router
- Security headers
- Performance optimizations

## 🔐 Environment Variables

### **Required Variables**
Set these in Netlify Dashboard > Site Settings > Environment Variables:

```bash
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://xrqfckeuzzgnwkutxqkx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# InstaPay (REQUIRED for payments)
VITE_INSTAPAY_API_KEY=your_production_api_key
VITE_INSTAPAY_BASE_URL=https://api.instapay.co.ke
VITE_INSTAPAY_ENV=production

# DeepAI (REQUIRED for AI features)
VITE_DEEPAI_API_KEY=2f4d1478-155b-49d3-83be-42394d1a1152

# Application (OPTIONAL)
VITE_APP_NAME=BRANDY-SHOP
VITE_APP_URL=https://brandyshop.netlify.app
VITE_APP_VERSION=1.1.0
```

### **Setting Environment Variables**
1. Go to Netlify Dashboard
2. Select your site
3. Go to Site Settings > Environment Variables
4. Add each variable with its value
5. Redeploy the site

## 🏗️ Build Settings

### **Automatic Builds**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  environment = { NODE_VERSION = "18" }
```

### **Build Optimization**
- **Code Splitting**: Vendor, router, UI, and Supabase chunks
- **Asset Optimization**: Images, fonts, and static files
- **Bundle Size**: Target < 2MB total
- **Source Maps**: Enabled for production debugging

### **Build Commands**
```bash
# Standard build
npm run build

# Build with linting
npm run build:netlify

# Development build
npm run build:dev
```

## 🌐 Domain Configuration

### **Custom Domain Setup**
1. **Add Domain**: Netlify Dashboard > Domain Settings
2. **DNS Configuration**: Point your domain to Netlify
3. **SSL Certificate**: Automatically provisioned by Netlify
4. **Redirects**: Configure www to non-www (or vice versa)

### **Current Configuration**
- **Primary Domain**: `brandyshop.netlify.app`
- **SSL**: Enabled (Let's Encrypt)
- **CDN**: Global edge locations
- **Performance**: Optimized for Kenya/Africa

## 🔍 SPA Routing Configuration

### **The Problem**
React Router handles routing client-side, but when users visit URLs directly (like `/marketplace`), Netlify tries to find those files on the server, resulting in 404 errors.

### **The Solution**
The `_redirects` file tells Netlify to serve `index.html` for all routes:

```
# public/_redirects
/*    /index.html   200
```

### **Advanced Redirects**
```
# API proxying (if needed)
/api/*  https://xrqfckeuzzgnwkutxqkx.supabase.co/rest/v1/:splat  200

# Admin security
/admin-panel/*  /index.html  200

# SPA fallback (must be last)
/*    /index.html   200
```

## 🛡️ Security Configuration

### **Headers**
Automatically configured via `netlify.toml`:
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin

### **Environment Security**
- API keys are server-side only (VITE_ prefix for client-side)
- Supabase RLS protects database access
- Admin routes require authentication

## 🔧 Troubleshooting

### **Common Issues**

#### **404 Errors on Direct URLs**
```
Problem: /marketplace returns 404
Solution: Ensure _redirects file is in public/ folder
Check: _redirects file contains /* /index.html 200
```

#### **Build Failures**
```
Problem: Build fails with TypeScript errors
Solution: Run npm run type-check locally first
Fix: Resolve all TypeScript errors before deploying
```

#### **Environment Variables Not Working**
```
Problem: API calls fail in production
Solution: Check Netlify environment variables are set
Verify: Variable names start with VITE_ for client-side access
```

#### **Large Bundle Size**
```
Problem: Build exceeds size limits
Solution: Check vite.config.ts chunk splitting
Optimize: Remove unused dependencies
```

### **Debug Tools**

#### **Deployment Status Page**
Visit `/deployment-status` to check:
- System health
- Environment variables
- API connectivity
- Build information

#### **Build Logs**
1. Go to Netlify Dashboard
2. Select your site
3. Go to Deploys
4. Click on a deploy to see logs

#### **Function Logs**
```bash
# View real-time logs
netlify dev
netlify functions:log
```

## 📊 Performance Monitoring

### **Metrics to Track**
- **Build Time**: Target < 3 minutes
- **Bundle Size**: Target < 2MB
- **Load Time**: Target < 3s on 3G
- **Lighthouse Score**: Target 90+ all metrics

### **Optimization Tips**
1. **Code Splitting**: Implemented in vite.config.ts
2. **Image Optimization**: Use WebP format
3. **Lazy Loading**: Implement for non-critical components
4. **CDN**: Netlify's global CDN automatically enabled

## 🚀 Deployment Workflow

### **Automatic Deployment**
```bash
# Push to main branch triggers auto-deploy
git add .
git commit -m "Deploy to production"
git push origin main
```

### **Manual Deployment**
```bash
# Build locally and deploy
npm run build
netlify deploy --prod --dir=dist
```

### **Preview Deployments**
- Every pull request gets a preview URL
- Test changes before merging to main
- Share preview links with stakeholders

## 📞 Support

### **Deployment Issues**
- **Email**: vomollo101@gmail.com
- **Phone**: +254714525667
- **GitHub**: https://github.com/SK3CHI3/BRANDY-SHOP/issues

### **Netlify Resources**
- **Documentation**: https://docs.netlify.com/
- **Support**: https://www.netlify.com/support/
- **Community**: https://answers.netlify.com/

---

**Last Updated**: January 2025  
**Version**: 1.1.0  
**Status**: Production Ready ✅
