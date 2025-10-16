# Vercel Deployment Guide

This guide will help you deploy your HexaPink Next.js application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a cloud MongoDB database
3. **Stripe Account**: For payment processing
4. **Email Service**: SMTP configuration (Gmail, SendGrid, etc.)

## Pre-Deployment Checklist

### ✅ Files Updated for Vercel
- [x] `package.json` - Updated scripts for Vercel
- [x] `next.config.ts` - Optimized for Vercel deployment
- [x] `vercel.json` - Vercel-specific configuration
- [x] `.env.example` - Updated with production variables
- [x] `server.js` - Removed (Vercel uses Next.js built-in server)

### ⚠️ Known Limitations
- **Socket.IO**: Not supported on Vercel (see `SOCKET_IO_MIGRATION.md`)
- **File Uploads**: Limited to 50MB (reduced from 500MB)
- **Function Timeout**: 30-60 seconds max per API route

## Step-by-Step Deployment

### 1. Prepare Your Database

#### MongoDB Atlas Setup:
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist Vercel's IP ranges (0.0.0.0/0 for development)
5. Get your connection string

#### Connection String Format:
```
mongodb+srv://username:password@cluster.mongodb.net/hexapink?retryWrites=true&w=majority
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set production environment
vercel --prod
```

#### Option B: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Import project in Vercel dashboard
4. Configure environment variables

### 3. Configure Environment Variables

In your Vercel dashboard, go to **Settings > Environment Variables** and add:

#### Required Variables:
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hexapink
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/hexapink

# JWT Secrets
JWT_SECRET=your-production-jwt-secret-key
JWT_REFRESH_SECRET=your-production-jwt-refresh-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
EMAIL_FROM=your-production-email@gmail.com

# Stripe (Production Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URLs
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Session
SESSION_SECRET=your-production-session-secret

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENV=production
```

#### Optional Variables:
```bash
# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key

# File Upload
MAX_FILE_SIZE=50mb
UPLOAD_DIR=./public/uploads
```

### 4. Configure Stripe Webhooks

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 5. Test Your Deployment

1. **Basic Functionality**:
   - Visit your Vercel URL
   - Test user registration/login
   - Test file uploads
   - Test payment processing

2. **API Endpoints**:
   - Test all API routes
   - Verify database connections
   - Check email functionality

3. **Performance**:
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Monitor function execution times

## Post-Deployment Configuration

### 1. Custom Domain (Optional)
1. Go to Vercel Dashboard > Domains
2. Add your custom domain
3. Configure DNS records
4. Enable SSL (automatic)

### 2. Monitoring & Analytics
- **Vercel Analytics**: Enable in dashboard
- **Error Tracking**: Consider Sentry integration
- **Performance**: Monitor function logs

### 3. Security Considerations
- Use strong, unique secrets
- Enable HTTPS only
- Configure CORS properly
- Regular security audits

## Troubleshooting

### Common Issues:

#### 1. Build Failures
```bash
# Check build logs in Vercel dashboard
# Common fixes:
- Update dependencies
- Fix TypeScript errors
- Check import paths
```

#### 2. Environment Variables
```bash
# Verify all required variables are set
# Check variable names match exactly
# Ensure no trailing spaces
```

#### 3. Database Connection
```bash
# Verify MongoDB Atlas connection string
# Check IP whitelist includes Vercel
# Test connection from Vercel functions
```

#### 4. File Upload Issues
```bash
# Check file size limits (50MB max)
# Verify multer configuration
# Test with smaller files first
```

### Performance Optimization:

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Implement dynamic imports
3. **Caching**: Configure appropriate cache headers
4. **CDN**: Leverage Vercel's global CDN

## Maintenance

### Regular Tasks:
- Monitor function execution times
- Update dependencies monthly
- Review error logs weekly
- Backup database regularly
- Monitor Stripe webhook deliveries

### Scaling Considerations:
- Vercel Pro for higher limits
- Consider database connection pooling
- Implement caching strategies
- Monitor memory usage

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Stripe Integration](https://stripe.com/docs)

---

**Note**: This deployment removes Socket.IO functionality. See `SOCKET_IO_MIGRATION.md` for alternatives.
