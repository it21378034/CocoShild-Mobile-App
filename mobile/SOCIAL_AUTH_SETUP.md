# Social Authentication Setup Guide

## Overview
This guide will help you set up Google and Facebook authentication for your CocoShield app.

## Current Status
The Google and Facebook authentication buttons are now functional but require proper OAuth configuration to work. Currently, they show helpful error messages explaining what needs to be configured.

## Setup Instructions

### 1. Google Authentication Setup

#### Step 1: Configure Google OAuth in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your CocoShield project
3. Navigate to **Authentication** > **Sign-in method**
4. Click on **Google** provider
5. Enable Google sign-in
6. Add your **OAuth 2.0 Client ID** and **Client Secret**
7. Configure authorized domains

#### Step 2: Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID for:
   - Web application (for Firebase)
   - Android application (for mobile app)
   - iOS application (for mobile app)

#### Step 3: Update Configuration
Update the `mobile/services/socialAuthService.ts` file with your credentials:

```typescript
// Replace these placeholder values with your actual credentials
const GOOGLE_CLIENT_ID = 'your-actual-google-client-id.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'your-actual-google-client-secret';
```

### 2. Facebook Authentication Setup

#### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add Facebook Login product
4. Configure OAuth redirect URIs

#### Step 2: Configure Facebook OAuth in Firebase Console
1. Go to Firebase Console > Authentication > Sign-in method
2. Click on **Facebook** provider
3. Enable Facebook sign-in
4. Add your **Facebook App ID** and **App Secret**
5. Configure OAuth redirect URI

#### Step 3: Update Configuration
Update the `mobile/services/socialAuthService.ts` file with your credentials:

```typescript
// Replace these placeholder values with your actual credentials
const FACEBOOK_APP_ID = 'your-actual-facebook-app-id';
const FACEBOOK_APP_SECRET = 'your-actual-facebook-app-secret';
```

### 3. React Native Specific Configuration

#### For Android:
1. Add your SHA-1 fingerprint to Firebase project
2. Download `google-services.json` and place it in `android/app/`
3. Configure Android manifest for OAuth redirects

#### For iOS:
1. Add your bundle identifier to Firebase project
2. Download `GoogleService-Info.plist` and add to Xcode project
3. Configure iOS URL schemes for OAuth redirects

### 4. Testing Authentication

Once configured:
1. Test Google sign-in flow
2. Test Facebook sign-in flow
3. Verify user data is saved to Firestore
4. Check that users can access the app after social login

## Troubleshooting

### Common Issues:
1. **"OAuth configuration required"** - Follow setup steps above
2. **"Invalid client ID"** - Check your OAuth credentials
3. **"Redirect URI mismatch"** - Verify redirect URIs in Firebase and OAuth providers
4. **"App not verified"** - For production, verify your app with Google/Facebook

### Debug Steps:
1. Check Firebase Console logs
2. Verify OAuth credentials are correct
3. Test with Firebase Auth emulator
4. Check network requests in browser dev tools

## Security Notes

1. **Never commit OAuth secrets to version control**
2. Use environment variables for sensitive data
3. Implement proper error handling
4. Add rate limiting for authentication attempts
5. Validate user data before saving to Firestore

## Next Steps

After completing the setup:
1. Test both authentication flows
2. Implement proper error handling
3. Add loading states during authentication
4. Consider implementing account linking
5. Add user profile management

## Support

If you encounter issues:
1. Check Firebase documentation
2. Review Google/Facebook developer guides
3. Check Expo documentation for React Native specific issues
4. Verify all configuration steps are completed

## Files Modified

- `mobile/services/socialAuthService.ts` - Main social authentication service
- `mobile/services/firebaseAuthService.ts` - Updated to use social auth service
- `mobile/contexts/AuthContext.tsx` - Added social auth methods
- `mobile/app/auth/login.tsx` - Updated to use real social auth
- `mobile/app/auth/signup.tsx` - Updated to use real social auth
- `mobile/config/firebase.ts` - Added auth providers

The authentication system is now ready for configuration and testing! 