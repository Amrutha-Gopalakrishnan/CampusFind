#!/bin/bash

# Deployment script for BelongiFy React App
# This script ensures proper configuration for SPA routing

echo "🚀 Starting BelongiFy deployment preparation..."

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

# Verify redirects file
if [ -f "public/_redirects" ]; then
    echo "✅ Found _redirects file"
    echo "📄 Redirects content:"
    cat public/_redirects
else
    echo "⚠️  Warning: _redirects file not found"
fi

# Verify netlify.toml
if [ -f "netlify.toml" ]; then
    echo "✅ Found netlify.toml"
    echo "📄 Netlify configuration:"
    cat netlify.toml
else
    echo "⚠️  Warning: netlify.toml not found"
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy the 'dist' folder to your hosting platform"
echo "2. Ensure your hosting platform supports SPA routing"
echo "3. Verify that redirects are working by testing /dashboard after deployment"
echo ""
echo "🔧 For Netlify:"
echo "- The netlify.toml and _redirects files should handle routing automatically"
echo "- If issues persist, check Netlify's redirects settings in the dashboard"
echo ""
echo "🔧 For other platforms:"
echo "- Ensure all routes redirect to index.html with 200 status"
echo "- Example: /* -> /index.html (200)"
