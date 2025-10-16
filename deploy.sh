#!/bin/bash

# Quick Vercel Deployment Script
# Run this script to deploy to Vercel

echo "🚀 Starting Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Build the project first
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "📋 Next steps:"
    echo "1. Configure environment variables in Vercel dashboard"
    echo "2. Set up MongoDB Atlas database"
    echo "3. Configure Stripe webhooks"
    echo "4. Test your deployment"
    echo ""
    echo "📖 See VERCEL_DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Deployment failed. Check the logs above."
    exit 1
fi
