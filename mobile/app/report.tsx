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
import { scale, fontSize, spacing, padding, borderRadius } from '../utils/responsive';

// Report Case Interface
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
  isLocal?: boolean; // For local storage fallback
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

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'create' | 'list'>('create');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<'english' | 'sinhala'>('english');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [location, setLocation] = useState('');

  // UI state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [reports, setReports] = useState<ReportCase[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportCase | null>(null);
  const [showReportDetail, setShowReportDetail] = useState(false);

  // Categories
  const categories = [
    { id: 'disease', name: 'Disease Outbreak', icon: '🦠' },
    { id: 'pest', name: 'Pest Infestation', icon: '🐛' },
    { id: 'nutrient', name: 'Nutrient Deficiency', icon: '🌱' },
    { id: 'weather', name: 'Weather Damage', icon: '🌦️' },
    { id: 'soil', name: 'Soil Issues', icon: '🌍' },
    { id: 'irrigation', name: 'Irrigation Problems', icon: '💧' },
    { id: 'harvest', name: 'Harvest Issues', icon: '🌾' },
    { id: 'other', name: 'Other', icon: '❓' },
  ];

  // Sinhala categories
  const sinhalaCategories = [
    { id: 'disease', name: 'රෝග පැතිරීම', icon: '🦠' },
    { id: 'pest', name: 'කෘමි ආක්‍රමණය', icon: '🐛' },
    { id: 'nutrient', name: 'පෝෂණ ඌණතාව', icon: '🌱' },
    { id: 'weather', name: 'කාලගුණ හානිය', icon: '🌦️' },
    { id: 'soil', name: 'මාධ්‍ය ගැටළු', icon: '🌍' },
    { id: 'irrigation', name: 'ජලය සැපයීමේ ගැටළු', icon: '💧' },
    { id: 'harvest', name: 'අස්වැන්න ගැටළු', icon: '🌾' },
    { id: 'other', name: 'වෙනත්', icon: '❓' },
  ];

  // Priorities
  const priorities = [
    { id: 'low', name: 'Low', color: '#4CAF50', icon: '🔵' },
    { id: 'medium', name: 'Medium', color: '#FF9800', icon: '🟡' },
    { id: 'high', name: 'High', color: '#F44336', icon: '🟠' },
    { id: 'urgent', name: 'Urgent', color: '#9C27B0', icon: '🔴' },
  ];

  // Sinhala priorities
  const sinhalaPriorities = [
    { id: 'low', name: 'අඩු', color: '#4CAF50', icon: '🔵' },
    { id: 'medium', name: 'මධ්‍යම', color: '#FF9800', icon: '🟡' },
    { id: 'high', name: 'ඉහළ', color: '#F44336', icon: '🟠' },
    { id: 'urgent', name: 'හදිසි', color: '#9C27B0', icon: '🔴' },
  ];

  // Languages
  const languages = [
    { id: 'english', name: 'English', flag: '🇺🇸' },
    { id: 'sinhala', name: 'සිංහල', flag: '🇱🇰' },
  ];

  useEffect(() => {
    if (viewMode === 'list') {
      fetchReports();
    }
  }, [viewMode]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      console.log('Fetching reports for user:', user?.uid);
      
      // Fetch from local storage (primary source for now)
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const localReports = await AsyncStorage.default.getItem('localReports');
        console.log('Raw local reports data:', localReports);
        
        if (localReports) {
          const localData = JSON.parse(localReports) as ReportCase[];
          // Show all reports for now (not filtered by user)
          console.log('All local reports:', localData.length);
          setReports(localData);
        } else {
          console.log('No local reports found');
          setReports([]);
        }
      } catch (localError) {
        console.error('Local storage fetch failed:', localError);
        setReports([]);
      }
      
      // Try Firebase as secondary (don't fail if it doesn't work)
      try {
        const { getDocs, collection, query, where, orderBy } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        
        const q = query(
          collection(db, 'reportCases'),
          where('userId', '==', user?.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const firebaseReports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ReportCase[];
        
        console.log('Fetched reports from Firebase:', firebaseReports.length);
        
        // Combine with local reports
        setReports(prev => {
          const combined = [...prev, ...firebaseReports];
          return combined.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          });
        });
      } catch (firebaseError) {
        console.warn('Firebase fetch failed (but local fetch succeeded):', firebaseError);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const categoryList = language === 'sinhala' ? sinhalaCategories : categories;
    return categoryList.find(cat => cat.id === categoryId)?.name || 'Select Category';
  };

  const getPriorityName = (priorityId: string) => {
    const priorityList = language === 'sinhala' ? sinhalaPriorities : priorities;
    return priorityList.find(pri => pri.id === priorityId)?.name || 'Select Priority';
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
    if (language === 'sinhala') {
      switch (status) {
        case 'pending': return 'පොරොත්තුවෙන්';
        case 'in_progress': return 'ක්‍රියාත්මක';
        case 'resolved': return 'විසඳන ලදී';
        case 'closed': return 'වසා දමන ලදී';
        default: return 'පොරොත්තුවෙන්';
      }
    } else {
      switch (status) {
        case 'pending': return 'Pending';
        case 'in_progress': return 'In Progress';
        case 'resolved': return 'Resolved';
        case 'closed': return 'Closed';
        default: return 'Pending';
      }
    }
  };

  const handleSubmit = async () => {
    // Simple validation
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      // Simple report object
      const report = {
        id: `report_${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        language,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save to local storage (simple approach)
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const existing = await AsyncStorage.default.getItem('reports');
      const reports = existing ? JSON.parse(existing) : [];
      reports.push(report);
      await AsyncStorage.default.setItem('reports', JSON.stringify(reports));

      // Success
      Alert.alert('Success', 'Report submitted successfully!', [
        { text: 'OK', onPress: () => {
          // Clear form
          setTitle('');
          setDescription('');
          setCategory('');
          setLocation('');
          setViewMode('list');
        }}
      ]);
      
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const analyzeText = async (text: string, lang: string): Promise<NLPAnalysis> => {
    try {
      const response = await fetch('http://192.168.18.73:8001/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language: lang }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('NLP analysis failed:', error);
    }

    return {
      sentiment: 'neutral',
      keywords: [],
      category: 'general',
      urgency: 0.5,
      language: lang,
    };
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      console.log('Testing Firebase connection...');
      const { getDocs, collection } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      
      const testQuery = await getDocs(collection(db, 'test'));
      console.log('Firebase connection successful!');
      Alert.alert('Success', 'Firebase connection is working!');
    } catch (error) {
      console.error('Firebase connection failed:', error);
      Alert.alert('Error', `Firebase connection failed: ${error}`);
    }
  };

  // Test user authentication
  const testUserAuth = () => {
    console.log('Current user:', user);
    console.log('User ID:', user?.uid);
    console.log('User email:', user?.email);
    
    if (user?.uid) {
      Alert.alert('User Info', `Logged in as: ${user.email}\nID: ${user.uid}`);
    } else {
      Alert.alert('User Info', 'No user logged in');
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
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.metaText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="flag" size={16} color="#666" />
          <Text style={styles.metaText}>
            {getPriorityName(item.priority)}
          </Text>
        </View>
        
        {item.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
        )}
      </View>
      
      {item.adminReplies && item.adminReplies.length > 0 && (
        <View style={styles.replyIndicator}>
          <Ionicons name="chatbubble" size={16} color="#4CAF50" />
          <Text style={styles.replyText}>
            {item.adminReplies.length} {language === 'sinhala' ? 'පිළිතුරු' : 'replies'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCreateForm = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Language Selector */}
      <View style={styles.languageSelector}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.languageButton,
              language === lang.id && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage(lang.id as 'english' | 'sinhala')}
          >
            <Text style={styles.languageFlag}>{lang.flag}</Text>
            <Text style={[
              styles.languageText,
              language === lang.id && styles.languageTextActive,
            ]}>
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'sinhala' ? 'මාතෘකාව' : 'Title'} *
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={language === 'sinhala' ? 'මාතෘකාව ඇතුළත් කරන්න' : 'Enter title'}
            placeholderTextColor="#999"
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'sinhala' ? 'වර්ගය' : 'Category'} *
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[
              styles.selectorText,
              !category && styles.selectorPlaceholder,
            ]}>
              {getCategoryName(category)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#698863" />
          </TouchableOpacity>
        </View>

        {/* Priority */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'sinhala' ? 'ප්‍රමුඛතාව' : 'Priority'} *
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowPriorityModal(true)}
          >
            <Text style={[
              styles.selectorText,
              !priority && styles.selectorPlaceholder,
            ]}>
              {getPriorityName(priority)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#698863" />
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'sinhala' ? 'ස්ථානය' : 'Location'}
          </Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder={language === 'sinhala' ? 'ස්ථානය ඇතුළත් කරන්න' : 'Enter location (optional)'}
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {language === 'sinhala' ? 'විස්තර' : 'Description'} *
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={
              language === 'sinhala' 
                ? 'ඔබගේ ගැටළුව විස්තරාත්මකව විස්තර කරන්න...' 
                : 'Describe your issue in detail...'
            }
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

                  {/* Test Buttons */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#FF9800', marginBottom: spacing.sm }]}
            onPress={testFirebaseConnection}
          >
            <Text style={styles.submitButtonText}>
              Test Firebase Connection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#2196F3', marginBottom: spacing.md }]}
            onPress={testUserAuth}
          >
            <Text style={styles.submitButtonText}>
              Test User Authentication
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {language === 'sinhala' ? 'වාර්තාව ඉදිරිපත් කරන්න' : 'Submit Report'}
              </Text>
            )}
          </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderReportList = () => (
    <View style={styles.listContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#698863" />
          <Text style={styles.loadingText}>
            {language === 'sinhala' ? 'වාර්තා ලබා ගනිමින්...' : 'Loading reports...'}
          </Text>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {language === 'sinhala' ? 'වාර්තා නැත' : 'No reports yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {language === 'sinhala' 
              ? 'ඔබගේ පළමු වාර්තාව ඉදිරිපත් කරන්න' 
              : 'Submit your first report'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

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
        <Text style={styles.headerTitle}>
          {language === 'sinhala' ? 'වාර්තා කිරීම' : 'Report Cases'}
        </Text>
        <TouchableOpacity 
          style={styles.modeButton} 
          onPress={() => setViewMode(viewMode === 'create' ? 'list' : 'create')}
        >
          <Ionicons 
            name={viewMode === 'create' ? 'list' : 'add'} 
            size={24} 
            color="#698863" 
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'create' ? renderCreateForm() : renderReportList()}

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'sinhala' ? 'වර්ගය තෝරන්න' : 'Select Category'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Ionicons name="close" size={24} color="#698863" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {(language === 'sinhala' ? sinhalaCategories : categories).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(cat.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemIcon}>{cat.icon}</Text>
                  <Text style={styles.modalItemText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Priority Modal */}
      <Modal
        visible={showPriorityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'sinhala' ? 'ප්‍රමුඛතාව තෝරන්න' : 'Select Priority'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPriorityModal(false)}
              >
                <Ionicons name="close" size={24} color="#698863" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {(language === 'sinhala' ? sinhalaPriorities : priorities).map((pri) => (
                <TouchableOpacity
                  key={pri.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setPriority(pri.id as any);
                    setShowPriorityModal(false);
                  }}
                >
                  <Text style={styles.modalItemIcon}>{pri.icon}</Text>
                  <Text style={styles.modalItemText}>{pri.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              <Text style={styles.modalTitle}>
                {language === 'sinhala' ? 'වාර්තා විස්තර' : 'Report Details'}
              </Text>
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
                      <Text style={styles.detailMetaLabel}>
                        {language === 'sinhala' ? 'ස්ථානය' : 'Status'}:
                      </Text>
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
                      <Text style={styles.detailMetaLabel}>
                        {language === 'sinhala' ? 'ප්‍රමුඛතාව' : 'Priority'}:
                      </Text>
                      <Text style={styles.detailMetaValue}>
                        {getPriorityName(selectedReport.priority)}
                      </Text>
                    </View>
                    
                    {selectedReport.location && (
                      <View style={styles.detailMetaItem}>
                        <Text style={styles.detailMetaLabel}>
                          {language === 'sinhala' ? 'ස්ථානය' : 'Location'}:
                        </Text>
                        <Text style={styles.detailMetaValue}>{selectedReport.location}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailMetaItem}>
                      <Text style={styles.detailMetaLabel}>
                        {language === 'sinhala' ? 'දිනය' : 'Date'}:
                      </Text>
                      <Text style={styles.detailMetaValue}>
                        {new Date(selectedReport.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  {selectedReport.adminReplies && selectedReport.adminReplies.length > 0 && (
                    <View style={styles.repliesSection}>
                      <Text style={styles.repliesTitle}>
                        {language === 'sinhala' ? 'පිළිතුරු' : 'Admin Replies'}:
                      </Text>
                      {selectedReport.adminReplies.map((reply, index) => (
                        <View key={reply.id} style={styles.replyItem}>
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
  modeButton: {
    width: scale(40),
    height: scale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
  },
  languageSelector: {
    flexDirection: 'row',
    paddingHorizontal: padding.lg,
    paddingVertical: padding.md,
    backgroundColor: '#fff',
    marginBottom: spacing.md,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: padding.sm,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: '#f0f0f0',
  },
  languageButtonActive: {
    backgroundColor: '#698863',
  },
  languageFlag: {
    fontSize: fontSize.lg,
    marginRight: spacing.xs,
  },
  languageText: {
    fontSize: fontSize.sm,
    color: '#666',
    fontWeight: '500',
  },
  languageTextActive: {
    color: '#fff',
  },
  form: {
    paddingHorizontal: padding.lg,
    paddingBottom: padding.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#131612',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    paddingHorizontal: padding.md,
    paddingVertical: padding.md,
    fontSize: fontSize.base,
    color: '#131612',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: scale(120),
    textAlignVertical: 'top',
  },
  selector: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    paddingHorizontal: padding.md,
    paddingVertical: padding.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    fontSize: fontSize.base,
    color: '#131612',
  },
  selectorPlaceholder: {
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#698863',
    borderRadius: borderRadius.md,
    paddingVertical: padding.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '600',
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
  emptySubtext: {
    fontSize: fontSize.base,
    color: '#999',
    textAlign: 'center',
    marginTop: spacing.xs,
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
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: padding.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemIcon: {
    fontSize: fontSize.xl,
    marginRight: spacing.md,
  },
  modalItemText: {
    fontSize: fontSize.base,
    color: '#131612',
    flex: 1,
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
  repliesSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: spacing.md,
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
}); 