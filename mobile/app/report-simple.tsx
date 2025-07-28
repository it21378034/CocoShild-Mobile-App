import React, { useState, useContext, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../config/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SimpleReportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [language, setLanguage] = useState('english'); // 'english' or 'sinhala'
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

  // Check if user is admin (only regular users can submit reports)
  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      Alert.alert('Access Denied', 'Administrators cannot submit reports.');
      router.back();
    }
  }, [user, router]);

  const categories = [
    { id: 'disease', name: 'Disease Outbreak', nameSinhala: 'රෝග ප්‍රචාරය', icon: 'medical' },
    { id: 'pest', name: 'Pest Infestation', nameSinhala: 'කෘමි ආක්‍රමණය', icon: 'bug' },
    { id: 'nutrient', name: 'Nutrient Deficiency', nameSinhala: 'පෝෂණ ඌණතාව', icon: 'leaf' },
    { id: 'weather', name: 'Weather Damage', nameSinhala: 'කාලගුණ හානි', icon: 'thunderstorm' },
    { id: 'soil', name: 'Soil Issues', nameSinhala: 'මාණික්‍ය ගැටළු', icon: 'earth' },
    { id: 'other', name: 'Other', nameSinhala: 'වෙනත්', icon: 'ellipsis-horizontal' },
  ];

  const priorities = [
    { id: 'low', name: 'Low', nameSinhala: 'අඩු', icon: 'arrow-down', color: '#28a745' },
    { id: 'medium', name: 'Medium', nameSinhala: 'මධ්‍යම', icon: 'remove', color: '#ffc107' },
    { id: 'high', name: 'High', nameSinhala: 'ඉහළ', icon: 'arrow-up', color: '#fd7e14' },
    { id: 'urgent', name: 'Urgent', nameSinhala: 'හදිසි', icon: 'warning', color: '#dc3545' },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert(
        language === 'sinhala' ? 'දෝෂය' : 'Error',
        language === 'sinhala' 
          ? 'කරුණාකර සියලුම අවශ්‍ය ක්ෂේත්‍ර පුරවන්න' 
          : 'Please fill in all required fields'
      );
      return;
    }

    if (!user?.uid) {
      Alert.alert(
        language === 'sinhala' ? 'දෝෂය' : 'Error',
        language === 'sinhala'
          ? 'කරුණාකර පළමුව පිවිසෙන්න'
          : 'Please login first to submit a report'
      );
      return;
    }

    setSubmitting(true);
    
    try {
      // Create report object for Firebase
      const report = {
        userId: user.uid,
        userEmail: user.email || '',
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firebase Firestore
      const docRef = await addDoc(collection(db, 'reportCases'), report);
      console.log('Report saved to Firebase with ID:', docRef.id);

      Alert.alert(
        language === 'sinhala' ? 'සාර්ථකයි' : 'Success',
        language === 'sinhala'
          ? 'වාර්තාව සාර්ථකව ඉදිරිපත් කරන ලදී!'
          : 'Report submitted successfully!',
        [
          { 
            text: language === 'sinhala' ? 'හරි' : 'OK', 
            onPress: () => {
              setTitle('');
              setDescription('');
              setCategory('');
              setPriority('medium');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        language === 'sinhala' ? 'දෝෂය' : 'Error',
        language === 'sinhala'
          ? 'වාර්තාව ඉදිරිපත් කිරීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.'
          : 'Failed to submit report. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate header height (56 is default, plus safe area)
  const HEADER_HEIGHT = 56 + insets.top;

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: HEADER_HEIGHT, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, elevation: 4, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }]}> 
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#698863" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report New Case</Text>
        <View style={styles.placeholder} />
      </View>
      {/* Content below sticky header */}
      <ScrollView style={[styles.scrollView, { marginTop: HEADER_HEIGHT }]}> 
        {/* Language Selector */}
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'english' && styles.languageButtonActive
            ]}
            onPress={() => setLanguage('english')}
          >
            <Text style={styles.languageFlag}>🇺🇸</Text>
            <Text style={[
              styles.languageText,
              language === 'english' && styles.languageTextActive
            ]}>
              English
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'sinhala' && styles.languageButtonActive
            ]}
            onPress={() => setLanguage('sinhala')}
          >
            <Text style={styles.languageFlag}>🇱🇰</Text>
            <Text style={[
              styles.languageText,
              language === 'sinhala' && styles.languageTextActive
            ]}>
              සිංහල
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="document-text" size={16} color="#698863" />
              <Text style={styles.label}>
                {language === 'sinhala' ? 'ශීර්ෂකය *' : 'Title *'}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={language === 'sinhala' ? 'ශීර්ෂකය ඇතුළත් කරන්න' : 'Enter title'}
              placeholderTextColor="#999"
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="folder" size={16} color="#698863" />
              <Text style={styles.label}>
                {language === 'sinhala' ? 'වර්ගය *' : 'Category *'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowCategoryModal(true)}
            >
              <View style={styles.selectorContent}>
                {category && (
                  <Ionicons 
                    name={categories.find(c => c.id === category)?.icon as any} 
                    size={18} 
                    color="#698863" 
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={[
                  styles.selectorText,
                  !category && styles.selectorPlaceholder,
                ]}>
                  {category ? 
                    (language === 'sinhala' 
                      ? categories.find(c => c.id === category)?.nameSinhala 
                      : categories.find(c => c.id === category)?.name
                    ) : 
                    (language === 'sinhala' ? 'වර්ගය තෝරන්න' : 'Select Category')
                  }
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#698863" />
            </TouchableOpacity>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="flag" size={16} color="#698863" />
              <Text style={styles.label}>
                {language === 'sinhala' ? 'ප්‍රමුඛතාව *' : 'Priority *'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowPriorityModal(true)}
            >
              <View style={styles.selectorContent}>
                <Ionicons 
                  name={priorities.find(p => p.id === priority)?.icon as any} 
                  size={18} 
                  color={priorities.find(p => p.id === priority)?.color} 
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.selectorText}>
                  {language === 'sinhala' 
                    ? priorities.find(p => p.id === priority)?.nameSinhala 
                    : priorities.find(p => p.id === priority)?.name
                  }
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#698863" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="chatbubble-ellipses" size={16} color="#698863" />
              <Text style={styles.label}>
                {language === 'sinhala' ? 'විස්තර *' : 'Description *'}
              </Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={language === 'sinhala' ? 'ඔබගේ ගැටළුව විස්තරාත්මකව විස්තර කරන්න...' : 'Describe your issue in detail...'}
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
              <>
                <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>
                  {language === 'sinhala' ? 'වාර්තාව ඉදිරිපත් කරන්න' : 'Submit Report'}
                </Text>
              </>
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
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(cat.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <Ionicons name={cat.icon as any} size={20} color="#698863" />
                    <Text style={styles.modalItemText}>
                      {language === 'sinhala' ? cat.nameSinhala : cat.name}
                    </Text>
                  </View>
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
              {priorities.map((pri) => (
                <TouchableOpacity
                  key={pri.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setPriority(pri.id);
                    setShowPriorityModal(false);
                  }}
                >
                  <View style={styles.modalItemContent}>
                    <Ionicons name={pri.icon as any} size={20} color={pri.color} />
                    <Text style={styles.modalItemText}>
                      {language === 'sinhala' ? pri.nameSinhala : pri.name}
                    </Text>
                  </View>
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
  placeholder: {
    width: 40,
  },
  languageSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageButtonActive: {
    backgroundColor: '#698863',
    borderColor: '#698863',
  },
  languageFlag: {
    fontSize: 16,
    marginRight: 8,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  languageTextActive: {
    color: '#fff',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131612',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#131612',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  selector: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    color: '#131612',
  },
  selectorPlaceholder: {
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#698863',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#131612',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#131612',
  },
}); 