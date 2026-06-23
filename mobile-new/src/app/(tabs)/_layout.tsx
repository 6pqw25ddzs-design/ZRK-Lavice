import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarStyle: { backgroundColor: Colors.card, borderTopColor: Colors.border },
      headerStyle: { backgroundColor: Colors.dark },
      headerTintColor: Colors.text,
      headerTitleStyle: { fontWeight: 'bold' },
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Početna',
        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        headerTitle: 'ZRK Lavice',
      }} />
      <Tabs.Screen name="raspored" options={{
        title: 'Raspored',
        tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
      }} />
      <Tabs.Screen name="ekipe" options={{
        title: 'Ekipe',
        tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
      }} />
      <Tabs.Screen name="vijesti" options={{
        title: 'Vijesti',
        tabBarIcon: ({ color, size }) => <Ionicons name="newspaper" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
