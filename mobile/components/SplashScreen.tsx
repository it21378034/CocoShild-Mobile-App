import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Dot animations with delay
    const dotAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dotAnim1, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 1,
            duration: 600,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 1,
            duration: 600,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dotAnim1, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim2, {
            toValue: 0,
            duration: 600,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim3, {
            toValue: 0,
            duration: 600,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    dotAnimation.start();

    // Hide splash screen after 3.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3500);

    return () => {
      clearTimeout(timer);
      dotAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* Main Icon Container */}
        <View style={styles.iconContainer}>
          {/* Coconut Leaf Background */}
          <View style={styles.leafBackground}>
            <Ionicons name="leaf" size={100} color="#e8f5e8" />
          </View>
          
          {/* Main Coconut Icon */}
          <View style={styles.mainIcon}>
            <Ionicons name="leaf" size={80} color="#698863" />
          </View>
          
          {/* Shield Overlay */}
          <View style={styles.shieldContainer}>
            <View style={styles.shieldBackground}>
              <Ionicons name="shield-checkmark" size={35} color="#4CAF50" />
            </View>
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>CocoShield</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Protecting Coconut Palms</Text>
        <Text style={styles.subtitle}>AI-Powered Disease Detection</Text>

        {/* Loading Animation */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotAnim1,
                  transform: [{ scale: dotAnim1 }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotAnim2,
                  transform: [{ scale: dotAnim2 }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotAnim3,
                  transform: [{ scale: dotAnim3 }],
                },
              ]}
            />
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="camera" size={16} color="#698863" />
            <Text style={styles.featureText}>Instant Diagnosis</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={16} color="#698863" />
            <Text style={styles.featureText}>Early Detection</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="medical" size={16} color="#698863" />
            <Text style={styles.featureText}>Expert Treatment</Text>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafBackground: {
    position: 'absolute',
    opacity: 0.3,
  },
  mainIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldContainer: {
    position: 'absolute',
    bottom: -15,
    right: -15,
  },
  shieldBackground: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#161212',
    marginBottom: 8,
    letterSpacing: 2,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#698863',
    marginBottom: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 50,
    fontWeight: '400',
    textAlign: 'center',
  },
  loadingContainer: {
    marginBottom: 40,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#698863',
    marginHorizontal: 6,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: '#698863',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  versionText: {
    fontSize: 12,
    color: '#ccc',
    position: 'absolute',
    bottom: -60,
  },
}); 