# CocoShield App Icon Setup Guide

## 📱 Required Icon Sizes

### Main App Icon (icon.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Location**: `mobile/assets/images/icon.png`
- **Purpose**: Main app icon for iOS and general use

### Android Adaptive Icon (adaptive-icon.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Location**: `mobile/assets/images/adaptive-icon.png`
- **Purpose**: Android adaptive icon foreground

### Splash Screen Icon (splash-icon.png)
- **Size**: 200x200 pixels (or larger, will be resized)
- **Format**: PNG
- **Location**: `mobile/assets/images/splash-icon.png`
- **Purpose**: Splash screen icon

### Web Favicon (favicon.png)
- **Size**: 32x32 pixels
- **Format**: PNG
- **Location**: `mobile/assets/images/favicon.png`
- **Purpose**: Web browser favicon

## 🎨 CocoShield Icon Design

### Current Icon Elements (from login/signup screens):
- **Main Element**: Green leaf icon
- **Overlay**: White shield with green checkmark
- **Colors**: 
  - Primary Green: `#698863`
  - Checkmark Green: `#4CAF50`
  - Background: White/Transparent

### Recommended Design:
1. **Background**: Transparent or solid color
2. **Leaf Icon**: Large, prominent green leaf
3. **Shield Overlay**: White shield with green checkmark
4. **Text**: "CocoShield" text (optional for larger icons)

## 🔧 Steps to Create App Icons

### Option 1: Using Design Tools (Recommended)

#### Using Figma/Adobe XD:
1. Create a 1024x1024 canvas
2. Design the CocoShield icon with:
   - Green leaf as main element
   - White shield overlay
   - Green checkmark inside shield
3. Export in different sizes:
   - 1024x1024 for main icon
   - 200x200 for splash
   - 32x32 for favicon

#### Using Canva:
1. Create a 1024x1024 design
2. Use the existing icon elements
3. Export in required sizes

### Option 2: Using Online Icon Generators

#### App Icon Generator:
1. Go to https://appicon.co/
2. Upload your 1024x1024 icon
3. Download all required sizes
4. Place files in correct locations

#### Expo Icon Generator:
1. Use Expo's built-in icon generation
2. Place your 1024x1024 icon in the assets folder
3. Run: `npx expo install expo-asset`

## 📁 File Structure

```
mobile/assets/images/
├── icon.png (1024x1024)
├── adaptive-icon.png (1024x1024)
├── splash-icon.png (200x200)
└── favicon.png (32x32)
```

## 🚀 Implementation Steps

### Step 1: Create Icon Images
1. Design your CocoShield icon in 1024x1024
2. Create variations for different sizes
3. Ensure good contrast and visibility

### Step 2: Replace Existing Icons
1. Replace `mobile/assets/images/icon.png`
2. Replace `mobile/assets/images/adaptive-icon.png`
3. Replace `mobile/assets/images/splash-icon.png`
4. Replace `mobile/assets/images/favicon.png`

### Step 3: Test the Icons
1. Run `npx expo start`
2. Test on different devices
3. Verify icon appears correctly

### Step 4: Build and Deploy
1. Run `npx expo build:android` for Android
2. Run `npx expo build:ios` for iOS
3. Verify icons in final builds

## 🎯 Design Tips

### For Best Results:
- **High Contrast**: Ensure icon is visible on light/dark backgrounds
- **Simple Design**: Keep it recognizable at small sizes
- **Consistent Branding**: Match your app's color scheme
- **Test on Devices**: Verify it looks good on actual devices

### Color Recommendations:
- **Primary**: `#698863` (App's green theme)
- **Accent**: `#4CAF50` (Checkmark green)
- **Background**: White or transparent
- **Text**: Dark for contrast

## 🔄 Current Configuration

Your `app.json` is already configured correctly:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#f8f9fa"
      }
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

## 📱 Platform-Specific Notes

### iOS:
- Icon will be automatically rounded
- Ensure important elements are centered
- Test on different iOS versions

### Android:
- Uses adaptive icon system
- Foreground should be centered
- Background color is set to `#f8f9fa`

### Web:
- Favicon appears in browser tabs
- Keep design simple for small size

## ✅ Checklist

- [ ] Create 1024x1024 main icon
- [ ] Create 1024x1024 adaptive icon
- [ ] Create 200x200 splash icon
- [ ] Create 32x32 favicon
- [ ] Replace all icon files
- [ ] Test on development build
- [ ] Test on production build
- [ ] Verify all platforms

## 🆘 Troubleshooting

### Common Issues:
1. **Icon not updating**: Clear cache and rebuild
2. **Wrong size**: Ensure exact pixel dimensions
3. **Poor quality**: Use high-resolution source images
4. **Platform differences**: Test on actual devices

### Commands to Run:
```bash
# Clear cache
npx expo start --clear

# Rebuild
npx expo build:android --clear-cache
npx expo build:ios --clear-cache
```

---

**Note**: Make sure your icon design follows platform guidelines and is recognizable at all sizes! 