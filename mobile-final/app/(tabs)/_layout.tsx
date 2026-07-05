import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/AppColors';

function tabIcon(active: keyof typeof Ionicons.glyphMap, inactive: keyof typeof Ionicons.glyphMap) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={25} color={color} />
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: '#B5B5B5',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#F0F0F0',
        height: 86,
        paddingTop: 8,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTintColor: Colors.text,
      headerTitleStyle: { fontWeight: 'bold' },
      headerShadowVisible: false,
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Početna',
        tabBarIcon: tabIcon('home', 'home-outline'),
        headerShown: false,
      }} />
      <Tabs.Screen name="raspored" options={{
        title: 'Raspored',
        tabBarIcon: tabIcon('calendar', 'calendar-outline'),
        headerShown: false,
      }} />
      <Tabs.Screen name="ekipe" options={{
        title: 'Ekipe',
        tabBarIcon: tabIcon('people', 'people-outline'),
        headerShown: false,
      }} />
      <Tabs.Screen name="vijesti" options={{
        title: 'Vijesti',
        tabBarIcon: tabIcon('newspaper', 'newspaper-outline'),
        headerShown: false,
      }} />
      <Tabs.Screen name="vise" options={{
        title: 'Klub',
        tabBarIcon: tabIcon('grid', 'grid-outline'),
        headerShown: false,
      }} />
    </Tabs>
  );
}
