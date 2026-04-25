import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { 
  Rocket, 
  Target, 
  MessageSquare, 
  Calendar, 
  User,
  LayoutDashboard
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Screens
import DiscoverScreen from '../screens/DiscoverScreen';
import MatchScreen from '../screens/MatchScreen';
import MessagesScreen from '../screens/MessagesScreen';
import MeetingsScreen from '../screens/MeetingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import LoginScreen from '../screens/LoginScreen';

function TabNavigator() {
  return (
    <Tab.Navigator
      id="main-institutional-tabs"
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 90,
          paddingBottom: 25,
          paddingTop: 10,
          backgroundColor: '#fff'
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 1
        },
        headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#f1f5f9'
        },
        headerTitleStyle: {
            fontFamily: 'System', // Bold or Black italic if possible on mobile fonts
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: -0.5,
            fontSize: 16
        }
      }}
    >
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen} 
        options={{
          tabBarIcon: ({ color }) => <Rocket size={24} color={color} />,
          title: "Venture Stream"
        }} 
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchScreen} 
        options={{
          tabBarIcon: ({ color }) => <Target size={24} color={color} />,
          title: "Strategic Matches"
        }} 
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen} 
        options={{
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
          title: "Pulse"
        }} 
      />
      <Tab.Screen 
        name="Meetings" 
        component={MeetingsScreen} 
        options={{
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
          title: "Calendar"
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          title: "Identity"
        }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator 
      id="root-institutional-stack"
      screenOptions={{ headerShown: false }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
            options={{ 
                headerShown: true, 
                headerTitle: "Message Intelligence",
                headerBackTitle: "Pulse"
            }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}
