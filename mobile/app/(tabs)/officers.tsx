import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Linking,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../config/firebase';

// Initial District Agriculture Officers Data
const initialDistrictOfficers = [
  {
    id: 1,
    district: 'Colombo',
    officer: 'Mr. Kamal Perera',
    phone: '+94712345678',
    email: 'kamal.perera@agri.gov.lk',
  },
  {
    id: 2,
    district: 'Galle',
    officer: 'Mrs. Nimali Silva',
    phone: '+94712345679',
    email: 'nimali.silva@agri.gov.lk',
  },
  {
    id: 3,
    district: 'Kandy',
    officer: 'Mr. Sunil Fernando',
    phone: '+94712345680',
    email: 'sunil.fernando@agri.gov.lk',
  },
  {
    id: 4,
    district: 'Jaffna',
    officer: 'Mr. Rajan Sivapalan',
    phone: '+94712345681',
    email: 'rajan.sivapalan@agri.gov.lk',
  },
  {
    id: 5,
    district: 'Anuradhapura',
    officer: 'Mrs. Priya Bandara',
    phone: '+94712345682',
    email: 'priya.bandara@agri.gov.lk',
  },
  {
    id: 6,
    district: 'Matara',
    officer: 'Mr. Ajith Kumara',
    phone: '+94712345683',
    email: 'ajith.kumara@agri.gov.lk',
  },
  {
    id: 7,
    district: 'Kurunegala',
    officer: 'Mrs. Sandya Wijesinghe',
    phone: '+94712345684',
    email: 'sandya.wijesinghe@agri.gov.lk',
  },
  {
    id: 8,
    district: 'Badulla',
    officer: 'Mr. Ranjith Dissanayake',
    phone: '+94712345685',
    email: 'ranjith.dissanayake@agri.gov.lk',
  },
  {
    id: 9,
    district: 'Ratnapura',
    officer: 'Mrs. Lakshmi Perera',
    phone: '+94712345686',
    email: 'lakshmi.perera@agri.gov.lk',
  },
  {
    id: 10,
    district: 'Trincomalee',
    officer: 'Mr. Suresh Kumar',
    phone: '+94712345687',
    email: 'suresh.kumar@agri.gov.lk',
  },
];

// Chat messages interface
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Quick reply options
const quickReplies = [
  'How to identify coconut diseases?',
  'What are the symptoms of LYD?',
  'How to treat yellowing leaves?',
  'Best practices for coconut farming',
  'Report a new disease case',
];

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

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Refresh user state if not loaded
  useEffect(() => {
    if (!user) {
      refreshUser();
    }
  }, [user, refreshUser]);
  
  const [districtOfficers, setDistrictOfficers] = useState(initialDistrictOfficers);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi, I'm Coco 🥥! How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Admin state for managing officers
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [editOfficerModalVisible, setEditOfficerModalVisible] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [newOfficer, setNewOfficer] = useState({
    district: '',
    officer: '',
    phone: '',
    email: '',
  });
  const [editOfficer, setEditOfficer] = useState({
    district: '',
    officer: '',
    phone: '',
    email: '',
  });

  // Filter officers based on search query
  const filteredOfficers = districtOfficers.filter(officer =>
    officer.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.officer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle phone call
  const handleCall = (phone: string) => {
    Alert.alert(
      'Call Officer',
      `Call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${phone}`);
          },
        },
      ]
    );
  };

  // Handle chat message
  const sendMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(message),
        isUser: false,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  // Simple bot response logic
  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('disease') || lowerMessage.includes('identify')) {
      return "To identify coconut diseases, look for symptoms like yellowing leaves, wilting, or unusual spots. Take a photo and use our scan feature for instant diagnosis! 📸";
    } else if (lowerMessage.includes('lyd') || lowerMessage.includes('yellowing')) {
      return "Lethal Yellowing Disease (LYD) shows yellowing of older leaves, premature nut fall, and crown death. Early detection is crucial - contact an officer immediately! 🚨";
    } else if (lowerMessage.includes('treat') || lowerMessage.includes('treatment')) {
      return "Treatment depends on the disease. For LYD, remove infected palms and apply preventive measures. Check our treatment database for specific solutions! 💊";
    } else if (lowerMessage.includes('practice') || lowerMessage.includes('farming')) {
      return "Best practices: Regular monitoring, proper irrigation, balanced fertilization, and early disease detection. Prevention is better than cure! 🌱";
    } else if (lowerMessage.includes('report')) {
      return "To report a case, use our scan feature to document symptoms, then contact your district agriculture officer. Quick reporting helps prevent spread! 📞";
    } else {
      return "I'm here to help with coconut disease questions! Try asking about disease identification, symptoms, treatments, or farming practices. 🥥";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#161212" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support & Help</Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={() => setAdminModalVisible(true)}
            style={styles.adminButton}
          >
            <Ionicons name="settings" size={24} color="#698863" />
          </TouchableOpacity>
        )}
      </View>

             <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 80 + insets.bottom }} showsVerticalScrollIndicator={false}>
        {/* Chat with Coco Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles" size={24} color="#698863" />
            <Text style={styles.sectionTitle}>💬 Chat with Coco</Text>
          </View>
          
          {/* Chat Messages */}
          <View style={styles.chatContainer}>
            {chatMessages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.botMessage,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.botMessageText,
                ]}>
                  {message.text}
                </Text>
                <Text style={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Reply Buttons */}
          <View style={styles.quickRepliesContainer}>
            <Text style={styles.quickRepliesTitle}>Quick Questions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickReplies.map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickReplyButton}
                  onPress={() => sendMessage(reply)}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => {
                if (inputMessage.trim()) {
                  sendMessage(inputMessage.trim());
                }
              }}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* More Help Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={24} color="#698863" />
            <Text style={styles.sectionTitle}>📞 More Help & Assistance</Text>
          </View>
          
                     <View style={styles.helpOptions}>
             <TouchableOpacity 
               style={styles.helpOption}
               onPress={() => router.push('/scan')}
             >
               <Ionicons name="camera" size={24} color="#698863" />
               <Text style={styles.helpOptionText}>Scan Leaf for Diagnosis</Text>
               <Ionicons name="chevron-forward" size={20} color="#ccc" />
             </TouchableOpacity>
             
             <TouchableOpacity 
               style={styles.helpOption}
               onPress={() => router.push('/treatment')}
             >
               <Ionicons name="medical" size={24} color="#698863" />
               <Text style={styles.helpOptionText}>Browse Treatment Database</Text>
               <Ionicons name="chevron-forward" size={20} color="#ccc" />
             </TouchableOpacity>
             

             
             {/* Show Report New Case for regular users (not admin) */}
             {(user?.role !== UserRole.ADMIN || !user?.role) && (
               <TouchableOpacity 
                 style={styles.helpOption}
                 onPress={() => router.push('/report-simple')}
               >
                 <Ionicons name="document-text" size={24} color="#698863" />
                 <Text style={styles.helpOptionText}>Report New Case</Text>
                 <Ionicons name="chevron-forward" size={20} color="#ccc" />
               </TouchableOpacity>
             )}
             
             {/* Show Admin Reports for admin users only */}
             {user?.role === UserRole.ADMIN && (
               <TouchableOpacity 
                 style={styles.helpOption}
                 onPress={() => router.push('/admin-reports')}
               >
                 <Ionicons name="shield-checkmark" size={24} color="#698863" />
                 <Text style={styles.helpOptionText}>View All Reports (Admin)</Text>
                 <Ionicons name="chevron-forward" size={20} color="#ccc" />
               </TouchableOpacity>
             )}
             

           </View>
        </View>

        {/* District Officers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color="#698863" />
            <Text style={styles.sectionTitle}>📍 District Agriculture Officers</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by district or officer name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Officers List */}
          <View style={styles.officersList}>
            {filteredOfficers.map((officer) => (
              <View key={officer.id} style={styles.officerCard}>
                <View style={styles.officerInfo}>
                  <View style={styles.officerHeader}>
                    <Ionicons name="person-circle" size={40} color="#698863" />
                    <View style={styles.officerDetails}>
                      <Text style={styles.districtName}>{officer.district} District</Text>
                      <Text style={styles.officerName}>{officer.officer}</Text>
                      <Text style={styles.officerEmail}>{officer.email}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(officer.phone)}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.callButtonText}>Call Officer</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.phoneDisplay}>
                  <Ionicons name="phone-portrait" size={16} color="#698863" />
                  <Text style={styles.phoneNumber}>{officer.phone}</Text>
                </View>
              </View>
            ))}
                     </View>
         </View>
       </ScrollView>

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
               {item.icon(item.active ? "#121811" : "#698863")}
             </View>
             <Text style={[styles.navLabel, item.active && { color: "#121811" }]}> {item.label} </Text>
           </TouchableOpacity>
                 ))}
      </View>

      {/* Admin Management Modal */}
      <Modal
        visible={adminModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAdminModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Manage Officers</Text>
                <Text style={styles.modalSubtitle}>{districtOfficers.length} officer{districtOfficers.length !== 1 ? 's' : ''} total</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAdminModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#161212" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.officerList}>
              {districtOfficers.map((officer) => (
                <View key={officer.id} style={styles.adminOfficerItem}>
                  <View style={styles.adminOfficerInfo}>
                    <Text style={styles.adminOfficerName}>{officer.officer}</Text>
                    <Text style={styles.adminOfficerDistrict}>{officer.district}</Text>
                    <Text style={styles.adminOfficerPhone}>{officer.phone}</Text>
                    <Text style={styles.adminOfficerEmail}>{officer.email}</Text>
                  </View>
                  <View style={styles.adminOfficerActions}>
                    <TouchableOpacity
                      style={styles.editOfficerButton}
                      onPress={() => {
                        setSelectedOfficer(officer);
                        setEditOfficer({
                          district: officer.district,
                          officer: officer.officer,
                          phone: officer.phone,
                          email: officer.email,
                        });
                        setEditOfficerModalVisible(true);
                      }}
                    >
                      <Ionicons name="create" size={20} color="#698863" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeOfficerButton}
                      onPress={() => {
                        Alert.alert(
                          'Remove Officer',
                          `Are you sure you want to remove ${officer.officer} from ${officer.district}?\n\nThis action cannot be undone.`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Remove',
                              style: 'destructive',
                              onPress: () => {
                                const updatedOfficers = districtOfficers.filter(o => o.id !== officer.id);
                                setDistrictOfficers(updatedOfficers);
                                Alert.alert('Success', `${officer.officer} has been removed from ${officer.district}.`);
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash" size={20} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.addOfficerButton}
              onPress={() => {
                setNewOfficer({ district: '', officer: '', phone: '', email: '' });
                setSelectedOfficer(null);
                setEditOfficerModalVisible(true);
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addOfficerButtonText}>Add New Officer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Officer Modal */}
      <Modal
        visible={editOfficerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditOfficerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedOfficer ? 'Edit Officer' : 'Add New Officer'}
              </Text>
              <TouchableOpacity
                onPress={() => setEditOfficerModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#161212" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.officerForm}>
              <Text style={styles.formLabel}>District:</Text>
              <TextInput
                style={styles.formInput}
                value={selectedOfficer ? editOfficer.district : newOfficer.district}
                onChangeText={(text) => 
                  selectedOfficer 
                    ? setEditOfficer({...editOfficer, district: text})
                    : setNewOfficer({...newOfficer, district: text})
                }
                placeholder="Enter district name"
              />
              
              <Text style={styles.formLabel}>Officer Name:</Text>
              <TextInput
                style={styles.formInput}
                value={selectedOfficer ? editOfficer.officer : newOfficer.officer}
                onChangeText={(text) => 
                  selectedOfficer 
                    ? setEditOfficer({...editOfficer, officer: text})
                    : setNewOfficer({...newOfficer, officer: text})
                }
                placeholder="Enter officer name"
              />
              
              <Text style={styles.formLabel}>Phone Number:</Text>
              <TextInput
                style={styles.formInput}
                value={selectedOfficer ? editOfficer.phone : newOfficer.phone}
                onChangeText={(text) => 
                  selectedOfficer 
                    ? setEditOfficer({...editOfficer, phone: text})
                    : setNewOfficer({...newOfficer, phone: text})
                }
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
              
              <Text style={styles.formLabel}>Email:</Text>
              <TextInput
                style={styles.formInput}
                value={selectedOfficer ? editOfficer.email : newOfficer.email}
                onChangeText={(text) => 
                  selectedOfficer 
                    ? setEditOfficer({...editOfficer, email: text})
                    : setNewOfficer({...newOfficer, email: text})
                }
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => setEditOfficerModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.saveButton]}
                  onPress={() => {
                    const officerData = selectedOfficer ? editOfficer : newOfficer;
                    
                    if (!officerData.district || !officerData.officer || !officerData.phone || !officerData.email) {
                      Alert.alert('Error', 'Please fill in all fields');
                      return;
                    }
                    
                    if (selectedOfficer) {
                      // Edit existing officer
                      const updatedOfficers = districtOfficers.map(o => 
                        o.id === selectedOfficer.id 
                          ? { ...o, ...officerData }
                          : o
                      );
                      setDistrictOfficers(updatedOfficers);
                      Alert.alert('Success', 'Officer updated successfully!');
                    } else {
                      // Add new officer
                      const newOfficerData = {
                        id: Math.max(...districtOfficers.map(o => o.id)) + 1,
                        ...officerData,
                      };
                      setDistrictOfficers([...districtOfficers, newOfficerData]);
                      Alert.alert('Success', 'Officer added successfully!');
                    }
                    
                    setEditOfficerModalVisible(false);
                    setSelectedOfficer(null);
                  }}
                >
                  <Text style={styles.saveButtonText}>
                    {selectedOfficer ? 'Update' : 'Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
    </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 80,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#161212',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161212',
    marginLeft: 8,
  },
  chatContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#698863',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#161212',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  quickRepliesContainer: {
    marginBottom: 16,
  },
  quickRepliesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#161212',
    marginBottom: 8,
  },
  quickReplyButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 12,
    color: '#161212',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#161212',
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#698863',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  helpOptions: {
    gap: 12,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  helpOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#161212',
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#161212',
  },
  officersList: {
    gap: 12,
  },
  officerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  officerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  officerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  officerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  districtName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#698863',
  },
  officerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#161212',
    marginTop: 2,
  },
  officerEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#698863',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
     phoneNumber: {
     fontSize: 14,
     color: '#161212',
     marginLeft: 6,
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
  adminButton: {
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
  modalSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  officerList: {
    maxHeight: 400,
  },
  adminOfficerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  adminOfficerInfo: {
    flex: 1,
  },
  adminOfficerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#161212',
    marginBottom: 4,
  },
  adminOfficerDistrict: {
    fontSize: 14,
    color: '#698863',
    marginBottom: 2,
  },
  adminOfficerPhone: {
    fontSize: 12,
    color: '#666',
  },
  adminOfficerEmail: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  adminOfficerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editOfficerButton: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  removeOfficerButton: {
    padding: 8,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  addOfficerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#698863',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addOfficerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  officerForm: {
    paddingVertical: 10,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#161212',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#698863',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

}); 