#!/bin/bash
# Deploy frontend to Firebase Hosting

echo "🚀 Deploying Frontend to Firebase Hosting..."
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
cd frontend-web
npm install

echo ""
echo "🔧 Building production bundle..."
npm run build

if [ ! -d "build" ]; then
    echo "❌ Build directory not found. Build failed."
    exit 1
fi

echo ""
echo "🚀 Deploying to Firebase Hosting..."
cd ..
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Frontend deployed successfully!"
    echo ""
    echo "📝 Your app is live at the URL shown above."
else
    echo ""
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi

