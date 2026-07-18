import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SwitchAccountScreen from '../screens/auth/SwitchAccountScreen';
import PassengerHomeScreen from '../screens/passenger/HomeScreen';
import DriverHomeScreen from '../screens/driver/HomeScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const PassengerTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Inicio" component={PassengerHomeScreen} />
    <Tab.Screen
      name="Cambiar"
      component={SwitchAccountScreen}
      options={{ tabBarLabel: '🔄 Cuenta' }}
    />
  </Tab.Navigator>
);

const DriverTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Inicio" component={DriverHomeScreen} />
    <Tab.Screen
      name="Cambiar"
      component={SwitchAccountScreen}
      options={{ tabBarLabel: '🔄 Cuenta' }}
    />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.role === 'driver' ? (
        <DriverTabs />
      ) : (
        <PassengerTabs />
      )}
    </NavigationContainer>
  );
}