import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';

export default function SendAlertScreen() {
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const sendAlert = async () => {
    if (!title || !msg) {
      Alert.alert('Error', 'Please enter both title and message.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://192.168.121.73:8000/alerts', { title, msg });
      Alert.alert('Success', 'Alert sent to all users!');
      setTitle('');
      setMsg('');
    } catch {
      Alert.alert('Error', 'Failed to send alert.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>Send Alert</Text>
        <TextInput
          style={styles.input}
          placeholder="Alert Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Alert Message"
          value={msg}
          onChangeText={setMsg}
          multiline
        />
        {loading ? <ActivityIndicator size="large" color="#C3B14F" /> : (
          <TouchableOpacity style={styles.btn} onPress={sendAlert}>
            <Text style={styles.btnText}>Send Alert</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F6FAF8', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '92%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 18 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 14, marginBottom: 16, width: '100%', fontSize: 16 },
  btn: { backgroundColor: '#C3B14F', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10, marginVertical: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 