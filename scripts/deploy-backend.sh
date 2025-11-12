#!/bin/bash
# Deploy backend to Firebase Cloud Functions

echo "🚀 Deploying Backend to Firebase Cloud Functions..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not installed. Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null
then
    echo "❌ Not logged in to Firebase. Run: firebase login"
    exit 1
fi

echo "📦 Installing dependencies..."
cd backend
npm install

echo ""
echo "🔧 Building backend..."
# No build step needed for Node.js

echo ""
echo "🚀 Deploying to Firebase Cloud Functions..."
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backend deployed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy the Functions URL from above"
    echo "2. Update frontend-web/.env.production with the URL"
    echo "3. Run: ./scripts/deploy-frontend.sh"
else
    echo ""
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi

