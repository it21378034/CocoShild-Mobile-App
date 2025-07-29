import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DiagnosisResult {
  predictions: Array<{
    image_index: number;
    class: string;
    confidence: number;
  }>;
  best_prediction: {
    class: string;
    confidence: number;
  };
  treatment: {
    title: string;
    message: string;
    recommendations: string[];
    severity: string;
    urgency: string;
    source: string;
  };
  message: string;
}

export default function DiagnosisResultsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the diagnosis result from params with error handling
  let diagnosisResult: DiagnosisResult | null = null;
  try {
    diagnosisResult = params.diagnosisResult 
      ? JSON.parse(params.diagnosisResult as string) 
      : null;
  } catch (error) {
    console.error('Error parsing diagnosis result:', error);
    diagnosisResult = null;
  }

  // Debug: Log the diagnosis result to see what we're working with
  console.log('Diagnosis Result:', JSON.stringify(diagnosisResult, null, 2));
  if (diagnosisResult?.treatment) {
    console.log('Treatment object:', JSON.stringify(diagnosisResult.treatment, null, 2));
    console.log('Recommendations type:', typeof diagnosisResult.treatment.recommendations);
    console.log('Recommendations:', diagnosisResult.treatment.recommendations);
    
    // Check for any problematic properties
    Object.keys(diagnosisResult.treatment).forEach(key => {
      const value = (diagnosisResult.treatment as any)[key];
      console.log(`Treatment.${key}:`, typeof value, value);
      if (typeof value === 'object' && value !== null) {
        console.log(`Treatment.${key} is object:`, JSON.stringify(value, null, 2));
      }
    });
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      case 'none': return '#4CAF50';
      default: return '#607D8B';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'immediate': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#607D8B';
    }
  };

  const getDiseaseIcon = (diseaseClass: string) => {
    if (diseaseClass === 'Healthy_Leaves') return 'checkmark-circle';
    if (diseaseClass.includes('Yellowing')) return 'warning';
    if (diseaseClass.includes('Drying')) return 'close-circle';
    if (diseaseClass.includes('Flaccidity')) return 'alert-circle';
    if (diseaseClass.includes('Caterpillars')) return 'bug';
    if (diseaseClass.includes('Leaflets')) return 'leaf';
    return 'medical';
  };

  const navItems = [
    {
      label: 'Home',
      icon: (color: string) => <Ionicons name="home" size={24} color={color} />,
      path: '/',
    },
    {
      label: 'Scan',
      icon: (color: string) => <MaterialIcons name="qr-code-scanner" size={24} color={color} />,
      path: '/scan',
    },
    {
      label: 'Risk',
      icon: (color: string) => <MaterialCommunityIcons name="shield-check" size={24} color={color} />,
      path: '/DiseasePercentageScreen',
    },
    {
      label: 'Treatment',
      icon: (color: string) => <FontAwesome5 name="syringe" size={22} color={color} />,
      path: '/treatment',
    },
    {
      label: 'Map',
      icon: (color: string) => <Ionicons name="map" size={24} color={color} />,
      path: '/officers',
    },
  ];

  if (!diagnosisResult || !diagnosisResult.best_prediction || !diagnosisResult.treatment || typeof diagnosisResult.treatment !== 'object') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>No Diagnosis Data</Text>
          <Text style={styles.errorMessage}>Please scan images again to get diagnosis results.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/scan')}>
            <Text style={styles.retryButtonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#161212" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Diagnosis Results</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Diagnosis Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons 
                name={getDiseaseIcon(diagnosisResult.best_prediction.class) as any} 
                size={32} 
                color={getSeverityColor(diagnosisResult.treatment.severity)} 
              />
              <View style={styles.summaryText}>
                <Text style={styles.diseaseTitle}>{diagnosisResult.best_prediction.class}</Text>
                <Text style={styles.confidenceText}>
                  Confidence: {(diagnosisResult.best_prediction.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
            
            <Text style={styles.diagnosisMessage}>{diagnosisResult.message}</Text>
          </View>

          {/* Severity and Urgency */}
          <View style={styles.severityContainer}>
            <View style={styles.severityCard}>
              <Text style={styles.severityLabel}>Severity</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(diagnosisResult.treatment.severity || 'Medium') }]}>
                <Text style={styles.severityText}>{diagnosisResult.treatment.severity || 'Medium'}</Text>
              </View>
            </View>
            
            <View style={styles.severityCard}>
              <Text style={styles.severityLabel}>Urgency</Text>
              <View style={[styles.severityBadge, { backgroundColor: getUrgencyColor(diagnosisResult.treatment.urgency || 'Medium') }]}>
                <Text style={styles.severityText}>{diagnosisResult.treatment.urgency || 'Medium'}</Text>
              </View>
            </View>
          </View>

          {/* Treatment Recommendations */}
          <View style={styles.treatmentCard}>
            <Text style={styles.treatmentTitle}>{diagnosisResult.treatment.title || 'Treatment Information'}</Text>
            <Text style={styles.treatmentMessage}>{diagnosisResult.treatment.message || 'Treatment details not available'}</Text>
            
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Treatment Recommendations:</Text>
              {diagnosisResult.treatment.recommendations && Array.isArray(diagnosisResult.treatment.recommendations) ? 
                diagnosisResult.treatment.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.recommendationText}>
                      {typeof recommendation === 'string' ? recommendation : JSON.stringify(recommendation)}
                    </Text>
                  </View>
                )) : (
                  <Text style={styles.recommendationText}>No recommendations available</Text>
                )
              }
            </View>
            
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>Source: {diagnosisResult.treatment.source || 'Unknown'}</Text>
            </View>
          </View>

          {/* Individual Image Results */}
          <View style={styles.imagesCard}>
            <Text style={styles.imagesTitle}>Individual Image Analysis</Text>
            {diagnosisResult.predictions.map((prediction, index) => (
              <View key={index} style={styles.imageResult}>
                <Text style={styles.imageLabel}>Image {index + 1}</Text>
                <View style={styles.imagePrediction}>
                  <Text style={styles.imageClass}>{prediction.class}</Text>
                  <Text style={styles.imageConfidence}>
                    {(prediction.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/treatment')}
            >
              <FontAwesome5 name="syringe" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>View All Treatments</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]} 
              onPress={() => router.push('/officers')}
            >
              <Ionicons name="call" size={20} color="#698863" />
              <Text style={[styles.actionButtonText, { color: '#698863' }]}>Contact Officer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: 12 + insets.bottom }]}>
        {navItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.navItem}
            onPress={() => router.push(item.path as any)}
          >
            <View style={styles.navIcon}>{item.icon('#698863')}</View>
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161212',
    letterSpacing: -0.015 * 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    marginLeft: 12,
    flex: 1,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161212',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  diagnosisMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  severityCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  severityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  treatmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  treatmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161212',
    marginBottom: 8,
  },
  treatmentMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 22,
  },
  recommendationsContainer: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#698863',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  sourceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  sourceText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  imagesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#161212',
    marginBottom: 12,
  },
  imageResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  imageLabel: {
    fontSize: 14,
    color: '#666',
  },
  imagePrediction: {
    alignItems: 'flex-end',
  },
  imageClass: {
    fontSize: 14,
    fontWeight: '500',
    color: '#161212',
  },
  imageConfidence: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#698863',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#698863',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#161212',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#698863',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f4f0',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 6,
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