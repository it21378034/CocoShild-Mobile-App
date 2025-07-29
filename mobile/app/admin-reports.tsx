import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../config/firebase';
import { scale, fontSize, spacing, padding, borderRadius } from '../utils/responsive';

interface ReportCase {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  description: string;
  language: 'english' | 'sinhala';
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  location?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  adminReplies?: AdminReply[];
  nlpAnalysis?: NLPAnalysis;
}

interface AdminReply {
  id: string;
  adminId: string;
  adminName: string;
  message: string;
  timestamp: Date;
}

interface NLPAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  category: string;
  urgency: number;
  language: string;
}

export default function AdminReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ReportCase[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportCase | null>(null);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    // Check if user is admin
    if (!user?.uid || user?.role !== UserRole.ADMIN) {
      Alert.alert('Access Denied', 'Only administrators can access this page.');
      router.back();
      return;
    }

    setLoading(true);
    try {
      const { getDocs, collection, query, orderBy } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      
      // Get all reports for admin
      const q = query(
        collection(db, 'reportCases'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReportCase[];
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'resolved': return '#4CAF50';
      case 'closed': return '#9E9E9E';
      default: return '#FF9800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return 'Pending';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      case 'urgent': return '#9C27B0';
      default: return '#FF9800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      case 'urgent': return 'Urgent';
      default: return 'Medium';
    }
  };

  const getCategoryName = (categoryId: string) => {
    const categories = {
      'disease': 'Disease Outbreak',
      'pest': 'Pest Infestation',
      'nutrient': 'Nutrient Deficiency',
      'weather': 'Weather Damage',
      'soil': 'Soil Issues',
      'irrigation': 'Irrigation Problems',
      'harvest': 'Harvest Issues',
      'other': 'Other',
    };
    return categories[categoryId as keyof typeof categories] || 'Unknown';
  };

  const filteredReports = reports.filter(report => 
    filterStatus === 'all' || report.status === filterStatus
  );

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedReport) return;

    setSubmittingReply(true);
    try {
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      
      // Create reply object
      const reply = {
        id: `reply_${Date.now()}`,
        adminId: user?.uid || 'admin',
        adminName: user?.displayName || 'Admin',
        message: replyMessage.trim(),
        timestamp: new Date(),
      };

      // Update the report with the new reply
      const reportRef = doc(db, 'reportCases', selectedReport.id);
      await updateDoc(reportRef, {
        adminReplies: arrayUnion(reply),
        updatedAt: new Date(),
      });

      // Send email notification to user (optional - Firebase Functions will handle this automatically)
      // await sendEmailNotification(selectedReport.userEmail, selectedReport.title, replyMessage.trim());

      Alert.alert('Success', 'Reply sent successfully and email notification sent');
      setReplyMessage('');
      setShowReplyModal(false);
      fetchReports(); // Refresh reports
    } catch (error) {
      console.error('Error sending reply:', error);
      Alert.alert('Error', 'Failed to send reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const sendEmailNotification = async (userEmail: string, reportTitle: string, replyMessage: string) => {
    try {
      // You can use Firebase Functions or a third-party email service
      // For now, we'll use a simple approach with a cloud function
      const response = await fetch('https://us-central1-your-project-id.cloudfunctions.net/sendEmailNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userEmail,
          subject: `Reply to your report: ${reportTitle}`,
          message: `An admin has replied to your report "${reportTitle}":\n\n${replyMessage}\n\nPlease log in to the app to view the full response.`,
        }),
      });

      if (!response.ok) {
        console.warn('Email notification failed, but reply was saved');
      }
    } catch (error) {
      console.warn('Email notification failed:', error);
      // Don't fail the entire operation if email fails
    }
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    if (updatingStatus === newStatus) return; // Prevent double clicks
    setUpdatingStatus(newStatus);

    try {
      console.log('🔄 Updating status:', reportId, 'to', newStatus);
      
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      
      const reportRef = doc(db, 'reportCases', reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      
      // Update the selectedReport state immediately for UI feedback
      if (selectedReport && selectedReport.id === reportId) {
        const updatedSelectedReport = {
          ...selectedReport,
          status: newStatus as any,
          updatedAt: new Date(),
        };
        setSelectedReport(updatedSelectedReport);
        console.log('✅ Updated selectedReport state:', updatedSelectedReport.status);
      }
      
      // Also update the reports list
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus as any, updatedAt: new Date() }
            : report
        )
      );
      
      console.log('✅ Status updated successfully');
      Alert.alert('Success', `Status updated to ${getStatusText(newStatus)}`);
      
    } catch (error) {
      console.error('❌ Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const renderReportItem = ({ item }: { item: ReportCase }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => {
        setSelectedReport(item);
        setShowReportDetail(true);
      }}
    >
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{item.title}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.reportDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.reportMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.metaText}>{item.userEmail}</Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="flag" size={16} color={getPriorityColor(item.priority)} />
          <Text style={[styles.metaText, { color: getPriorityColor(item.priority) }]}>
            {getPriorityText(item.priority)}
          </Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.metaText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      {item.adminReplies && item.adminReplies.length > 0 && (
        <View style={styles.replyIndicator}>
          <Ionicons name="chatbubble" size={16} color="#4CAF50" />
          <Text style={styles.replyText}>
            {item.adminReplies.length} replies
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Calculate header height (56 is default, plus safe area and extra padding)
  const HEADER_HEIGHT = 56 + insets.top + 24;

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top + 24, paddingBottom: 8, height: HEADER_HEIGHT, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, elevation: 4, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#698863" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Reports</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchReports}
        >
          <Ionicons name="refresh" size={24} color="#698863" />
        </TouchableOpacity>
      </View>
      
      {/* Content below sticky header */}
      <View style={{ flex: 1, marginTop: HEADER_HEIGHT }}>
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['all', 'pending', 'in_progress', 'resolved', 'closed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filterStatus === status && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterTabText,
                filterStatus === status && styles.filterTabTextActive,
              ]}>
                {status === 'all' ? 'All' : getStatusText(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reports List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#698863" />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredReports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        )}
      </View>

      {/* Report Detail Modal */}
      <Modal
        visible={showReportDetail}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReportDetail(false)}
              >
                <Ionicons name="close" size={24} color="#698863" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {selectedReport && (
                <View>
                  <Text style={styles.detailTitle}>{selectedReport.title}</Text>
                  <Text style={styles.detailDescription}>{selectedReport.description}</Text>
                  
                  <View style={styles.detailMeta}>
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>User:</Text>
                      <Text style={styles.detailMetaValue}>{selectedReport.userEmail}</Text>
                    </View>
                    
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>Status:</Text>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(selectedReport.status) }
                      ]}>
                        <Text style={styles.statusText}>
                          {getStatusText(selectedReport.status)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>Priority:</Text>
                      <Text style={[styles.detailMetaValue, { color: getPriorityColor(selectedReport.priority) }]}>
                        {getPriorityText(selectedReport.priority)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>Category:</Text>
                      <Text style={styles.detailMetaValue}>
                        {getCategoryName(selectedReport.category)}
                      </Text>
                    </View>
                    
                    {selectedReport.location && (
                      <View style={styles.detailMetaItem}>
                        <Text style={styles.detailMetaLabel}>Location:</Text>
                        <Text style={styles.detailMetaValue}>{selectedReport.location}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>Date:</Text>
                      <Text style={styles.detailMetaValue}>
                        {new Date(selectedReport.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Status Update Buttons */}
                  <View style={styles.statusButtons}>
                    <Text style={styles.statusButtonsTitle}>Update Status:</Text>
                    <View style={styles.statusButtonRow}>
                      {['pending', 'in_progress', 'resolved', 'closed'].map((status) => {
                        const isActive = selectedReport.status === status;
                        const isUpdating = updatingStatus === status;
                        console.log(`🔘 Status button ${status}:`, { 
                          isActive, 
                          isUpdating, 
                          currentStatus: selectedReport.status 
                        });
                        
                        return (
                          <TouchableOpacity
                            key={status}
                            style={[
                              styles.statusButton,
                              isActive && styles.statusButtonActive,
                              isUpdating && styles.statusButtonUpdating,
                            ]}
                            onPress={() => updateStatus(selectedReport.id, status)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <ActivityIndicator color="#fff" size="small" />
                            ) : (
                              <Text style={[
                                styles.statusButtonText,
                                isActive && styles.statusButtonTextActive,
                              ]}>
                                {getStatusText(status)}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  
                  {/* Admin Replies */}
                  {selectedReport.adminReplies && selectedReport.adminReplies.length > 0 && (
                    <View style={styles.repliesSection}>
                      <Text style={styles.repliesTitle}>Admin Replies:</Text>
                      {selectedReport.adminReplies.map((reply, index) => (
                        <View key={index} style={styles.replyItem}>
                          <View style={styles.replyHeader}>
                            <Text style={styles.replyAuthor}>{reply.adminName}</Text>
                            <Text style={styles.replyDate}>
                              {new Date(reply.timestamp).toLocaleDateString()}
                            </Text>
                          </View>
                          <Text style={styles.replyMessage}>{reply.message}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {/* Reply Form */}
                  <View style={styles.replyForm}>
                    <Text style={styles.replyFormTitle}>Add Reply:</Text>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChangeText={setReplyMessage}
                      multiline
                      numberOfLines={4}
                    />
                    <TouchableOpacity
                      style={[styles.sendReplyButton, submittingReply && styles.sendReplyButtonDisabled]}
                      onPress={handleReply}
                      disabled={submittingReply}
                    >
                      {submittingReply ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.sendReplyButtonText}>Send Reply</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: padding.lg,
    paddingTop: padding.lg,
    paddingBottom: padding.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#131612',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: '#f0f0f0',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: padding.lg,
    paddingVertical: padding.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: padding.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: '#698863',
  },
  filterTabText: {
    fontSize: fontSize.sm,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: padding.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#666',
    marginTop: spacing.md,
  },
  listContent: {
    paddingHorizontal: padding.lg,
    paddingVertical: padding.md,
  },
  reportItem: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    padding: padding.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reportTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: '#131612',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: padding.sm,
    paddingVertical: padding.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: '#fff',
    fontWeight: '500',
  },
  reportDescription: {
    fontSize: fontSize.sm,
    color: '#666',
    marginBottom: spacing.sm,
  },
  reportMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: fontSize.xs,
    color: '#666',
    marginLeft: spacing.xs,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  replyText: {
    fontSize: fontSize.xs,
    color: '#4CAF50',
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: padding.lg,
    paddingVertical: padding.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#131612',
  },
  closeButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingHorizontal: padding.lg,
    paddingVertical: padding.md,
  },
  detailTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#131612',
    marginBottom: spacing.sm,
  },
  detailDescription: {
    fontSize: fontSize.base,
    color: '#666',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  detailMeta: {
    marginBottom: spacing.lg,
  },
  detailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailMetaLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#131612',
    width: scale(80),
  },
  detailMetaValue: {
    fontSize: fontSize.sm,
    color: '#666',
    flex: 1,
  },
  statusButtons: {
    marginBottom: spacing.lg,
  },
  statusButtonsTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: '#131612',
    marginBottom: spacing.sm,
  },
  statusButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusButton: {
    paddingHorizontal: padding.md,
    paddingVertical: padding.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  statusButtonActive: {
    backgroundColor: '#698863',
    borderColor: '#698863',
  },
  statusButtonUpdating: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  statusButtonText: {
    fontSize: fontSize.sm,
    color: '#666',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  repliesSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  repliesTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: '#131612',
    marginBottom: spacing.sm,
  },
  replyItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: borderRadius.md,
    padding: padding.md,
    marginBottom: spacing.sm,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  replyAuthor: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#698863',
  },
  replyDate: {
    fontSize: fontSize.xs,
    color: '#999',
  },
  replyMessage: {
    fontSize: fontSize.sm,
    color: '#666',
    lineHeight: 18,
  },
  replyButton: {
    backgroundColor: '#698863',
    borderRadius: borderRadius.md,
    paddingVertical: padding.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyButtonText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  replyInput: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    paddingHorizontal: padding.md,
    paddingVertical: padding.md,
    fontSize: fontSize.base,
    color: '#131612',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: scale(120),
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  sendReplyButton: {
    backgroundColor: '#698863',
    borderRadius: borderRadius.md,
    paddingVertical: padding.lg,
    alignItems: 'center',
  },
  sendReplyButtonDisabled: {
    opacity: 0.6,
  },
  sendReplyButtonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  replyForm: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  replyFormTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: '#131612',
    marginBottom: spacing.sm,
  },
}); 