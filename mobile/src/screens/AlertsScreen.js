import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Trash2, CheckCircle, Clock, Target, User, Sparkles, Trophy, Star, AlertTriangle, Info, Calendar, MessageSquare, ShieldCheck, TrendingUp, Zap, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const TYPE_META = {
    new_investor_match:       { icon: Target,       color: "#6366f1" },
    investor_viewed_profile:  { icon: User,         color: "#3b82f6" },
    warm_intro_available:     { icon: Sparkles,     color: "#a855f7" },
    grant_deadline_soon:      { icon: Trophy,       color: "#f59e0b" },
    funding_score_improved:   { icon: TrendingUp,   color: "#10b981" },
    badge_awarded:            { icon: Star,         color: "#ea580c" },
    system_alert:             { icon: Info,         color: "#64748b" },
    new_grant_match:          { icon: Trophy,       color: "#10b981" },
    accelerator_match:        { icon: Zap,          color: "#6366f1" },
};

const AlertsScreen = () => {
    const { theme, isDark } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');

    const filters = ['ALL', 'UNREAD', 'CRITICAL'];

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.notifications);
            }
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markRead = async (id) => {
        try {
            await api.put(`/notifications/read/${id}`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {}
    };

    const deleteNotif = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {}
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString().toUpperCase() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase();
    };

    const filtered = notifications.filter(n => {
        if (activeFilter === 'UNREAD') return !n.isRead;
        if (activeFilter === 'CRITICAL') return n.priority === 'critical' || n.priority === 'important';
        return true;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <View>
                    <Text style={[styles.headerLabel, { color: theme.mutedForeground }]}>SYSTEM INTELLIGENCE</Text>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]}>SMART ALERTS</Text>
                </View>
                <TouchableOpacity onPress={() => { setRefreshing(true); loadNotifications(); }} style={[styles.refreshBtn, { backgroundColor: theme.muted }]}>
                    <Clock size={18} color={theme.foreground} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterBar}>
                {filters.map(f => (
                    <TouchableOpacity 
                        key={f} 
                        style={[styles.filterTab, { backgroundColor: theme.muted }, activeFilter === f && { backgroundColor: theme.primary }]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.filterText, { color: theme.mutedForeground }, activeFilter === f && { color: '#fff' }]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <ScrollView 
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifications(); }} tintColor={theme.primary} />}
                >
                    {filtered.length > 0 ? (
                        filtered.map((item, i) => {
                            const meta = TYPE_META[item.type] || TYPE_META.system_alert;
                            const Icon = meta.icon;

                            return (
                                <Animated.View key={item._id} entering={FadeInDown.delay(i * 100)}>
                                    <TouchableOpacity 
                                        style={[styles.notifCard, { backgroundColor: theme.card, borderColor: theme.border }, !item.isRead && { borderColor: theme.primary + '40' }]}
                                        onPress={() => markRead(item._id)}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: meta.color + '15' }]}>
                                            <Icon color={meta.color} size={18} />
                                        </View>
                                        <View style={styles.notifBody}>
                                            <View style={styles.notifHeader}>
                                                <Text style={[styles.notifTitle, { color: theme.foreground }]} numberOfLines={1}>{item.title.toUpperCase()}</Text>
                                                {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
                                            </View>
                                            <Text style={[styles.notifMsg, { color: theme.mutedForeground }]}>{item.message}</Text>
                                            <Text style={[styles.notifTime, { color: theme.mutedForeground }]}>{formatTime(item.createdAt)}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNotif(item._id)}>
                                            <Trash2 size={14} color={theme.mutedForeground} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })
                    ) : (
                        <Animated.View entering={FadeIn} style={styles.emptyState}>
                            <View style={[styles.emptyIconBox, { backgroundColor: theme.muted }]}>
                                <Bell size={40} color={theme.mutedForeground} strokeWidth={1.5} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>FEED SYNCHRONIZED</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.mutedForeground }]}>No pending alerts requiring immediate focus.</Text>
                        </Animated.View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1 },
    headerLabel: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2 },
    headerTitle: { fontSize: 22, fontFamily: 'Inter-Black', letterSpacing: -0.5, marginTop: 4 },
    refreshBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    filterBar: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, gap: 8 },
    filterTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
    filterText: { fontSize: 9, fontFamily: 'Inter-Black', letterSpacing: 1 },
    content: { flex: 1, paddingHorizontal: 24 },
    notifCard: { flexDirection: 'row', padding: 20, borderRadius: 28, marginBottom: 12, borderWidth: 1, alignItems: 'flex-start' },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    notifBody: { flex: 1 },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    notifTitle: { fontSize: 13, fontFamily: 'Inter-Black', flex: 1 },
    notifTime: { fontSize: 9, fontFamily: 'Inter-Bold', marginTop: 8, opacity: 0.5 },
    notifMsg: { fontSize: 12, fontFamily: 'Inter-Medium', lineHeight: 18 },
    unreadDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 8 },
    deleteBtn: { padding: 8, marginLeft: 4 },
    emptyState: { alignItems: 'center', paddingTop: 100 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 14, fontFamily: 'Inter-Black', letterSpacing: 1 },
    emptySubtitle: { fontSize: 12, fontFamily: 'Inter-Medium', marginTop: 8, textAlign: 'center' }
});

export default AlertsScreen;
