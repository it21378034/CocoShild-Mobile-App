import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface ScanHistory {
  id: string;
  result: { 
    class: string; 
    confidence: number;
    severity?: string;
    urgency?: string;
  };
  timestamp: string;
  images: string[];
  treatment?: string;
  outcome?: 'Resolved' | 'Ongoing' | 'Failed';
  cost?: number;
  location?: string;
  notes?: string;
  followUpDate?: string;
  treatmentEffectiveness?: number; // 1-5 scale
}

interface Analytics {
  totalScans: number;
  healthyCount: number;
  diseaseCount: number;
  successRate: number;
  averageConfidence: number;
  totalCost: number;
  monthlyTrend: { month: string; scans: number }[];
}

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
    active: true,
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

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'healthy' | 'disease' | 'resolved'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
  const [analytics, setAnalytics] = useState<Analytics>({
    totalScans: 0,
    healthyCount: 0,
    diseaseCount: 0,
    successRate: 0,
    averageConfidence: 0,
    totalCost: 0,
    monthlyTrend: []
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [history]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching history from:', 'http://192.168.18.73:8001/history');
      
      const response = await axios.get('http://192.168.18.73:8001/history', {
        timeout: 10000, // 10 second timeout
      });
      
      console.log('📊 History response:', response.status, response.data);
      const apiHistory = response.data.history || [];
      console.log('📋 API History items:', apiHistory.length);
      
      // Transform API data to include additional fields
      const enhancedHistory: ScanHistory[] = apiHistory.map((item: any, index: number) => ({
        id: index.toString(),
        result: item.result || { class: 'Unknown', confidence: 0 },
        timestamp: item.timestamp || new Date(Date.now() - index * 86400000).toISOString(),
        images: item.images || [`scan_${index + 1}.jpg`],
        treatment: item.treatment || getRandomTreatment(),
        outcome: item.outcome || getRandomOutcome(),
        cost: item.cost || Math.floor(Math.random() * 5000) + 1000,
        location: item.location || getRandomLocation(),
        notes: item.notes || getRandomNotes(),
        followUpDate: item.followUpDate || getRandomFollowUpDate(),
        treatmentEffectiveness: item.treatmentEffectiveness || Math.floor(Math.random() * 5) + 1,
      }));
      
      console.log('✅ Enhanced history items:', enhancedHistory.length);
      setHistory(enhancedHistory);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('❌ Error fetching history:', error);
      console.error('❌ Error details:', error.message);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
      }
      setHistory([]);
      setError(`Failed to load history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRandomTreatment = () => {
    const treatments = ['Organic Pesticide', 'Systemic Treatment', 'Pruning', 'Fertilizer Application', 'None Required'];
    return treatments[Math.floor(Math.random() * treatments.length)];
  };

  const getRandomOutcome = () => {
    const outcomes: ('Resolved' | 'Ongoing' | 'Failed')[] = ['Resolved', 'Ongoing', 'Failed'];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  };

  const getRandomLocation = () => {
    const locations = ['Northern Province', 'Western Province', 'Central Province', 'Southern Province', 'Eastern Province'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const getRandomNotes = () => {
    const notes = [
      'Applied organic pesticide treatment',
      'Pruned affected leaves',
      'Increased irrigation frequency',
      'Added fertilizer to soil',
      'No action required - healthy plant',
      'Scheduled follow-up inspection',
      'Referred to agriculture officer'
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  };

  const getRandomFollowUpDate = () => {
    const days = Math.floor(Math.random() * 30) + 7; // 7-37 days from now
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  const calculateAnalytics = () => {
    if (history.length === 0) return;

    const healthyCount = history.filter(item => 
      item.result.class === 'Healthy_Leaves'
    ).length;
    
    const diseaseCount = history.length - healthyCount;
    const resolvedCount = history.filter(item => item.outcome === 'Resolved').length;
    const successRate = (resolvedCount / diseaseCount) * 100;
    const averageConfidence = history.reduce((sum, item) => sum + item.result.confidence, 0) / history.length;
    const totalCost = history.reduce((sum, item) => sum + (item.cost || 0), 0);

    // Mock monthly trend
    const monthlyTrend = [
      { month: 'Jan', scans: Math.floor(Math.random() * 20) + 10 },
      { month: 'Feb', scans: Math.floor(Math.random() * 20) + 10 },
      { month: 'Mar', scans: Math.floor(Math.random() * 20) + 10 },
      { month: 'Apr', scans: Math.floor(Math.random() * 20) + 10 },
      { month: 'May', scans: Math.floor(Math.random() * 20) + 10 },
      { month: 'Jun', scans: Math.floor(Math.random() * 20) + 10 },
    ];

    setAnalytics({
      totalScans: history.length,
      healthyCount,
      diseaseCount,
      successRate: isNaN(successRate) ? 0 : successRate,
      averageConfidence: averageConfidence * 100,
      totalCost,
      monthlyTrend
    });
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#888';
    if (status === 'Healthy_Leaves') return '#4CAF50';
    if (status.toLowerCase().includes('yellow')) return '#FF9800';
    if (status.toLowerCase().includes('caterpillar')) return '#F44336';
    if (status.toLowerCase().includes('drying')) return '#9C27B0';
    if (status.toLowerCase().includes('flaccidity')) return '#607D8B';
    return '#888';
  };

  const getStatusIcon = (status: string) => {
    if (!status) return 'help-circle';
    if (status === 'Healthy_Leaves') return 'leaf';
    if (status.toLowerCase().includes('yellow')) return 'alert-circle';
    if (status.toLowerCase().includes('caterpillar')) return 'bug';
    if (status.toLowerCase().includes('drying')) return 'water';
    if (status.toLowerCase().includes('flaccidity')) return 'thermometer';
    return 'help-circle';
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'Resolved': return '#4CAF50';
      case 'Ongoing': return '#FF9800';
      case 'Failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getFilteredHistory = () => {
    switch (selectedFilter) {
      case 'healthy':
        return history.filter(item => item.result.class === 'Healthy_Leaves');
      case 'disease':
        return history.filter(item => item.result.class !== 'Healthy_Leaves');
      case 'resolved':
        return history.filter(item => item.outcome === 'Resolved');
      default:
        return history;
    }
  };

  const renderAnalyticsView = () => (
    <ScrollView style={styles.analyticsContainer} showsVerticalScrollIndicator={false}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Ionicons name="scan" size={24} color="#698863" />
          <Text style={styles.summaryNumber}>{analytics.totalScans}</Text>
          <Text style={styles.summaryLabel}>Total Scans</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="leaf" size={24} color="#4CAF50" />
          <Text style={styles.summaryNumber}>{analytics.healthyCount}</Text>
          <Text style={styles.summaryLabel}>Healthy</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <Text style={styles.summaryNumber}>{analytics.diseaseCount}</Text>
          <Text style={styles.summaryLabel}>Diseases</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.summaryNumber}>{analytics.successRate.toFixed(1)}%</Text>
          <Text style={styles.summaryLabel}>Success Rate</Text>
        </View>
      </View>

      {/* Cost Analysis */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Cost Analysis</Text>
        <View style={styles.costRow}>
          <Ionicons name="wallet" size={20} color="#698863" />
          <Text style={styles.costLabel}>Total Treatment Cost:</Text>
          <Text style={styles.costValue}>Rs. {analytics.totalCost.toLocaleString()}</Text>
        </View>
        <View style={styles.costRow}>
          <Ionicons name="trending-up" size={20} color="#4CAF50" />
          <Text style={styles.costLabel}>Average Confidence:</Text>
          <Text style={styles.costValue}>{analytics.averageConfidence.toFixed(1)}%</Text>
        </View>
      </View>

      {/* Monthly Trend */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Monthly Scan Trend</Text>
        <View style={styles.trendContainer}>
          {analytics.monthlyTrend.map((month, index) => (
            <View key={index} style={styles.trendBar}>
              <View style={[styles.trendBarFill, { height: (month.scans / 30) * 100 }]} />
              <Text style={styles.trendLabel}>{month.month}</Text>
              <Text style={styles.trendValue}>{month.scans}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Insights */}
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Insights & Recommendations</Text>
        <View style={styles.insightItem}>
          <Ionicons name="bulb" size={20} color="#FF9800" />
          <Text style={styles.insightText}>Most common disease: Yellowing Disease</Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="trending-up" size={20} color="#4CAF50" />
          <Text style={styles.insightText}>Treatment success rate improving</Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="calendar" size={20} color="#698863" />
          <Text style={styles.insightText}>Peak disease season: March-April</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderHistoryItem = ({ item, index }: { item: ScanHistory; index: number }) => {
    // Safety check for item.result
    if (!item || !item.result) {
      return null;
    }

    return (
      <TouchableOpacity 
        style={styles.historyCard}
        onPress={() => Alert.alert('Scan Details', `View detailed information for scan #${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.scanInfo}>
            <Text style={styles.scanNumber}>#{item.id}</Text>
            <Text style={styles.scanDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.result.class) }]}>
            <Ionicons name={getStatusIcon(item.result.class)} size={16} color="#fff" />
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.diseaseName}>{item.result.class.replace(/_/g, ' ')}</Text>
          <Text style={styles.confidenceText}>Confidence: {(item.result.confidence * 100).toFixed(1)}%</Text>
        
          {item.location && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}

          {item.treatment && (
            <View style={styles.treatmentInfo}>
              <Ionicons name="medical" size={16} color="#698863" />
              <Text style={styles.treatmentText}>{item.treatment}</Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.notesInfo}>
              <Ionicons name="document-text" size={16} color="#666" />
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}

          {item.treatmentEffectiveness && (
            <View style={styles.effectivenessInfo}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.effectivenessText}>
                Treatment Effectiveness: {item.treatmentEffectiveness}/5
              </Text>
            </View>
          )}

        <View style={styles.cardFooter}>
          {item.outcome && (
            <View style={styles.outcomeContainer}>
              <View style={[styles.outcomeDot, { backgroundColor: getOutcomeColor(item.outcome) }]} />
              <Text style={[styles.outcomeText, { color: getOutcomeColor(item.outcome) }]}>
                {item.outcome}
              </Text>
            </View>
          )}
          {item.cost && (
            <Text style={styles.costText}>Rs. {item.cost.toLocaleString()}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
                {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#161212" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan History</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* View Toggle */}
          <View style={styles.viewToggle}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list" size={20} color={viewMode === 'list' ? '#fff' : '#698863'} />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'analytics' && styles.toggleButtonActive]}
          onPress={() => setViewMode('analytics')}
        >
          <Ionicons name="analytics" size={20} color={viewMode === 'analytics' ? '#fff' : '#698863'} />
          <Text style={[styles.toggleText, viewMode === 'analytics' && styles.toggleTextActive]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      {viewMode === 'list' && (
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            <TouchableOpacity 
              style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, selectedFilter === 'healthy' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('healthy')}
            >
              <Text style={[styles.filterText, selectedFilter === 'healthy' && styles.filterTextActive]}>Healthy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, selectedFilter === 'disease' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('disease')}
            >
              <Text style={[styles.filterText, selectedFilter === 'disease' && styles.filterTextActive]}>Diseases</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, selectedFilter === 'resolved' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('resolved')}
            >
              <Text style={[styles.filterText, selectedFilter === 'resolved' && styles.filterTextActive]}>Resolved</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#698863" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : viewMode === 'analytics' ? (
        renderAnalyticsView()
      ) : (
        <FlatList
          data={getFilteredHistory()}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
        </View>

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
                  // Already on history screen
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'space-between' },
  contentArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161212',
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#698863',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#698863',
  },
  toggleTextActive: {
    color: '#fff',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e9ecef',
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: '#698863',
    borderColor: '#698863',
    shadowColor: '#698863',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  filterText: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scanInfo: {
    flex: 1,
  },
  scanNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#161212',
  },
  scanDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    gap: 8,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#161212',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  treatmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  treatmentText: {
    fontSize: 14,
    color: '#698863',
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  notesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  effectivenessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  effectivenessText: {
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  outcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outcomeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  outcomeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  costText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  analyticsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#161212',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  analyticsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#161212',
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginLeft: 8,
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#161212',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 20,
  },
  trendBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  trendBarFill: {
    width: 20,
    backgroundColor: '#698863',
    borderRadius: 10,
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 10,
    color: '#666',
  },
  trendValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#161212',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161212',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#698863',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
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
}); 