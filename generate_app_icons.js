#!/usr/bin/env node

/**
 * CocoShield App Icon Generator
 * 
 * This script helps generate all required app icon sizes from a single source image.
 * 
 * Prerequisites:
 * 1. Install sharp: npm install sharp
 * 2. Place your 1024x1024 source icon as 'source-icon.png' in the mobile/assets/images/ folder
 * 
 * Usage:
 * node generate_app_icons.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, 'mobile', 'assets', 'images');
const SOURCE_ICON = path.join(ASSETS_DIR, 'source-icon.png');

// Required icon sizes and their filenames
const ICON_SIZES = [
  { size: 1024, filename: 'icon.png', description: 'Main app icon' },
  { size: 1024, filename: 'adaptive-icon.png', description: 'Android adaptive icon' },
  { size: 200, filename: 'splash-icon.png', description: 'Splash screen icon' },
  { size: 32, filename: 'favicon.png', description: 'Web favicon' },
];

async function generateIcons() {
  console.log('🎨 CocoShield App Icon Generator');
  console.log('================================\n');

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error('❌ Source icon not found!');
    console.log('Please place your 1024x1024 source icon as "source-icon.png" in:');
    console.log(ASSETS_DIR);
    console.log('\nExpected file: mobile/assets/images/source-icon.png');
    return;
  }

  console.log('✅ Source icon found');
  console.log('📁 Generating icons...\n');

  try {
    for (const iconConfig of ICON_SIZES) {
      const outputPath = path.join(ASSETS_DIR, iconConfig.filename);
      
      await sharp(SOURCE_ICON)
        .resize(iconConfig.size, iconConfig.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${iconConfig.filename} (${iconConfig.size}x${iconConfig.size}) - ${iconConfig.description}`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log('\n📱 Next steps:');
    console.log('1. Test your app: npx expo start');
    console.log('2. Build for Android: npx expo build:android');
    console.log('3. Build for iOS: npx expo build:ios');
    console.log('\n📁 Generated files:');
    ICON_SIZES.forEach(icon => {
      console.log(`   - ${icon.filename}`);
    });

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\n💡 Make sure you have installed sharp:');
    console.log('   npm install sharp');
  }
}

// Check if sharp is installed
try {
  require('sharp');
  generateIcons();
} catch (error) {
  console.error('❌ Sharp library not found!');
  console.log('\n📦 Please install sharp first:');
  console.log('   npm install sharp');
  console.log('\nThen run this script again.');
} 