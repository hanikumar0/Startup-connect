import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import ChatScreen from '../screens/ChatScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import AuditDetailScreen from '../screens/AuditDetailScreen';
import CRMScreen from '../screens/CRMScreen';
import RaiseTrackerScreen from '../screens/RaiseTrackerScreen';
import IntelligenceScreen from '../screens/IntelligenceScreen';
import GrantsScreen from '../screens/GrantsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import VDRScreen from '../screens/VDRScreen';
import VDRRoomScreen from '../screens/VDRRoomScreen';
import AICoachScreen from '../screens/AICoachScreen';
import SavedHubScreen from '../screens/SavedHubScreen';
import IntegrationsScreen from '../screens/IntegrationsScreen';
import DeckScreen from '../screens/DeckScreen';
import BillingScreen from '../screens/BillingScreen';
import NetworkScreen from '../screens/NetworkScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MeetingsScreen from '../screens/MeetingsScreen';



import { 
    LayoutDashboard, 
    Compass, 
    Briefcase,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    const { theme, isDark } = useTheme();
    
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.mutedForeground,
                tabBarStyle: {
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    backgroundColor: 'transparent',
                    height: 70,
                    paddingBottom: 12,
                    paddingTop: 8,
                },
                tabBarBackground: () => (
                    <BlurView 
                        tint={isDark ? "dark" : "light"} 
                        intensity={90} 
                        style={{ 
                            flex: 1, 
                            borderTopWidth: 1, 
                            borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' 
                        }} 
                    />
                ),
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontFamily: 'Inter-Black',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="CRM"
                component={CRMScreen}
                options={{
                    title: 'Pipeline',
                    tabBarIcon: ({ color, size }) => <Target color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="Raise"
                component={RaiseTrackerScreen}
                options={{
                    title: 'Raise',
                    tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />
                }}
            />
            <Tab.Screen
                name="News"
                component={IntelligenceScreen}
                options={{
                    title: 'Intel',
                    tabBarIcon: ({ color, size }) => <Zap color={color} size={size} />
                }}
            />
        </Tab.Navigator>
    );
}


export const AppNavigator = () => {

    const { user, loading } = useAuth();
    const { theme, isDark } = useTheme();

    if (loading) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer theme={{
                dark: isDark,
                colors: {
                    primary: theme.primary,
                    background: theme.background,
                    card: theme.card,
                    text: theme.foreground,
                    border: theme.border,
                    notification: theme.destructive,
                }
            }}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {user ? (
                        !user.onboardingCompleted ? (
                            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        ) : (
                            <>
                                <Stack.Screen name="MainTabs" component={MainTabs} />
                                <Stack.Screen name="Chat" component={ChatScreen} />
                                <Stack.Screen name="VideoCall" component={VideoCallScreen} />
                                <Stack.Screen name="AuditDetail" component={AuditDetailScreen} />
                                <Stack.Screen name="Grants" component={GrantsScreen} />
                                <Stack.Screen name="Alerts" component={AlertsScreen} />
                                <Stack.Screen name="Verification" component={VerificationScreen} />
                                <Stack.Screen name="VDR" component={VDRScreen} />
                                <Stack.Screen name="VDRRoom" component={VDRRoomScreen} />
                                <Stack.Screen name="AICoach" component={AICoachScreen} />
                                <Stack.Screen name="SavedHub" component={SavedHubScreen} />
                                <Stack.Screen name="Integrations" component={IntegrationsScreen} />
                                <Stack.Screen name="Deck" component={DeckScreen} />
                                <Stack.Screen name="Billing" component={BillingScreen} />
                                <Stack.Screen name="Network" component={NetworkScreen} />
                                <Stack.Screen name="Meetings" component={MeetingsScreen} />
                            </>
                        )
                    ) : (
                        <>
                            <Stack.Screen name="Login" component={LoginScreen} />
                            <Stack.Screen name="Register" component={RegisterScreen} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    );
};

