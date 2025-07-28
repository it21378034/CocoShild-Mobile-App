import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../config/firebase';

interface Report {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
}

export default function ReportsListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin (only regular users can view their own reports)
  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      Alert.alert('Access Denied', 'Administrators should use the admin panel to view reports.');
      router.back();
    }
  }, [user, router]);

  const loadReports = async () => {
    if (!user?.uid) {
      setReports([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'reportCases'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reportsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      
      setReports(reportsList);
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getCategoryName = (categoryId: string) => {
    const categories = {
      disease: 'Disease Outbreak',
      pest: 'Pest Infestation',
      nutrient: 'Nutrient Deficiency',
      weather: 'Weather Damage',
      soil: 'Soil Issues',
      other: 'Other',
    };
    return categories[categoryId as keyof typeof categories] || categoryId;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545',
    };
    return colors[priority as keyof typeof colors] || '#6c757d';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#ffc107',
      in_progress: '#17a2b8',
      resolved: '#28a745',
      closed: '#6c757d',
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const formatDate = (timestamp: any) => {
    let date: Date;
    if (timestamp?.toDate) {
      // Firebase Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // Date object
      date = timestamp;
    } else {
      // String or other
      date = new Date(timestamp);
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#698863" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reports</Text>
        <TouchableOpacity 
          style={styles.newButton} 
          onPress={() => router.push('/report-simple')}
        >
          <Ionicons name="add" size={24} color="#698863" />
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!user?.uid ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Please Login</Text>
            <Text style={styles.emptySubtitle}>
              You need to login to view your reports
            </Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptySubtitle}>
              Submit your first report to get started
            </Text>
            <TouchableOpacity 
              style={styles.newReportButton}
              onPress={() => router.push('/report-simple')}
            >
              <Text style={styles.newReportButtonText}>Create New Report</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.reportsContainer}>
            {reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle} numberOfLines={2}>
                    {report.title}
                  </Text>
                  <View style={styles.reportMeta}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
                      <Text style={styles.priorityText}>{report.priority.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                      <Text style={styles.statusText}>{report.status.replace('_', ' ').toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.reportDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="folder-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{getCategoryName(report.category)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{formatDate(report.createdAt)}</Text>
                  </View>
                </View>

                <Text style={styles.reportDescription} numberOfLines={3}>
                  {report.description}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#131612',
    flex: 1,
    textAlign: 'center',
  },
  newButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  newReportButton: {
    backgroundColor: '#698863',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newReportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportsContainer: {
    padding: 20,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#131612',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 