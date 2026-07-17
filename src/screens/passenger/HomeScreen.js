import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { tripService } from '../../services/api';
import { getSocket } from '../../services/socket';

export default function PassengerHomeScreen() {
  const { user, logout } = useAuth();
  const [type, setType] = useState('ride');
  const [form, setForm] = useState({
    origin_address: '',
    origin_lat: '',
    origin_lng: '',
    destination_address: '',
    destination_lat: '',
    destination_lng: '',
    freight_description: '',
  });
  const [loading, setLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);

  const requestTrip = async () => {
    if (!form.origin_address || !form.destination_address) {
      Alert.alert('Error', 'Ingresa origen y destino');
      return;
    }
    try {
      setLoading(true);
      const res = await tripService.request({
        type,
        ...form,
        origin_lat: parseFloat(form.origin_lat) || 20.5888,
        origin_lng: parseFloat(form.origin_lng) || -100.3899,
        destination_lat: parseFloat(form.destination_lat) || 20.6024,
        destination_lng: parseFloat(form.destination_lng) || -100.4099,
      });
      setActiveTrip(res.data);

      // Notificar por socket
      const socket = getSocket();
      if (socket) socket.emit('trip:requested', res.data);

      Alert.alert('¡Viaje solicitado!', `Precio estimado: $${res.data.price}`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Error al solicitar viaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hola, {user?.name?.split(' ')[0]} 👋</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Salir</Text>
        </TouchableOpacity>
      </View>

      {activeTrip ? (
        <View style={styles.activeTrip}>
          <Text style={styles.activeTripTitle}>Viaje activo</Text>
          <Text style={styles.activeTripStatus}>Estado: {activeTrip.status}</Text>
          <Text style={styles.activeTripPrice}>Precio: ${activeTrip.price}</Text>
          <Text style={styles.activeTripAddress}>
            📍 {activeTrip.origin_address}
          </Text>
          <Text style={styles.activeTripAddress}>
            🏁 {activeTrip.destination_address}
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setActiveTrip(null)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>¿Qué necesitas?</Text>

          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'ride' && styles.typeActive]}
              onPress={() => setType('ride')}
            >
              <Text style={[styles.typeText, type === 'ride' && styles.typeTextActive]}>
                🚗 Viaje
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'freight' && styles.typeActive]}
              onPress={() => setType('freight')}
            >
              <Text style={[styles.typeText, type === 'freight' && styles.typeTextActive]}>
                📦 Flete
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="📍 ¿Dónde estás?"
            value={form.origin_address}
            onChangeText={(v) => setForm({ ...form, origin_address: v })}
          />

          <TextInput
            style={styles.input}
            placeholder="🏁 ¿A dónde vas?"
            value={form.destination_address}
            onChangeText={(v) => setForm({ ...form, destination_address: v })}
          />

          {type === 'freight' && (
            <TextInput
              style={styles.input}
              placeholder="📝 ¿Qué vas a enviar?"
              value={form.freight_description}
              onChangeText={(v) => setForm({ ...form, freight_description: v })}
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={requestTrip}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {type === 'ride' ? 'Solicitar viaje' : 'Solicitar flete'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logout: {
    color: '#666',
    fontSize: 14,
  },
  form: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  typeActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  typeText: {
    fontSize: 15,
    color: '#666',
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTrip: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  activeTripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activeTripStatus: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  activeTripPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activeTripAddress: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ff3b30',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
});