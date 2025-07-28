import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (using iPhone 12 Pro as base)
const baseWidth = 390;
const baseHeight = 844;

// Responsive scaling functions
export const scale = (size: number) => {
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const verticalScale = (size: number) => {
  const scale = SCREEN_HEIGHT / baseHeight;
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const moderateScale = (size: number, factor = 0.5) => {
  const scale = SCREEN_WIDTH / baseWidth;
  const newSize = size + (scale - 1) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// Responsive font sizes
export const fontSize = {
  xs: scale(10),
  sm: scale(12),
  base: scale(14),
  lg: scale(16),
  xl: scale(18),
  '2xl': scale(20),
  '3xl': scale(24),
  '4xl': scale(28),
  '5xl': scale(32),
};

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  '2xl': scale(24),
  '3xl': scale(32),
  '4xl': scale(40),
  '5xl': scale(48),
};

// Responsive padding/margin
export const padding = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  '2xl': scale(24),
  '3xl': scale(32),
};

// Responsive border radius
export const borderRadius = {
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  '2xl': scale(20),
  full: scale(9999),
};

// Device type detection
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Responsive grid columns
export const getGridColumns = () => {
  if (isSmallDevice) return 1;
  if (isMediumDevice) return 2;
  return 2;
};

// Responsive card width
export const getCardWidth = () => {
  if (isSmallDevice) return '100%';
  if (isMediumDevice) return '48%';
  return '48%';
};

// Responsive image sizes
export const imageSizes = {
  small: scale(32),
  medium: scale(48),
  large: scale(64),
  xl: scale(80),
  '2xl': scale(96),
};

// Responsive icon sizes
export const iconSizes = {
  xs: scale(12),
  sm: scale(16),
  md: scale(20),
  lg: scale(24),
  xl: scale(28),
  '2xl': scale(32),
  '3xl': scale(40),
}; 