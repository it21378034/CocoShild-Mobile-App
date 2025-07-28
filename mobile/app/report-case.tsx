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
  Image,
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

export default function ReportCaseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
  const [showLanguageModal, setShowLanguageModal] = useState(false);

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

  const getCategoryName = (categoryId: string) => {
    const categoryList = language === 'sinhala' ? sinhalaCategories : categories;
    return categoryList.find(cat => cat.id === categoryId)?.name || 'Select Category';
  };

  const getPriorityName = (priorityId: string) => {
    const priorityList = language === 'sinhala' ? sinhalaPriorities : priorities;
    return priorityList.find(pri => pri.id === priorityId)?.name || 'Select Priority';
  };

  const getLanguageName = (languageId: string) => {
    return languages.find(lang => lang.id === languageId)?.name || 'Select Language';
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert(
        language === 'sinhala' ? 'දෝෂය' : 'Error',
        language === 'sinhala' 
          ? 'කරුණාකර සියලුම ක්ෂේත්‍ර පුරවන්න' 
          : 'Please fill in all required fields'
      );
      return;
    }

    setSubmitting(true);
    try {
      // Create report case object
      const reportCase: Omit<ReportCase, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user?.uid || '',
        userEmail: user?.email || '',
        title: title.trim(),
        description: description.trim(),
        language,
        category,
        priority,
        status: 'pending',
        location: location.trim() || undefined,
        images: [],
        adminReplies: [],
        nlpAnalysis: await analyzeText(description.trim(), language),
      };

      // Send to backend
      const response = await fetch('http://192.168.18.73:8001/report-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportCase),
      });

      if (response.ok) {
        Alert.alert(
          language === 'sinhala' ? 'සාර්ථකයි' : 'Success',
          language === 'sinhala'
            ? 'ඔබගේ වාර්තාව සාර්ථකව ඉදිරිපත් කරන ලදී. පිළිතුරක් ලැබෙන තෙක් රැඳී සිටින්න.'
            : 'Your report has been submitted successfully. Please wait for a response.',
          [
            {
              text: language === 'sinhala' ? 'හරි' : 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      Alert.alert(
        language === 'sinhala' ? 'දෝෂය' : 'Error',
        language === 'sinhala'
          ? 'වාර්තාව ඉදිරිපත් කිරීමේදී දෝෂයක් ඇති විය'
          : 'An error occurred while submitting the report'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // NLP Analysis function
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

    // Fallback analysis
    return {
      sentiment: 'neutral',
      keywords: [],
      category: 'general',
      urgency: 0.5,
      language: lang,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#698863" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {language === 'sinhala' ? 'නව නඩුව වාර්තා කරන්න' : 'Report New Case'}
          </Text>
          <View style={styles.placeholder} />
        </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fbf7',
  },
  scrollView: {
    flex: 1,
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
  placeholder: {
    width: scale(40),
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
}); 