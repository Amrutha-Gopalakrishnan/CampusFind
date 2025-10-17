#!/bin/bash

# Vercel Deployment script for BelongiFy React App
# This script ensures proper configuration for Vercel SPA routing

echo "🚀 Starting BelongiFy Vercel deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found package.json"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Verify Vercel configuration
if [ -f "vercel.json" ]; then
    echo "✅ Found vercel.json"
    echo "📄 Vercel configuration:"
    cat vercel.json
else
    echo "❌ Error: vercel.json not found - this is required for Vercel deployment"
    exit 1
fi

# Check for Vercel CLI
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI found"
    echo "🚀 Ready to deploy with: vercel --prod"
else
    echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
fi

echo ""
echo "🎉 Vercel deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Commit and push changes:"
echo "   git add ."
echo "   git commit -m 'Fix Vercel SPA routing'"
echo "   git push"
echo ""
echo "2. Deploy to Vercel:"
echo "   Option A: Push to connected Git repository (auto-deploy)"
echo "   Option B: Use Vercel CLI: vercel --prod"
echo "   Option C: Redeploy from Vercel dashboard"
echo ""
echo "3. Test the fix:"
echo "   - Visit: https://campus-find-srcas.vercel.app/dashboard"
echo "   - Refresh the page (F5)"
echo "   - Should work without 404 error"
echo ""
echo "🔧 Vercel Configuration:"
echo "- vercel.json handles SPA routing automatically"
echo "- All routes redirect to index.html"
echo "- Build output goes to 'dist' folder"
echo ""
echo "🚨 Important:"
echo "- Remove netlify.toml and public/_redirects (not needed for Vercel)"
echo "- Ensure vercel.json is in the root directory"
echo "- Check Vercel dashboard for deployment logs if issues persist"
