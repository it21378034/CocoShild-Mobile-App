import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, ActivityIndicator, Modal } from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, fontSize, spacing, padding, borderRadius, iconSizes, isSmallDevice, isMediumDevice, isLargeDevice } from '../../utils/responsive';

export default function DashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // State for recent activity
  const [recentStats, setRecentStats] = useState([
    { label: "Total Scans", value: "-" },
    { label: "Healthy", value: "-" },
    { label: "Diseased", value: "-" },
    { label: "Success Rate", value: "-" },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch scan history from backend and calculate stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://192.168.18.73:8001/history");
        const data = await res.json();
        const history = data.history || [];
        const total = history.length;
        const healthy = history.filter((item: any) => item.result.class === "Healthy_Leaves").length;
        const diseased = total - healthy;
        const successRate = total > 0 ? Math.round((healthy / total) * 100) : 0;
        setRecentStats([
          { label: "Total Scans", value: total },
          { label: "Healthy", value: healthy },
          { label: "Diseased", value: diseased },
          { label: "Success Rate", value: `${successRate}%` },
        ]);
      } catch (e) {
        setRecentStats([
          { label: "Total Scans", value: "-" },
          { label: "Healthy", value: "-" },
          { label: "Diseased", value: "-" },
          { label: "Success Rate", value: "-" },
        ]);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Quick Actions (use images if available, fallback to icons)
  const quickActions = [
    {
      label: "Scan Leaf",
      image: null, // require("../assets/images/scan.png"),
      fallbackIcon: <Ionicons name="leaf-outline" size={iconSizes.xl} color="#698863" />,
      onPress: () => router.push('/scan'),
    },
    {
      label: "Treatment Advice",
      image: null, // require("../assets/images/treatment.png"),
      fallbackIcon: <MaterialCommunityIcons name="needle" size={28} color="#698863" />,
      onPress: () => router.push('/treatment'),
    },
    {
      label: "Disease Map",
      image: null, // require("../assets/images/map.png"),
      fallbackIcon: <MaterialCommunityIcons name="map-outline" size={28} color="#698863" />,
      onPress: () => router.push('/disease-map'),
    },
    {
      label: "Scan History",
      image: null, // require("../assets/images/history.png"),
      fallbackIcon: <Ionicons name="time-outline" size={28} color="#698863" />,
      onPress: () => router.push('/history'),
    },
    {
      label: "Contact Officer",
      image: null, // require("../assets/images/contact.png"),
      fallbackIcon: <Ionicons name="people-outline" size={28} color="#698863" />,
      onPress: () => router.push('/officers'),
    },
  ];

  /** Add icons and color accents to Recent Activity stat cards **/
  const statIcons = [
    { name: 'scan', color: '#698863' },
    { name: 'leaf', color: '#4CAF50' },
    { name: 'warning', color: '#FF9800' },
    { name: 'checkmark-circle', color: '#4CAF50' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6fbf7" }}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setSideMenuVisible(true)}>
          <Ionicons name="menu" size={iconSizes.xl} color="#698961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>COCSHIELD</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/profile')}>
          <Ionicons name="person-circle-outline" size={iconSizes['2xl']} color="#698961" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={{ flex: 1, backgroundColor: "#f6fbf7" }} showsVerticalScrollIndicator={false}>
        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.sectionContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#698863" style={{ marginVertical: 24 }} />
          ) : (
            <View style={styles.statsGrid}>
              {recentStats.map((stat, idx) => (
                <View key={idx} style={[styles.statCard, { borderColor: statIcons[idx].color, backgroundColor: '#f6fbf7' }] }>
                  <Ionicons name={statIcons[idx].name as any} size={iconSizes.xl} color={statIcons[idx].color} style={{ marginRight: spacing.sm }} />
                  <View>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.sectionContainer}>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                {action.image ? (
                  <Image source={action.image} style={styles.actionIcon} />
                ) : (
                  <View style={styles.actionIconFallback}>{action.fallbackIcon}</View>
                )}
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Add bottom padding to account for bottom navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Side Menu Modal */}
      <Modal
        visible={sideMenuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSideMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sideMenu}>
            <View style={styles.sideMenuHeader}>
              <Text style={styles.sideMenuTitle}>Menu</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setSideMenuVisible(false)}
              >
                <Ionicons name="close" size={24} color="#698961" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sideMenuContent}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setSideMenuVisible(false); router.push('/profile'); }}
              >
                <Ionicons name="person-outline" size={24} color="#698961" />
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setSideMenuVisible(false); router.push('/settings'); }}
              >
                <Ionicons name="settings-outline" size={24} color="#698961" />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setSideMenuVisible(false); router.push('/history'); }}
              >
                <Ionicons name="time-outline" size={24} color="#698961" />
                <Text style={styles.menuItemText}>Scan History</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setSideMenuVisible(false); router.push('/disease-map'); }}
              >
                <MaterialCommunityIcons name="map-outline" size={24} color="#698961" />
                <Text style={styles.menuItemText}>Disease Map</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setSideMenuVisible(false); router.push('/officers'); }}
              >
                <Ionicons name="people-outline" size={24} color="#698961" />
                <Text style={styles.menuItemText}>Contact Officers</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setSideMenuVisible(false); router.push('/treatment'); }}
              >
                <FontAwesome5 name="syringe" size={22} color="#698961" />
                <Text style={styles.menuItemText}>Treatment Guide</Text>
              </TouchableOpacity>
              
              {/* Logout Button */}
              <View style={styles.logoutContainer}>
                <TouchableOpacity 
                  style={styles.logoutButton} 
                  onPress={() => { 
                    setSideMenuVisible(false); 
                    // Add logout logic here - navigate to login screen
                    router.push('/auth/login'); 
                  }}
                >
                  <Ionicons name="log-out-outline" size={24} color="#dc3545" />
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: 12 + insets.bottom }]}> 
        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('home'); router.push('/'); }}>
          <Ionicons name="home" size={24} color={activeTab === 'home' ? "#121811" : "#698961"} style={styles.navIcon} />
          <Text style={[styles.navLabel, { color: activeTab === 'home' ? "#121811" : "#121811" }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('scan'); router.push('/scan'); }}>
          <MaterialIcons name="qr-code-scanner" size={24} color={activeTab === 'scan' ? "#698961" : "#698961"} style={styles.navIcon} />
          <Text style={[styles.navLabel, { color: activeTab === 'scan' ? "#698961" : "#698961" }]}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('history'); router.push('/history'); }}>
          <Ionicons name="time-outline" size={24} color={activeTab === 'history' ? "#698961" : "#698961"} style={styles.navIcon} />
          <Text style={[styles.navLabel, { color: activeTab === 'history' ? "#698961" : "#698961" }]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('treatment'); router.push('/treatment'); }}>
          <FontAwesome5 name="syringe" size={22} color={activeTab === 'treatment' ? "#698961" : "#698961"} style={styles.navIcon} />
          <Text style={[styles.navLabel, { color: activeTab === 'treatment' ? "#698961" : "#698961" }]}>Treatment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('officers'); router.push('/officers'); }}>
          <Ionicons name="help-circle-outline" size={24} color={activeTab === 'officers' ? "#698961" : "#698961"} style={styles.navIcon} />
          <Text style={[styles.navLabel, { color: activeTab === 'officers' ? "#698961" : "#698961" }]}>Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: padding.lg,
    paddingTop: verticalScale(50),
    paddingBottom: padding.sm,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  headerIcon: {
    width: scale(48),
    height: scale(48),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: fontSize['2xl'],
    fontWeight: "bold",
    color: "#131612",
    letterSpacing: -0.015 * 16,
  },
  sectionTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: "bold",
    color: "#131612",
    paddingHorizontal: padding.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: padding.sm,
    letterSpacing: -0.015 * 16,
  },
  sectionContainer: {
    backgroundColor: "#e3f4e8",
    borderRadius: borderRadius.xl,
    marginHorizontal: padding.sm,
    marginBottom: spacing.lg,
    paddingVertical: padding.sm,
    paddingHorizontal: padding.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: padding.sm,
    paddingBottom: padding.sm,
    justifyContent: "flex-start",
  },
  statCard: {
    minWidth: isSmallDevice ? scale(140) : scale(158),
    flex: 1,
    backgroundColor: '#fff', // will be overridden inline
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#b7e4c7', // will be overridden inline
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginRight: padding.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    color: "#131612",
    fontSize: fontSize.lg,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  statValue: {
    color: "#131612",
    fontSize: fontSize['3xl'],
    fontWeight: "bold",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: padding.sm,
    paddingBottom: spacing['2xl'],
    justifyContent: "flex-start",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#b7e4c7",
    padding: padding.lg,
    marginBottom: spacing.md,
    minWidth: isSmallDevice ? scale(140) : scale(158),
    flex: 1,
    maxWidth: isSmallDevice ? "100%" : "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: {
    width: iconSizes.lg,
    height: iconSizes.lg,
    marginRight: spacing.md,
    resizeMode: "contain",
    tintColor: "#698863",
  },
  actionIconFallback: {
    width: iconSizes.lg,
    height: iconSizes.lg,
    marginRight: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    color: "#131612",
    fontSize: fontSize.lg,
    fontWeight: "bold",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f2f4f1',
    backgroundColor: '#fff', // white background
    paddingHorizontal: padding.lg,
    paddingTop: padding.sm,
    paddingBottom: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  navIcon: {
    fontSize: iconSizes.lg,
    marginBottom: spacing.xs,
  },
  navLabel: {
    fontSize: fontSize.sm,
    color: "#698961",
    fontWeight: "500",
    letterSpacing: 0.015 * 16,
    textAlign: "center",
  },
  // Side Menu Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  sideMenu: {
    width: isSmallDevice ? '85%' : '80%',
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: padding.xl,
    paddingTop: verticalScale(60),
    paddingBottom: padding.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f6fbf7',
  },
  sideMenuTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: '#131612',
  },
  closeButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: '#e3f4e8',
  },
  sideMenuContent: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: padding.xl,
    paddingVertical: padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: '#131612',
    marginLeft: spacing.lg,
  },
  // Logout Button Styles
  logoutContainer: {
    marginTop: 'auto',
    paddingHorizontal: padding.xl,
    paddingVertical: padding.xl,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: padding.lg,
    paddingHorizontal: padding.lg,
    backgroundColor: '#fff5f5',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#dc3545',
    marginLeft: spacing.lg,
  },
});

