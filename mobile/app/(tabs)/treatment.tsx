import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from '../../config/api';

interface Treatment {
  Symptom: string;
  Treatment: string;
  Stage: string;
  Organic_Alternative: string;
  Notes: string;
}

interface TreatmentResponse {
  treatments: Treatment[];
}

export default function TreatmentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('');

  const stages = ['Early', 'Mid', 'Advanced', 'Final'];

  const navItems = [
    {
      label: 'Home',
      icon: (color: string) => <Ionicons name="home" size={24} color={color} />,
      active: false,
    },
    {
      label: 'Scan',
      icon: (color: string) => <MaterialIcons name="qr-code-scanner" size={24} color={color} />,
      active: false,
    },
    {
      label: 'History',
      icon: (color: string) => <Ionicons name="analytics" size={24} color={color} />,
      active: false,
    },
    {
      label: 'Treatment',
      icon: (color: string) => <FontAwesome5 name="syringe" size={22} color={color} />,
      active: true,
    },
    {
      label: 'Support',
      icon: (color: string) => <Ionicons name="help-circle" size={24} color={color} />,
      active: false,
    },
  ];



  useEffect(() => {
    fetchTreatments();
  }, []);

  useEffect(() => {
    filterTreatments();
  }, [treatments, searchQuery, selectedStage]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      console.log('Attempting to fetch treatments from:', API_ENDPOINTS.TREATMENTS);
      const response = await axios.get<TreatmentResponse>(API_ENDPOINTS.TREATMENTS, API_CONFIG);
      console.log('Successfully fetched treatments:', response.data.treatments.length, 'records');
      setTreatments(response.data.treatments);
    } catch (error: any) {
      console.error('Error fetching treatments:', error);
      console.error('Error details:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      Alert.alert(
        'Connection Error', 
        `Failed to load treatment data.\n\nError: ${error.message}\n\nPlease check:\n1. Backend is running\n2. Both devices are on same network\n3. No firewall blocking connection`
      );
    } finally {
      setLoading(false);
    }
  };

  const filterTreatments = () => {
    console.log('Filtering treatments. Total treatments:', treatments.length);
    console.log('Search query:', searchQuery);
    console.log('Selected stage:', selectedStage);
    
    let filtered = treatments;

    if (searchQuery) {
      filtered = filtered.filter(treatment =>
        treatment.Symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.Treatment.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('After search filter:', filtered.length, 'treatments');
    }

    if (selectedStage) {
      filtered = filtered.filter(treatment =>
        treatment.Stage.toLowerCase().includes(selectedStage.toLowerCase())
      );
      console.log('After stage filter:', filtered.length, 'treatments');
    }

    console.log('Final filtered treatments:', filtered.length);
    setFilteredTreatments(filtered);
  };

  const renderTreatmentCard = (treatment: Treatment, index: number) => (
    <View key={index} style={styles.treatmentCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.symptomText}>{treatment.Symptom}</Text>
        <View style={[styles.stageBadge, { backgroundColor: getStageColor(treatment.Stage) }]}>
          <Text style={styles.stageText}>{treatment.Stage}</Text>
        </View>
      </View>
      
      <View style={styles.treatmentSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="medical" size={16} color="#698863" />
          <Text style={styles.sectionTitle}>Primary Treatment</Text>
        </View>
        <Text style={styles.treatmentText}>{treatment.Treatment}</Text>
      </View>

      <View style={styles.treatmentSection}>
        <View style={styles.sectionHeader}>
          <Ionicons name="leaf" size={16} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Organic Alternative</Text>
        </View>
        <Text style={styles.treatmentText}>{treatment.Organic_Alternative}</Text>
      </View>

      {treatment.Notes && (
        <View style={styles.treatmentSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={16} color="#FF9800" />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Text style={styles.notesText}>{treatment.Notes}</Text>
        </View>
      )}
    </View>
  );

  const getStageColor = (stage: string) => {
    if (stage.toLowerCase().includes('early')) return '#4CAF50';
    if (stage.toLowerCase().includes('mid')) return '#FF9800';
    if (stage.toLowerCase().includes('advanced')) return '#F44336';
    if (stage.toLowerCase().includes('final')) return '#9C27B0';
    return '#607D8B';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#698863" />
          <Text style={styles.loadingText}>Loading treatment data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#161212" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Treatment Database</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Fixed Header Section */}
      <View style={styles.fixedHeader}>
        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search symptoms or treatments..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stage Filter */}
        <View style={styles.stageFilterContainer}>
          <Text style={styles.stageFilterTitle}>Filter by Disease Stage</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageFilterScroll}>
            <TouchableOpacity
              style={[styles.stageCard, !selectedStage && styles.stageCardActive]}
              onPress={() => setSelectedStage('')}
              activeOpacity={0.7}
            >
              <View style={[styles.stageIcon, !selectedStage && styles.stageIconActive]}>
                <Ionicons name="apps" size={16} color={!selectedStage ? '#fff' : '#698863'} />
              </View>
              <Text style={[styles.stageCardText, !selectedStage && styles.stageCardTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            
            {stages.map((stage) => (
              <TouchableOpacity
                key={stage}
                style={[styles.stageCard, selectedStage === stage && styles.stageCardActive]}
                onPress={() => setSelectedStage(selectedStage === stage ? '' : stage)}
                activeOpacity={0.7}
              >
                <View style={[styles.stageIcon, selectedStage === stage && styles.stageIconActive]}>
                  {stage === 'Early' && <Ionicons name="leaf" size={16} color={selectedStage === stage ? '#fff' : '#4CAF50'} />}
                  {stage === 'Mid' && <Ionicons name="warning" size={16} color={selectedStage === stage ? '#fff' : '#FF9800'} />}
                  {stage === 'Advanced' && <Ionicons name="alert-circle" size={16} color={selectedStage === stage ? '#fff' : '#F44336'} />}
                  {stage === 'Final' && <Ionicons name="close-circle" size={16} color={selectedStage === stage ? '#fff' : '#9C27B0'} />}
                </View>
                <Text style={[styles.stageCardText, selectedStage === stage && styles.stageCardTextActive]}>
                  {stage}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <View style={styles.resultsCard}>
            <Ionicons name="medical" size={20} color="#698863" />
            <Text style={styles.resultsText}>
              {filteredTreatments.length} treatment{filteredTreatments.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.treatmentsList} 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.treatmentsListContent}
      >
        {filteredTreatments.length > 0 ? (
          filteredTreatments.map((treatment, index) => renderTreatmentCard(treatment, index))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No treatments found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
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
              {item.icon(item.active ? "#121811" : "#698863")}
            </View>
            <Text style={[styles.navLabel, item.active && { color: "#121811" }]}> {item.label} </Text>
          </TouchableOpacity>
        ))}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  fixedHeader: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
    minHeight: 80,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#161212',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#161212',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  stageFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  stageFilterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#161212',
    marginBottom: 8,
    textAlign: 'center',
  },
  stageFilterScroll: {
    paddingHorizontal: 4,
  },
  stageCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginRight: 8,
    minWidth: 60,
  },
  stageCardActive: {
    borderColor: '#698863',
    backgroundColor: '#f0f8f0',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  stageIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stageIconActive: {
    backgroundColor: '#698863',
  },
  stageCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#161212',
    marginBottom: 2,
  },
  stageCardTextActive: {
    color: '#698863',
  },
  stageDescription: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    lineHeight: 12,
  },
  stageDescriptionActive: {
    color: '#698863',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  resultsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#698863',
  },
  resultsText: {
    fontSize: 14,
    color: '#698863',
    fontWeight: '600',
    marginLeft: 8,
  },
  treatmentsList: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
  },
  treatmentsListContent: {
    paddingBottom: 100,
  },
  treatmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  symptomText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#161212',
    marginRight: 8,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  treatmentSection: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#698863',
    marginLeft: 6,
  },
  treatmentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    paddingLeft: 22,
  },
  notesText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
    paddingLeft: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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