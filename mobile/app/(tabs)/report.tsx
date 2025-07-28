import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';

export default function ReportScreen() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ error?: string; classification?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submitReport = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await axios.post('http://192.168.121.73:8000/report', new URLSearchParams({ text }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      setResult(res.data);
    } catch {
      setResult({ error: 'Submission failed' });
    }
    setLoading(false);
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>Report Symptoms</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe symptoms..."
          value={text}
          onChangeText={setText}
          multiline
        />
        {loading ? <ActivityIndicator size="large" color="#C36B4F" /> : (
          <TouchableOpacity style={styles.btn} onPress={submitReport}>
            <Text style={styles.btnText}>Submit Report</Text>
          </TouchableOpacity>
        )}
        {result && (
          <View style={styles.result}>
            {result.error ? (
              <Text style={{ color: 'red' }}>{result.error}</Text>
            ) : (
              <Text style={styles.classification}>Classification: {result.classification}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F6FAF8', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '92%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 14, marginBottom: 16, minHeight: 80, width: '100%', fontSize: 16 },
  btn: { backgroundColor: '#C36B4F', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10, marginVertical: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  result: { marginTop: 18, alignItems: 'center' },
  classification: { fontSize: 16, color: '#333', textAlign: 'center' },
}); 