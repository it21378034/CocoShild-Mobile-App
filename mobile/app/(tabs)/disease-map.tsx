import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert, TextInput, Modal } from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../config/firebase';

const { width, height } = Dimensions.get('window');

const initialProvinces = [
  { name: 'Northern Province', count: 63, latitude: 9.7, longitude: 80.0, risk: 'high' },
  { name: 'North Central Province', count: 45, latitude: 8.2, longitude: 80.7, risk: 'medium' },
  { name: 'North Western Province', count: 78, latitude: 7.7, longitude: 79.9, risk: 'high' },
  { name: 'Western Province', count: 152, latitude: 6.95, longitude: 79.95, risk: 'low' },
  { name: 'Central Province', count: 89, latitude: 7.3, longitude: 80.7, risk: 'medium' },
  { name: 'Sabaragamuwa Province', count: 67, latitude: 6.6, longitude: 80.4, risk: 'medium' },
  { name: 'Uva Province', count: 34, latitude: 6.9, longitude: 81.2, risk: 'low' },
  { name: 'Eastern Province', count: 56, latitude: 7.8, longitude: 81.6, risk: 'medium' },
  { name: 'Southern Province', count: 91, latitude: 6.2, longitude: 80.7, risk: 'high' },
];

const riskColors: Record<'high' | 'medium' | 'low', string> = {
  high: 'rgba(220, 53, 69, 0.8)',
  medium: 'rgba(255, 193, 7, 0.8)',
  low: 'rgba(40, 167, 69, 0.8)',
};

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
    active: true,
  },
];



export default function DiseaseMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const [provinces, setProvinces] = useState(initialProvinces);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [editCount, setEditCount] = useState('');

  // Refresh user state if not loaded
  useEffect(() => {
    if (!user) {
      refreshUser();
    }
  }, [user, refreshUser]);

  return (
    <View style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#161212" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sri Lanka Disease Map</Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            style={styles.editButton}
          >
            <Ionicons name="create" size={24} color="#698863" />
          </TouchableOpacity>
        )}
      </View>

      {/* Map Container */}
      <View style={[styles.container, { paddingBottom: 0 }]}>
        {/* Left-side Risk Color Indicators */}
        <View style={styles.leftRiskPanel}>
          <Text style={styles.leftRiskTitle}>Risk Levels</Text>
          <View style={styles.leftRiskItem}>
            <View style={[styles.leftRiskDot, { backgroundColor: riskColors.high }]} />
            <Text style={styles.leftRiskText}>High Risk</Text>
          </View>
          <View style={styles.leftRiskItem}>
            <View style={[styles.leftRiskDot, { backgroundColor: riskColors.medium }]} />
            <Text style={styles.leftRiskText}>Medium Risk</Text>
          </View>
          <View style={styles.leftRiskItem}>
            <View style={[styles.leftRiskDot, { backgroundColor: riskColors.low }]} />
            <Text style={styles.leftRiskText}>Low Risk</Text>
          </View>
        </View>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 7.8731,
            longitude: 80.7718,
            latitudeDelta: 3.5,
            longitudeDelta: 3.5,
          }}
          mapType="satellite"
        >
          {provinces.map((prov, idx) => (
            <Marker
              key={idx}
              coordinate={{ latitude: prov.latitude, longitude: prov.longitude }}
              title={prov.name}
              description={`Cases: ${prov.count}`}
            >
              <View style={[
                styles.marker,
                { backgroundColor: riskColors[prov.risk as keyof typeof riskColors] }
              ]}>
                <Text style={styles.markerName} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {prov.name}
                </Text>
                <Text style={styles.markerCount}>{prov.count}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        {navItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.navItem}
            onPress={() => {
              if (item.label === 'Home') {
                router.push('/');
              } else if (item.label === 'Scan') {
                router.push('/scan');
              } else if (item.label === 'Treatment') {
                router.push('/treatment');
              } else if (item.label === 'Support') {
                router.push('/officers');
              } else if (item.label === 'History') {
                router.push('/history');
              }
            }}
          >
            <View style={styles.navIcon}>
              {item.icon(item.active ? "#698961" : "#698863")}
            </View>
            <Text style={[styles.navLabel, item.active && { color: "#698961" }]}> {item.label} </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Admin Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Disease Cases</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#161212" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.provinceList}>
              {provinces.map((province, index) => (
                <View key={index} style={styles.provinceItem}>
                  <View style={styles.provinceInfo}>
                    <Text style={styles.provinceName}>{province.name}</Text>
                    <Text style={styles.provinceCount}>Current: {province.count} cases</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editProvinceButton}
                    onPress={() => {
                      setSelectedProvince(province);
                      setEditCount(province.count.toString());
                    }}
                  >
                    <Ionicons name="create" size={20} color="#698863" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Count Modal */}
      <Modal
        visible={!!selectedProvince}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProvince(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update {selectedProvince?.name}</Text>
              <TouchableOpacity
                onPress={() => setSelectedProvince(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#161212" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.editForm}>
              <Text style={styles.editLabel}>Number of Cases:</Text>
              <TextInput
                style={styles.editInput}
                value={editCount}
                onChangeText={setEditCount}
                keyboardType="numeric"
                placeholder="Enter new case count"
              />
              
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={() => setSelectedProvince(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.saveButton]}
                  onPress={() => {
                    const newCount = parseInt(editCount);
                    if (isNaN(newCount) || newCount < 0) {
                      Alert.alert('Error', 'Please enter a valid number');
                      return;
                    }
                    
                    const updatedProvinces = provinces.map(p => 
                      p.name === selectedProvince.name 
                        ? { ...p, count: newCount }
                        : p
                    );
                    setProvinces(updatedProvinces);
                    setSelectedProvince(null);
                    setEditCount('');
                    Alert.alert('Success', 'Case count updated successfully!');
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#161212",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  marker: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 110,
    maxWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 4,
  },
  markerName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 2,
    width: '100%',
    lineHeight: 14,
  },
  markerCount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  leftRiskPanel: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  leftRiskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#161212',
    marginBottom: 8,
    textAlign: 'center',
  },
  leftRiskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  leftRiskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  leftRiskText: {
    fontSize: 12,
    color: '#161212',
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  editButton: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161212',
  },
  closeButton: {
    padding: 4,
  },
  provinceList: {
    maxHeight: 400,
  },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  provinceInfo: {
    flex: 1,
  },
  provinceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#161212',
    marginBottom: 4,
  },
  provinceCount: {
    fontSize: 14,
    color: '#666',
  },
  editProvinceButton: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  editForm: {
    paddingVertical: 10,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#161212',
    marginBottom: 10,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#698863',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },
});