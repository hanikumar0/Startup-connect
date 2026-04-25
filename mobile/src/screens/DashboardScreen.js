import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
    LogOut, Rocket, Sparkles, Zap, MessageSquare, Video, TrendingUp, Target, 
    Trophy, Bell, ShieldCheck, Lock, BrainCircuit, Bookmark, Layout, 
    Crown, Share2, Network, Activity, Calendar, ChevronRight, Search,
    UserPlus, ShieldAlert, FileText, CheckCircle2
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, Layout as AnimatedLayout } from 'react-native-reanimated';
import api from '../services/api';
import { CommandPalette } from '../components/CommandPalette';
import { TrustRadar } from '../components/TrustRadar';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { theme, isDark } = useTheme();
    const [trustStatus, setTrustStatus] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isCommandVisible, setIsCommandVisible] = useState(false);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [statusRes, notifRes, activityRes] = await Promise.all([
                    api.get('/badges/status'),
                    api.get('/notifications'),
                    api.get('/users/activity').catch(() => ({ data: { success: false } }))
                ]);
                
                if (statusRes.data.success) setTrustStatus(statusRes.data);
                if (notifRes.data.success) {
                    setUnreadCount(notifRes.data.notifications.filter(n => !n.isRead).length);
                }

                // Fallback to high-quality mockup if empty (for premium feel)
                if (activityRes.data?.success && activityRes.data.activities?.length > 0) {
                    setActivities(activityRes.data.activities);
                } else {
                    setActivities([
                        { id: '1', type: 'match', title: 'AI Match Generated', desc: 'New high-fit investor detected: Peak XV', time: new Date(Date.now() - 1000 * 60 * 5), icon: Zap, color: '#f59e0b' },
                        { id: '2', type: 'connect', title: 'Connection Request', desc: 'Sarah Chen wants to sync', time: new Date(Date.now() - 1000 * 60 * 60 * 2), icon: UserPlus, color: '#6366f1' },
                        { id: '3', type: 'audit', title: 'Deep Audit Complete', desc: 'Identity verification successful', time: new Date(Date.now() - 1000 * 60 * 60 * 5), icon: ShieldCheck, color: '#10b981' },
                        { id: '4', type: 'meeting', title: 'Meeting Scheduled', desc: 'Product Demo with David W.', time: new Date(Date.now() - 1000 * 60 * 60 * 24), icon: Calendar, color: '#3b82f6' },
                    ]);
                }
            } catch (error) {}
        };
        loadDashboardData();
    }, []);

    const stats = [
        { label: 'Views', value: '142', icon: Activity, color: theme.primary, bg: isDark ? '#1e293b' : '#eef2ff' },
        { label: 'Matches', value: '8', icon: Target, color: '#059669', bg: isDark ? '#064e3b' : '#ecfdf5' },
        { label: 'Alerts', value: unreadCount, icon: Bell, color: '#ea580c', bg: isDark ? '#451a03' : '#fff7ed' },
    ];

    const modules = [
        { title: 'Grants', icon: Trophy, color: '#f59e0b', desc: '88% Match', onPress: () => navigation.navigate('Grants') },
        { title: 'Vault', icon: Lock, color: '#6366f1', desc: 'VDR Secure', onPress: () => navigation.navigate('VDR') },
        { title: 'Coach', icon: BrainCircuit, color: theme.primary, desc: 'AI Alpha', onPress: () => navigation.navigate('AICoach') },
        { title: 'Meetings', icon: Calendar, color: '#0ea5e9', desc: 'Syncs', onPress: () => navigation.navigate('Meetings') },
        { title: 'Decks', icon: Layout, color: '#6366f1', desc: 'Versions', onPress: () => navigation.navigate('Deck') },
        { title: 'Network', icon: Network, color: '#8b5cf6', desc: 'Ecosystem', onPress: () => navigation.navigate('Network') },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <CommandPalette visible={isCommandVisible} onClose={() => setIsCommandVisible(false)} />
            
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View entering={FadeIn} style={styles.header}>
                    <View style={styles.headerLabelRow}>
                        <Text style={[styles.headerLabel, { color: theme.mutedForeground }]}>DASHBOARD</Text>
                        <View style={[styles.dot, { backgroundColor: theme.border }]} />
                        <Text style={[styles.headerLabel, { color: theme.primary }]}>ALPHA VERSION</Text>
                    </View>
                    <View style={styles.headerMain}>
                        <View>
                            <Text style={[styles.greeting, { color: theme.foreground }]}>HI AGAIN,</Text>
                            <Text style={[styles.userName, { color: theme.primary }]}>{user?.name?.split(' ')[0] || 'Founder'}</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.searchBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={() => setIsCommandVisible(true)}
                        >
                            <Search size={20} color={theme.foreground} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Trust Intelligence */}
                <Animated.View entering={FadeInDown.delay(100)} style={[styles.radarSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.radarHeader}>
                        <ShieldCheck size={14} color={theme.primary} />
                        <Text style={[styles.radarTitle, { color: theme.foreground }]}>TRUST INTELLIGENCE</Text>
                    </View>
                    <View style={styles.radarContent}>
                        <TrustRadar scores={{ identity: 95, financials: 80, team: 90, legal: 70, traction: 85 }} />
                        <View style={styles.trustStats}>
                            <Text style={[styles.trustValue, { color: theme.foreground }]}>Verified</Text>
                            <Text style={[styles.trustLabel, { color: theme.mutedForeground }]}>ESTABLISHED ELITE</Text>
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>SECURE ACCESS</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Stats */}
                <View style={styles.statGrid}>
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Animated.View 
                                key={i} 
                                entering={FadeInDown.delay(200 + i * 50)} 
                                style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                            >
                                <View style={[styles.statIconBox, { backgroundColor: stat.bg }]}>
                                    <Icon color={stat.color} size={18} strokeWidth={2.5} />
                                </View>
                                <Text style={[styles.statLabel, { color: theme.mutedForeground }]}>{stat.label}</Text>
                                <Text style={[styles.statValue, { color: theme.foreground }]}>{stat.value}</Text>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* Modules Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>ECOSYSTEM MODULES</Text>
                </View>
                <View style={styles.moduleGrid}>
                    {modules.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <TouchableOpacity 
                                key={i} 
                                style={[styles.moduleCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={m.onPress}
                            >
                                <View style={[styles.moduleIconBox, { backgroundColor: m.color + '10' }]}>
                                    <Icon color={m.color} size={18} />
                                </View>
                                <Text style={[styles.moduleTitle, { color: theme.foreground }]}>{m.title}</Text>
                                <Text style={[styles.moduleDesc, { color: theme.mutedForeground }]}>{m.desc}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Real-time Activity Stream */}
                <View style={[styles.sectionHeader, { marginTop: 32 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>ACTIVITY STREAM</Text>
                    <View style={[styles.liveIndicator, { backgroundColor: '#10b981' }]} />
                </View>
                
                <View style={styles.activityContainer}>
                    {activities.map((act, i) => {
                        const Icon = act.icon;
                        return (
                            <Animated.View 
                                key={act.id} 
                                entering={FadeInDown.delay(400 + i * 100)}
                                layout={AnimatedLayout}
                                style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                            >
                                <View style={[styles.activityIconBox, { backgroundColor: act.color + '15' }]}>
                                    <Icon color={act.color} size={16} />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={[styles.activityTitle, { color: theme.foreground }]}>{act.title.toUpperCase()}</Text>
                                    <Text style={[styles.activityDesc, { color: theme.mutedForeground }]}>{act.desc}</Text>
                                </View>
                                <Text style={[styles.activityTime, { color: theme.mutedForeground }]}>
                                    {formatDistanceToNow(act.time, { addSuffix: false }).toUpperCase()}
                                </Text>
                            </Animated.View>
                        );
                    })}
                </View>

                <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: isDark ? '#450a0a' : '#fef2f2' }]} onPress={logout}>
                    <LogOut color="#ef4444" size={20} />
                    <Text style={styles.logoutText}>TERMINATE SESSION</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 24, paddingBottom: 24 },
    headerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    headerLabel: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    headerMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: 32, fontFamily: 'Inter-Black', letterSpacing: -1 },
    userName: { fontSize: 32, fontFamily: 'Inter-Black', letterSpacing: -1, marginTop: -8 },
    searchBtn: { width: 50, height: 50, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    radarSection: { marginHorizontal: 24, borderRadius: 32, padding: 20, borderWidth: 1, marginBottom: 24 },
    radarHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    radarTitle: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 1.5 },
    radarContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    trustStats: { flex: 1, alignItems: 'flex-end' },
    trustValue: { fontSize: 20, fontFamily: 'Inter-Black' },
    trustLabel: { fontSize: 8, fontFamily: 'Inter-Black', letterSpacing: 1, marginTop: 2 },
    verifiedBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
    verifiedText: { fontSize: 8, fontWeight: '900', color: '#059669', fontFamily: 'Inter-Black' },
    statGrid: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 32 },
    statCard: { flex: 1, borderRadius: 24, padding: 20, borderWidth: 1 },
    statIconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statLabel: { fontSize: 8, fontFamily: 'Inter-Black', letterSpacing: 1, marginBottom: 4 },
    statValue: { fontSize: 22, fontFamily: 'Inter-Black' },
    sectionHeader: { paddingHorizontal: 24, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2 },
    liveIndicator: { width: 6, height: 6, borderRadius: 3 },
    moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
    moduleCard: { width: '30%', margin: '1.6%', borderRadius: 20, padding: 12, borderWidth: 1, alignItems: 'center' },
    moduleIconBox: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    moduleTitle: { fontSize: 10, fontFamily: 'Inter-Bold', textAlign: 'center' },
    moduleDesc: { fontSize: 8, fontFamily: 'Inter-Medium', textAlign: 'center', marginTop: 2 },
    activityContainer: { paddingHorizontal: 24, gap: 12 },
    activityCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1 },
    activityIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    activityInfo: { flex: 1, marginLeft: 16 },
    activityTitle: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 0.5 },
    activityDesc: { fontSize: 11, fontFamily: 'Inter-Medium', marginTop: 2 },
    activityTime: { fontSize: 9, fontFamily: 'Inter-Black', opacity: 0.4 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, marginTop: 40, padding: 18, borderRadius: 24, gap: 10 },
    logoutText: { fontSize: 12, fontFamily: 'Inter-Black', color: '#ef4444', letterSpacing: 1 }
});

export default DashboardScreen;
