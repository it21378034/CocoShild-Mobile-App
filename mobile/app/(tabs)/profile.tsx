import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const navItems = [
    {
      label: "Home",
      icon: (color: string) => <Ionicons name="home" size={24} color={color} />,
      active: false,
    },
    {
      label: "Scan",
      icon: (color: string) => <MaterialIcons name="qr-code-scanner" size={24} color={color} />,
      active: false,
    },
    {
      label: "History",
      icon: (color: string) => <Ionicons name="analytics" size={24} color={color} />,
      active: false,
    },
    {
      label: "Treatment",
      icon: (color: string) => <FontAwesome5 name="syringe" size={22} color={color} />,
      active: false,
    },
    {
      label: "Support",
      icon: (color: string) => <Ionicons name="help-circle" size={24} color={color} />,
      active: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#698863" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            
            {/* Profile Image */}
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImageWrapper}>
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color="#698863" />
                </View>
              </View>
              <Text style={styles.profileImageText}>Profile Picture</Text>
            </View>

            {/* User Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="person" size={20} color="#698863" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Display Name</Text>
                  <Text style={styles.detailValue}>
                    {user?.displayName || 'Not set'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="mail" size={20} color="#698863" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email Address</Text>
                  <Text style={styles.detailValue}>
                    {user?.email || 'Not available'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons 
                    name={user?.role === 'admin' ? 'shield' : 'person'} 
                    size={20} 
                    color="#698863" 
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Account Type</Text>
                  <Text style={styles.detailValue}>
                    {user?.role === 'admin' ? 'Administrator' : 'Regular User'}
                  </Text>
                </View>
              </View>


            </View>
          </View>

          {/* Account Status */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>Account Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                <Text style={styles.statusText}>Account Active</Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                <Text style={styles.statusText}>
                  {user?.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, { paddingBottom: 12 + insets.bottom }]}>
          {navItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.navItem}
              onPress={() => {
                if (item.label === 'Home') {
                  router.push('/');
                } else if (item.label === 'Scan') {
                  router.push('/scan');
                } else if (item.label === 'History') {
                  router.push('/history');
                } else if (item.label === 'Treatment') {
                  router.push('/treatment');
                } else if (item.label === 'Support') {
                  router.push('/officers');
                }
              }}
            >
              <View style={styles.navIcon}>
                {item.icon(item.active ? "#121811" : "#698863")}
              </View>
              <Text style={[styles.navLabel, item.active && { color: "#121811" }]}> {item.label} </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#161212',
  },
  placeholder: {
    width: 40,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161212',
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  profileImageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  detailsContainer: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#161212',
  },
  statusSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCard: {
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#161212',
    marginLeft: 12,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    justifyContent: "space-between",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  navIcon: {
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#698863",
    letterSpacing: 0.015 * 16,
    textAlign: "center",
  },
}); 