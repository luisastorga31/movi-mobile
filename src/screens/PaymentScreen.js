import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PaymentScreen({ route, navigation }) {
  const { trip, onPaymentComplete } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  

  const payCash = async () => {
    Alert.alert(
      'Pago en efectivo',
      `¿Confirmas el pago de $${trip.price} en efectivo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setLoading(true);
              await api.post('/payments/cash', { trip_id: trip.id });
              Alert.alert('✅ Pago confirmado', 'Gracias por usar Movi', [
                { text: 'OK', onPress: () => { onPaymentComplete && onPaymentComplete(); navigation.popToTop(); } }
              ]);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Error al procesar pago');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const payCard = async () => {
    try {
      setLoading(true);
      const res = await api.post('/payments/intent', { trip_id: trip.id });
      Alert.alert(
        '💳 Pago con tarjeta',
        `Monto: $${trip.price}\n\nEn producción aquí aparecería el formulario de Stripe.`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Error al procesar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagar viaje</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Destino</Text>
        <Text style={styles.summaryValue}>{trip.destination_address}</Text>
        <Text style={styles.summaryLabel}>Distancia</Text>
        <Text style={styles.summaryValue}>{trip.distance_km} km</Text>
        <Text style={styles.priceLabel}>Total</Text>
        <Text style={styles.price}>${trip.price}</Text>
      </View>

      <Text style={styles.methodTitle}>Selecciona método de pago</Text>

      <TouchableOpacity
        style={styles.methodButton}
        onPress={payCash}
        disabled={loading}
      >
        <Text style={styles.methodEmoji}>💵</Text>
        <View>
          <Text style={styles.methodName}>Efectivo</Text>
          <Text style={styles.methodDesc}>Paga directamente al conductor</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.methodButton}
        onPress={payCard}
        disabled={loading}
      >
        <Text style={styles.methodEmoji}>💳</Text>
        <View>
          <Text style={styles.methodName}>Tarjeta</Text>
          <Text style={styles.methodDesc}>Pago seguro con Stripe</Text>
        </View>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  priceLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 16,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  methodButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  methodEmoji: {
    fontSize: 32,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodDesc: {
    fontSize: 13,
    color: '#888',
  },
});