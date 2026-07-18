import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const ACCOUNTS = [
  {
    name: 'Luis Astorga',
    email: 'luis@movi.com',
    password: '123456',
    role: 'passenger',
    emoji: '🧍',
  },
  {
    name: 'Carlos Conductor',
    email: 'carlos@test.com',
    password: '123456',
    role: 'driver',
    emoji: '🚗',
  },
];

export default function SwitchAccountScreen({ navigation }) {
  const { login } = useAuth();

  const switchTo = async (account) => {
    try {
      await login(account.email, account.password);
    } catch (err) {
      console.error('Error al cambiar cuenta:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona cuenta</Text>
      <Text style={styles.subtitle}>Solo para desarrollo</Text>

      {ACCOUNTS.map((account) => (
        <TouchableOpacity
          key={account.email}
          style={styles.card}
          onPress={() => switchTo(account)}
        >
          <Text style={styles.emoji}>{account.emoji}</Text>
          <View>
            <Text style={styles.name}>{account.name}</Text>
            <Text style={styles.role}>{account.role}</Text>
            <Text style={styles.email}>{account.email}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  emoji: {
    fontSize: 36,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  role: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  email: {
    fontSize: 12,
    color: '#999',
  },
});