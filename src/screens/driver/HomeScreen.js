import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { tripService } from '../../services/api';
import { getSocket } from '../../services/socket';

export default function DriverHomeScreen() {
  const { user, logout } = useAuth();
  const [available, setAvailable] = useState(false);
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('trip:new', (trip) => {
        setTrips((prev) => [trip, ...prev]);
      });
    }
    return () => {
      if (socket) socket.off('trip:new');
    };
  }, []);

  const toggleAvailability = () => {
    const socket = getSocket();
    const newStatus = !available;
    setAvailable(newStatus);
    if (socket) socket.emit('driver:availability', { is_available: newStatus });
    if (newStatus) loadTrips();
  };

  const loadTrips = async () => {
    try {
      setLoading(true);
      const res = await tripService.getAvailable();
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const acceptTrip = async (tripId) => {
    try {
      const res = await tripService.accept(tripId);
      setActiveTrip(res.data);
      setTrips([]);

      const socket = getSocket();
      if (socket) {
        socket.emit('trip:accepted', {
          trip: res.data,
          passenger_id: res.data.passenger_id,
        });
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Error al aceptar viaje');
    }
  };

  const updateStatus = async (status) => {
    try {
      const res = await tripService.updateStatus(activeTrip.id, status);
      setActiveTrip(res.data);

      const socket = getSocket();
      if (socket) {
        socket.emit('trip:status', {
          trip: res.data,
          passenger_id: res.data.passenger_id,
        });
      }

      if (status === 'completed') {
        Alert.alert('¡Viaje completado!', `Total: $${activeTrip.price}`);
        setActiveTrip(null);
        setAvailable(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Error al actualizar estado');
    }
  };

  const renderTrip = ({ item }) => (
    <View style={styles.tripCard}>
      <Text style={styles.tripType}>{item.type === 'ride' ? '🚗 Viaje' : '📦 Flete'}</Text>
      <Text style={styles.tripAddress}>📍 {item.origin_address}</Text>
      <Text style={styles.tripAddress}>🏁 {item.destination_address}</Text>
      <Text style={styles.tripPrice}>${item.price}</Text>
      <Text style={styles.tripDistance}>{item.distance_km} km</Text>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => acceptTrip(item.id)}
      >
        <Text style={styles.acceptButtonText}>Aceptar viaje</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hola, {user?.name?.split(' ')[0]} 🚗</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Salir</Text>
        </TouchableOpacity>
      </View>

      {!activeTrip ? (
        <>
          <TouchableOpacity
            style={[styles.availabilityButton, available && styles.availabilityActive]}
            onPress={toggleAvailability}
          >
            <Text style={styles.availabilityText}>
              {available ? '🟢 Disponible' : '🔴 No disponible'}
            </Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={trips}
              keyExtractor={(item) => item.id}
              renderItem={renderTrip}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                available ? (
                  <Text style={styles.empty}>Esperando viajes...</Text>
                ) : (
                  <Text style={styles.empty}>Actívate para recibir viajes</Text>
                )
              }
            />
          )}
        </>
      ) : (
        <View style={styles.activeTrip}>
          <Text style={styles.activeTripTitle}>Viaje en curso</Text>
          <Text style={styles.activeTripType}>
            {activeTrip.type === 'ride' ? '🚗 Viaje' : '📦 Flete'}
          </Text>
          <Text style={styles.activeTripAddress}>📍 {activeTrip.origin_address}</Text>
          <Text style={styles.activeTripAddress}>🏁 {activeTrip.destination_address}</Text>
          <Text style={styles.activeTripPrice}>${activeTrip.price}</Text>

          {activeTrip.status === 'accepted' && (
            <TouchableOpacity
              style={styles.statusButton}
              onPress={() => updateStatus('driver_arriving')}
            >
              <Text style={styles.statusButtonText}>En camino al pasajero</Text>
            </TouchableOpacity>
          )}

          {activeTrip.status === 'driver_arriving' && (
            <TouchableOpacity
              style={styles.statusButton}
              onPress={() => updateStatus('in_progress')}
            >
              <Text style={styles.statusButtonText}>Iniciar viaje</Text>
            </TouchableOpacity>
          )}

          {activeTrip.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#34c759' }]}
              onPress={() => updateStatus('completed')}
            >
              <Text style={styles.statusButtonText}>Finalizar viaje</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
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
  availabilityButton: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  availabilityActive: {
    borderColor: '#34c759',
    backgroundColor: '#f0fff4',
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tripType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tripAddress: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  tripPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  tripDistance: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  acceptButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 60,
  },
  activeTrip: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  activeTripTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activeTripType: {
    fontSize: 16,
    marginBottom: 8,
  },
  activeTripAddress: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  activeTripPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  statusButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});