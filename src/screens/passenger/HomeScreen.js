import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Dimensions
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { tripService } from '../../services/api';
import { getSocket } from '../../services/socket';
import { sendLocalNotification } from '../../services/notifications';

const { height } = Dimensions.get('window');

export default function PassengerHomeScreen() {
  const { user, logout } = useAuth();
  const [type, setType] = useState('ride');
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [freight_description, setFreightDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    getLocation();
    listenForUpdates();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos tu ubicación para funcionar');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

const listenForUpdates = () => {
    const socket = getSocket();
    if (socket) {
      socket.on('trip:accepted', (trip) => {
        setActiveTrip(trip);
        sendLocalNotification('¡Conductor encontrado!', 'Un conductor aceptó tu viaje 🚗');
      });
      socket.on('trip:status:updated', (trip) => {
        setActiveTrip(trip);
        const messages = {
          driver_arriving: 'Tu conductor está en camino 📍',
          in_progress: 'Tu viaje ha comenzado 🛣',
          completed: 'Llegaste a tu destino 🏁',
        };
        if (messages[trip.status]) {
          sendLocalNotification('Movi', messages[trip.status]);
        }
      });
    }
  };

  const requestTrip = async () => {
    if (!destination) {
      Alert.alert('Error', 'Ingresa tu destino');
      return;
    }
    if (!location) {
      Alert.alert('Error', 'Obteniendo tu ubicación...');
      return;
    }
    try {
      setLoading(true);
      const res = await tripService.request({
        type,
        origin_address: 'Mi ubicación actual',
        origin_lat: location.latitude,
        origin_lng: location.longitude,
        destination_address: destination,
        destination_lat: location.latitude + 0.02,
        destination_lng: location.longitude + 0.02,
        freight_description: freight_description || null,
      });
      setActiveTrip(res.data);
      const socket = getSocket();
      if (socket) socket.emit('trip:requested', res.data);
      Alert.alert('¡Viaje solicitado!', `Precio estimado: $${res.data.price}`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Error al solicitar viaje');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = {
    requested: '🔍 Buscando conductor...',
    accepted: '✅ Conductor aceptó',
    driver_arriving: '🚗 Conductor en camino',
    in_progress: '🛣 Viaje en curso',
    completed: '🏁 Viaje completado',
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {activeTrip && (
            <Marker
              coordinate={{
                latitude: parseFloat(activeTrip.destination_lat),
                longitude: parseFloat(activeTrip.destination_lng),
              }}
              title="Destino"
              pinColor="red"
            />
          )}
        </MapView>
      )}

      {!location && (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.mapPlaceholderText}>Obteniendo ubicación...</Text>
        </View>
      )}

      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Hola, {user?.name?.split(' ')[0]} 👋</Text>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logout}>Salir</Text>
          </TouchableOpacity>
        </View>

        {activeTrip ? (
          <View>
            <Text style={styles.statusText}>
              {statusLabel[activeTrip.status] || activeTrip.status}
            </Text>
            <Text style={styles.price}>${activeTrip.price}</Text>
            <Text style={styles.address}>🏁 {activeTrip.destination_address}</Text>
            {activeTrip.status === 'completed' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setActiveTrip(null)}
              >
                <Text style={styles.buttonText}>Nuevo viaje</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>
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
              placeholder="🏁 ¿A dónde vas?"
              value={destination}
              onChangeText={setDestination}
            />

            {type === 'freight' && (
              <TextInput
                style={styles.input}
                placeholder="📝 ¿Qué vas a enviar?"
                value={freight_description}
                onChangeText={setFreightDescription}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { height: height * 0.55 },
  mapPlaceholder: {
    height: height * 0.55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholderText: { marginTop: 12, color: '#666' },
  panel: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  logout: { color: '#666', fontSize: 14 },
  typeContainer: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  typeButton: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  typeActive: { borderColor: '#000', backgroundColor: '#000' },
  typeText: { fontSize: 15, color: '#666' },
  typeTextActive: { color: '#fff', fontWeight: 'bold' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 16, marginBottom: 12, backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#000', borderRadius: 10,
    padding: 16, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statusText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  price: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  address: { fontSize: 14, color: '#444', marginBottom: 16 },
});