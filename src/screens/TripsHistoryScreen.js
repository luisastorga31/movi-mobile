import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import { tripService } from '../services/api';

const statusLabel = {
  requested: 'Solicitado',
  accepted: 'Aceptado',
  driver_arriving: 'Conductor en camino',
  in_progress: 'En curso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const statusColor = {
  requested: '#f0a500',
  accepted: '#3b82f6',
  driver_arriving: '#8b5cf6',
  in_progress: '#3b82f6',
  completed: '#34c759',
  cancelled: '#ff3b30',
};

export default function TripsHistoryScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const res = await tripService.myTrips();
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTrip = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.tripType}>
          {item.type === 'ride' ? '🚗 Viaje' : '📦 Flete'}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusColor[item.status] }]}>
          <Text style={styles.badgeText}>{statusLabel[item.status]}</Text>
        </View>
      </View>

      <View style={styles.route}>
        <Text style={styles.routeText} numberOfLines={1}>
          📍 {item.origin_address}
        </Text>
        <Text style={styles.routeText} numberOfLines={1}>
          🏁 {item.destination_address}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={styles.distance}>{item.distance_km} km</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('es-MX')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis viajes</Text>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No tienes viajes aún</Text>
        }
        onRefresh={loadTrips}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripType: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  route: {
    marginBottom: 12,
    gap: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#444',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 13,
    color: '#888',
  },
  date: {
    fontSize: 13,
    color: '#888',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 60,
  },
});