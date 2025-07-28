#!/usr/bin/env node

/**
 * OAuth Setup Script for CocoShield
 * This script helps you get your OAuth credentials and update the configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 CocoShield OAuth Setup Helper');
console.log('================================\n');

console.log('📋 To fix the OAuth configuration error, follow these steps:\n');

console.log('1️⃣ GOOGLE OAUTH SETUP:');
console.log('   a) Go to: https://console.firebase.google.com/');
console.log('   b) Select your "cocoshield" project');
console.log('   c) Go to Authentication → Sign-in method');
console.log('   d) Enable Google provider');
console.log('   e) Go to: https://console.cloud.google.com/');
console.log('   f) Create OAuth 2.0 Client IDs for:');
console.log('      - Web application (for Firebase)');
console.log('      - Android application (for mobile app)');
console.log('      - iOS application (for mobile app)\n');

console.log('2️⃣ FACEBOOK OAUTH SETUP:');
console.log('   a) Go to: https://developers.facebook.com/');
console.log('   b) Create a new app or use existing one');
console.log('   c) Add Facebook Login product');
console.log('   d) Go to Firebase Console → Authentication → Sign-in method');
console.log('   e) Enable Facebook provider');
console.log('   f) Add your Facebook App ID and App Secret\n');

console.log('3️⃣ UPDATE CONFIGURATION:');
console.log('   Open: mobile/services/socialAuthService.ts');
console.log('   Replace the placeholder values with your actual credentials:\n');

console.log('   const GOOGLE_CLIENT_ID = "your-actual-google-client-id.apps.googleusercontent.com";');
console.log('   const GOOGLE_CLIENT_SECRET = "your-actual-google-client-secret";');
console.log('   const FACEBOOK_APP_ID = "your-actual-facebook-app-id";');
console.log('   const FACEBOOK_APP_SECRET = "your-actual-facebook-app-secret";\n');

console.log('4️⃣ TEST AUTHENTICATION:');
console.log('   - Run your app');
console.log('   - Try Google sign-in');
console.log('   - Try Facebook sign-in');
console.log('   - Verify user data is saved to Firestore\n');

console.log('📚 For detailed instructions, see: mobile/SOCIAL_AUTH_SETUP.md\n');

console.log('⚠️  SECURITY NOTES:');
console.log('   - Never commit OAuth secrets to version control');
console.log('   - Use environment variables for production');
console.log('   - Keep your credentials secure\n');

console.log('🎉 Once configured, your social authentication will work!');

// Check if the social auth service file exists
const socialAuthPath = path.join(__dirname, 'services', 'socialAuthService.ts');
if (fs.existsSync(socialAuthPath)) {
  console.log('\n✅ socialAuthService.ts file found');
  console.log('📝 Ready for OAuth configuration');
} else {
  console.log('\n❌ socialAuthService.ts file not found');
  console.log('Please ensure the file exists at: mobile/services/socialAuthService.ts');
} 