import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { driverService } from '../../services/api';

export default function RegisterVehicleScreen({ navigation }) {
  const [form, setForm] = useState({
    license_number: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_plate: '',
    vehicle_color: '',
    vehicle_type: 'car',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.license_number || !form.vehicle_plate || !form.vehicle_brand) {
      Alert.alert('Error', 'Licencia, marca y placa son requeridos');
      return;
    }
    try {
      setLoading(true);
      await driverService.registerProfile({
        ...form,
        vehicle_year: parseInt(form.vehicle_year),
      });
      Alert.alert('✅ Vehículo registrado', 'Ya puedes recibir viajes', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Error al registrar vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registra tu vehículo</Text>

      <TextInput
        style={styles.input}
        placeholder="Número de licencia"
        value={form.license_number}
        onChangeText={(v) => setForm({ ...form, license_number: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Marca (ej. Nissan)"
        value={form.vehicle_brand}
        onChangeText={(v) => setForm({ ...form, vehicle_brand: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Modelo (ej. Versa)"
        value={form.vehicle_model}
        onChangeText={(v) => setForm({ ...form, vehicle_model: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Año (ej. 2022)"
        value={form.vehicle_year}
        onChangeText={(v) => setForm({ ...form, vehicle_year: v })}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Placa (ej. ABC-123)"
        value={form.vehicle_plate}
        onChangeText={(v) => setForm({ ...form, vehicle_plate: v })}
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        placeholder="Color"
        value={form.vehicle_color}
        onChangeText={(v) => setForm({ ...form, vehicle_color: v })}
      />

      <Text style={styles.label}>Tipo de vehículo</Text>
      <View style={styles.typeContainer}>
        {['car', 'van', 'truck'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, form.vehicle_type === type && styles.typeActive]}
            onPress={() => setForm({ ...form, vehicle_type: type })}
          >
            <Text style={[styles.typeText, form.vehicle_type === type && styles.typeTextActive]}>
              {type === 'car' ? '🚗 Auto' : type === 'van' ? '🚐 Van' : '🚛 Camión'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrar vehículo</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 16, marginBottom: 12,
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  typeContainer: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  typeButton: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  typeActive: { borderColor: '#000', backgroundColor: '#000' },
  typeText: { fontSize: 13, color: '#666' },
  typeTextActive: { color: '#fff', fontWeight: 'bold' },
  button: {
    backgroundColor: '#000', borderRadius: 10,
    padding: 16, alignItems: 'center', marginBottom: 40,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});