#!/bin/bash
# Deploy both backend and frontend to Firebase

echo "🚀 Deploying FieldPay Pro to Firebase..."
echo "================================================"
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

# Deploy Backend
echo "📦 Step 1/2: Deploying Backend..."
echo "================================================"
cd backend
npm install
npm run deploy
cd ..

if [ $? -ne 0 ]; then
    echo "❌ Backend deployment failed. Stopping."
    exit 1
fi

echo ""
echo "✅ Backend deployed successfully!"
echo ""

# Deploy Frontend
echo "📦 Step 2/2: Deploying Frontend..."
echo "================================================"
cd frontend-web
npm install
npm run build
cd ..

firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Full deployment complete!"
    echo ""
    echo "📝 Your application is now live:"
    echo "   - Backend API: Check Firebase Console for Functions URL"
    echo "   - Frontend App: Check Firebase Console for Hosting URL"
    echo ""
    echo "🔍 Verify deployment:"
    echo "   1. Open the Hosting URL in your browser"
    echo "   2. Try logging in with test credentials"
    echo "   3. Check mobile app can connect to API"
else
    echo ""
    echo "❌ Frontend deployment failed."
    exit 1
fi

