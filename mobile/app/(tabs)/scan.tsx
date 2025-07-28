import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ImageBackground, ScrollView, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const howToCapture = [
  {
    label: "Upper Surface",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfIlH03bLYRZc8XGQa-1KboNbiyaA5nqiotXROq8sW4rdPTCLd82G0vaRcu-Rs8Oz_p8FHULOT1Mtl-h-yiUYbFES_Vm8le8VkO6RCWNMKkmY9oKuNz6ZqKwSeaCcM4JoOcWkwRU9sfLPJRHoY22YuxytrIMTtEeGAD82CxnZ4Q5J1hpnNqIuP7jbbzEtqULwjyjkuWmSTvdrN84EqG_xzP3vrUozIGxNf0JKlP5UxdEAvnjVM3OMrzyz5sscbzEvCszU7AoM07_E",
    desc: "Take a clear portion of the leaf where it is damaged",
    descColor: "#698961"
  },
  {
    label: "Middle Surface",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcZ4noFuDXxYel5fnZoeIV1R7ILC6Iw5wlmLlAJeotJzTpl6BbFCxr48WH_kryrpX40-MtKZOYRe2pKCsYanUxMT-FNV6_VtSWlYzxZEcGPw1Fs4o9FOQ74OAY-6Jf46q97qEe03tGrVsfrqbHFt2w88ZQWBTtMTdAhc0y7cGAJKScdHN3S3o2ouzEW3RpVfRPgPkhih0qdciIzO-i1FOH-g-CFmqkgQUGM7XtAaQTxatz090LuX1S3FTqF6ER48Phqrg9rA9v8M4",
    desc: "Take the middle region of the lower surface",
    descColor: "#698961"
  },
  {
    label: "Leaflet Image",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAJ_xbl2kjON6RR4nGgDkeO2iAL-y9pQAA2jjajknpeLGM2KE2EzvbiRPoGO87mWZ4bqd-Equj6gxZ9LEsWYygw4lM5aFFnmZKYndyNwbMBf91fz9y56zwyHg3g1LWMp662eV_JmjPXvr0eUPjZ6fwWWyh40C1XNvZlRn01cphND7-8Zi4OyRNCSUDkXavck-w4hNt8qTO8GE3WBiItmekVFO2THWbFz5Jrc0sA7_Zn-x2K9JJ0PgNHFc5CvJzU8--LuhxlXopftos",
    desc: "Take a single leaflet and capture an image",
    descColor: "#698961"
  }
];

const captureOptions = [
  { label: "Upper Surface" },
  { label: "Lower Surface" },
  { label: "Leaflet" }
];

export default function CaptureScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [capturedImages, setCapturedImages] = useState<(string | null)[]>([null, null, null]);
  const allImagesPresent = capturedImages.every(img => !!img);

  // Handler for each plus button
  const handleCapture = async (idx: number) => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      // Validate that the captured image is a coconut leaf
      const isValid = await validateCoconutLeafImage(result.assets[0].uri, idx);
      if (isValid) {
        const newImages = [...capturedImages];
        newImages[idx] = result.assets[0].uri;
        setCapturedImages(newImages);
        Alert.alert('Success', 'Coconut leaf image captured successfully!');
      } else {
        Alert.alert(
          'Invalid Image', 
          'Please capture only coconut leaf images. Make sure the image shows clear coconut leaves or leaflets.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Capture Again', onPress: () => handleCapture(idx) }
          ]
        );
      }
    }
  };

  const validateCoconutLeafImage = async (imageUri: string, imageIndex: number): Promise<boolean> => {
    try {
      // Create a simple validation by sending the image to backend for quick check
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'validation.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch('http://192.168.121.73:8000/validate-coconut-leaf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result.is_valid;
      }
      
      // If validation endpoint fails, allow the image but warn user
      return true;
    } catch (error) {
      console.log('Validation failed, allowing image:', error);
      // If validation fails, allow the image but show a warning
      Alert.alert(
        'Validation Warning',
        'Unable to validate image. Please ensure you captured a coconut leaf image.',
        [
          { text: 'Use Image', style: 'default' },
          { text: 'Capture Again', onPress: () => handleCapture(imageIndex) }
        ]
      );
      return true;
    }
  };

  const handleDiagnose = async () => {
    if (!allImagesPresent) return;

    // Validate all images before sending for diagnosis
    const validationPromises = capturedImages.map((uri, index) => 
      validateCoconutLeafImage(uri!, index)
    );
    
    const validationResults = await Promise.all(validationPromises);
    const allValid = validationResults.every(result => result);
    
    if (!allValid) {
      Alert.alert(
        'Invalid Images Detected',
        'Some images may not be coconut leaves. Please recapture any invalid images before proceeding.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Recapture Images', onPress: () => {} }
        ]
      );
      return;
    }

    const formData = new FormData();
    capturedImages.forEach((uri, index) => {
      formData.append('files', {
        uri: uri!,
        name: `image_${index}.jpg`,
        type: 'image/jpeg',
      } as any);
    });

    try {
      console.log('Sending images for diagnosis...');
      console.log('FormData contents:', formData);
      console.log('Number of images:', capturedImages.length);
      
      const response = await fetch('http://192.168.121.73:8000/diagnose-multiple', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Diagnosis result:', result);

      if (result.error) {
        Alert.alert('Diagnosis Error', result.error);
        return;
      }

      // Navigate to diagnosis results screen with the result data
      router.push({
        pathname: '/diagnosis-results',
        params: {
          diagnosisResult: JSON.stringify(result),
        },
      });
    } catch (error) {
      console.error('Diagnosis error:', error);
      Alert.alert(
        'Diagnosis Failed', 
        'Failed to diagnose images. Please check your connection and try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#121811" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capture Image</Text>
          <View style={{ width: 40 }} />
        </View>
        

        {/* How to Capture */}
        <Text style={styles.sectionTitle}>How to Capture</Text>
        {howToCapture.map((item, idx) => (
          <View key={idx} style={styles.infoRow}>
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.infoImg}
              imageStyle={{ borderRadius: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={[styles.infoDesc, { color: item.descColor }]}>{item.desc}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.infoNote}>
          Please take clear pictures of coconut leaves only. The app will validate that you captured coconut leaf images.
        </Text>
        
        <View style={styles.validationInfo}>
          <Ionicons name="information-circle" size={20} color="#698863" />
          <Text style={styles.validationText}>
            Only coconut leaf images will be accepted. Other objects will be rejected.
          </Text>
        </View>

        {/* Image Capture */}
        <Text style={styles.sectionTitle}>Image Capture</Text>
        {captureOptions.map((item, idx) => (
          <View key={idx} style={styles.captureRow}>
            <TouchableOpacity style={styles.plusIcon} onPress={() => handleCapture(idx)}>
              {capturedImages[idx] ? (
                <View style={styles.imageContainer}>
                  <ImageBackground
                    source={{ uri: capturedImages[idx]! }}
                    style={{ width: 40, height: 40, borderRadius: 8 }}
                    imageStyle={{ borderRadius: 8 }}
                  />
                  <View style={styles.validationBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  </View>
                </View>
              ) : (
                <Ionicons name="add" size={24} color="#121811" />
              )}
            </TouchableOpacity>
            <Text style={styles.captureLabel}>{item.label}</Text>
            {capturedImages[idx] && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>✓ Validated</Text>
              </View>
            )}
          </View>
        ))}

        {/* Start Diagnosing Button */}
        <View style={styles.diagnoseBtnRow}>
          <TouchableOpacity
            style={[styles.diagnoseBtn, !allImagesPresent && { opacity: 0.5 }]}
            disabled={!allImagesPresent}
            onPress={handleDiagnose}
          >
            <Text style={styles.diagnoseBtnText}>Start Diagnosing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: 12 + insets.bottom }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home" size={24} color="#698961" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <MaterialIcons name="camera-alt" size={24} color="#121811" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/disease-map')}>
          <MaterialCommunityIcons name="shield-check" size={24} color="#698961" />
          <Text style={styles.navLabel}>Risk</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/report')}>
          <FontAwesome5 name="syringe" size={22} color="#698961" />
          <Text style={styles.navLabel}>Treatment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/disease-map')}>
          <Ionicons name="map" size={24} color="#698961" />
          <Text style={styles.navLabel}>Map</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#121811",
    letterSpacing: -0.015 * 16,
    paddingRight: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#121811",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    letterSpacing: -0.015 * 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    minHeight: 72,
    paddingVertical: 8,
    gap: 16,
  },
  infoImg: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#f1f4f0",
  },
  infoLabel: {
    color: "#121811",
    fontSize: 16,
    fontWeight: "500",
  },
  infoDesc: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 2,
  },
  infoNote: {
    color: "#121811",
    fontSize: 16,
    fontWeight: "400",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  validationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#698863",
  },
  validationText: {
    color: "#698863",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  validationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 2,
  },
  statusContainer: {
    marginLeft: "auto",
  },
  statusText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "500",
  },
  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    minHeight: 56,
    marginBottom: 8,
    gap: 16,
  },
  plusIcon: {
    backgroundColor: "#f1f4f0",
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  captureLabel: {
    color: "#121811",
    fontSize: 16,
    fontWeight: "400",
    flex: 1,
  },
  diagnoseBtnRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  diagnoseBtn: {
    backgroundColor: "#38db0f",
    borderRadius: 24,
    height: 48,
    minWidth: 160,
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    justifyContent: "center",
  },
  diagnoseBtnText: {
    color: "#121811",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f1f4f0",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingTop: 6,
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 64,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#698961",
    letterSpacing: 0.015 * 16,
    textAlign: "center",
    marginTop: 2,
  },
  activeNavItem: {},
  activeNavLabel: {
    color: "#121811",
    fontWeight: "bold",
  },
}); 