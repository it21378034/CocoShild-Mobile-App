import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const treeImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhwgAs-j6sr3Tze1goumIM8acDhVNDz0fCFe_VVk2DRLenmVD2-XMz5e4YlUkFdxNKCqazr7-ZtZDkgfz73aBOj93LGHGoai-yMNyRt_SdZCvSgJWzx0cVptExjMMAb0qGWJSWhCm8BB-fCYgDPqBMd0uS7Eqa3Qp6_xOam2XKn1OAnyLABRkvzYUSTF-LEPPhO2-kf1hNuVWligssas1zbcZbbwbMF2caKyqfMJk1g6WYGkxcgYVVABMNPNV6PMwLs9pJzJYaN6M';

export default function DiseasePercentageScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const treeData = {
    leaves: Number(params.leaves ?? 0),
    crown: Number(params.crown ?? 0),
    trunk: Number(params.trunk ?? 0),
  };
  const overall = treeData.leaves + treeData.crown + treeData.trunk;

  const navItems = [
    {
      label: 'Home',
      icon: (color: string) => <Ionicons name="home" size={24} color={color} />, // fixed type
      path: '/',
    },
    {
      label: 'Scan',
      icon: (color: string) => <MaterialIcons name="qr-code-scanner" size={24} color={color} />, // fixed type
      path: '/scan',
    },
    {
      label: 'Risk',
      icon: (color: string) => <MaterialCommunityIcons name="shield-check" size={24} color={color} />, // fixed type
      path: '/DiseasePercentageScreen',
    },
    {
      label: 'Treatment',
      icon: (color: string) => <FontAwesome5 name="syringe" size={22} color={color} />, // fixed type
      path: '/treatment',
    },
    {
      label: 'Map',
      icon: (color: string) => <Ionicons name="map" size={24} color={color} />, // fixed type
      path: '/officers',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}> 
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#161212" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Damage Visualization</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tree Image */}
        <View style={styles.treeImageContainer}>
          <ImageBackground
            source={{ uri: treeImage }}
            style={styles.treeImage}
            imageStyle={{ borderRadius: 16 }}
          />
        </View>

        {/* Overall Damage */}
        <View style={styles.percentagesContainer}>
          <View style={styles.overallRow}>
            <Text style={styles.overallLabel}>Overall Damage</Text>
            <Text style={styles.overallValue}>100%</Text>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: 12 + insets.bottom }]}> 
        {navItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.navItem}
            onPress={() => router.push(item.path as any)}
          >
            <View style={styles.navIcon}>{item.icon('#698863')}</View>
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 20, backgroundColor: '#fff' }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161212',
    letterSpacing: -0.015 * 16,
    paddingRight: 40,
  },
  treeImageContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    padding: 16,
    backgroundColor: '#fff',
  },
  treeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#f2f3f1',
  },
  percentagesContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  overallLabel: {
    color: '#161212',
    fontSize: 16,
    fontWeight: '500',
  },
  overallValue: {
    color: '#161212',
    fontSize: 15,
    fontWeight: '400',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f4f0',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 6,
    justifyContent: 'space-between',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  navIcon: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#698863',
    letterSpacing: 0.015 * 16,
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#161212',
    fontWeight: '600',
  },
}); 