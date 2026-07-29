import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { authService, driverService } from '../services/api';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [driverProfile, setDriverProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await authService.me();
            setProfile(res.data);

            if (user.role === 'driver') {
                try {
                    const dp = await driverService.getProfile();
                    setDriverProfile(dp.data);
                } catch (e) { }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {profile?.name?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.name}>{profile?.name}</Text>
                <Text style={styles.role}>
                    {profile?.role === 'driver' ? '🚗 Conductor' : '🧍 Pasajero'}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información personal</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{profile?.email}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Teléfono</Text>
                    <Text style={styles.value}>{profile?.phone}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Miembro desde</Text>
                    <Text style={styles.value}>
                        {new Date(profile?.created_at).toLocaleDateString('es-MX')}
                    </Text>
                </View>
            </View>

            {driverProfile && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mi vehículo</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Marca</Text>
                        <Text style={styles.value}>{driverProfile.vehicle_brand}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Modelo</Text>
                        <Text style={styles.value}>{driverProfile.vehicle_model}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Año</Text>
                        <Text style={styles.value}>{driverProfile.vehicle_year}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Placa</Text>
                        <Text style={styles.value}>{driverProfile.vehicle_plate}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Color</Text>
                        <Text style={styles.value}>{driverProfile.vehicle_color}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Calificación</Text>
                        <Text style={styles.value}>⭐ {driverProfile.rating}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Viajes totales</Text>
                        <Text style={styles.value}>{driverProfile.total_trips}</Text>
                    </View>
                </View>
            )}

            {user.role === 'driver' && !driverProfile && (
                <TouchableOpacity
                    style={styles.registerVehicleButton}
                    onPress={() => navigation.navigate('RegisterVehicle')}
                >
                    <Text style={styles.registerVehicleText}>🚗 Registrar vehículo</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#000',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 30,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        color: '#aaa',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        fontSize: 14,
        color: '#888',
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    logoutButton: {
        margin: 16,
        borderWidth: 1,
        borderColor: '#ff3b30',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 40,
    },
    logoutText: {
        color: '#ff3b30',
        fontWeight: 'bold',
        fontSize: 16,
    },
    registerVehicleButton: {
  margin: 16,
  backgroundColor: '#000',
  borderRadius: 12,
  padding: 16,
  alignItems: 'center',
},
registerVehicleText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
});