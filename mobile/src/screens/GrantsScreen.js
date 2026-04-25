import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Linking,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Zap, Building2, Star, GraduationCap, Clock, ExternalLink, Sparkles, Search, X, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const TYPE_META = {
    grant: { label: "GRANT", icon: Trophy, color: "#059669" },
    accelerator: { label: "ACCELERATOR", icon: Zap, color: "#6366f1" },
    incubator: { label: "INCUBATOR", icon: Building2, color: "#2563eb" },
    competition: { label: "COMPETITION", icon: Star, color: "#f59e0b" },
    program: { label: "PROGRAM", icon: GraduationCap, color: "#7c3aed" },
};

const GrantsScreen = () => {
    const { theme, isDark } = useTheme();
    const [grants, setGrants] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    const tabs = ['ALL', 'GRANTS', 'ACCELERATORS', 'PROGRAMS'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [grantsRes, recRes] = await Promise.all([
                api.get('/grants?limit=20'),
                api.get('/grants/recommended').catch(() => ({ data: { success: false } }))
            ]);

            if (grantsRes.data.success) setGrants(grantsRes.data.grants);
            if (recRes.data.success) setRecommended(recRes.data.grants);
        } catch (error) {
            console.error('Failed to load grants', error);
        } finally {
            setLoading(false);
        }
    };

    const renderGrantCard = ({ item, index }) => {
        const meta = TYPE_META[item.type] || TYPE_META.grant;
        const Icon = meta.icon;

        return (
            <Animated.View entering={FadeInDown.delay(index * 100)}>
                <TouchableOpacity 
                    style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={() => item.applyUrl && Linking.openURL(item.applyUrl)}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.typeIcon, { backgroundColor: meta.color + '15' }]}>
                            <Icon color={meta.color} size={18} />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
                            <Text style={[styles.provider, { color: theme.mutedForeground }]}>{item.provider.toUpperCase()}</Text>
                        </View>
                        {item.matchScore > 50 && (
                            <View style={[styles.matchBadge, { backgroundColor: theme.primary + '15' }]}>
                                <Sparkles color={theme.primary} size={10} />
                                <Text style={[styles.matchText, { color: theme.primary }]}>AI MATCH</Text>
                            </View>
                        )}
                    </View>

                    <Text style={[styles.title, { color: theme.foreground }]}>{item.title.toUpperCase()}</Text>
                    
                    {item.fundingAmount && (
                        <Text style={[styles.funding, { color: '#10b981' }]}>{item.fundingAmount}</Text>
                    )}

                    <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                        <View style={styles.deadlineRow}>
                            <Clock size={12} color={theme.mutedForeground} />
                            <Text style={[styles.deadlineText, { color: theme.mutedForeground }]}>
                                {item.deadlineText?.toUpperCase() || (item.deadline ? new Date(item.deadline).toLocaleDateString().toUpperCase() : 'ROLLING')}
                            </Text>
                        </View>
                        <ExternalLink size={14} color={theme.primary} />
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]}>ECOSYSTEM INCENTIVES</Text>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]}>CAPITAL HUB</Text>
                </View>

                {recommended.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Sparkles color={theme.primary} size={14} />
                            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>RECOMMENDED ACCESS</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
                            {recommended.map((item, i) => (
                                <Animated.View key={item._id} entering={FadeInDown.delay(200 + i * 100)}>
                                    <TouchableOpacity 
                                        style={[styles.recCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                        onPress={() => item.applyUrl && Linking.openURL(item.applyUrl)}
                                    >
                                        <Text style={[styles.recType, { color: theme.primary }]}>{(TYPE_META[item.type] || TYPE_META.grant).label}</Text>
                                        <Text style={[styles.recTitle, { color: theme.foreground }]} numberOfLines={2}>{item.title.toUpperCase()}</Text>
                                        <Text style={[styles.recFunding, { color: '#10b981' }]}>{item.fundingAmount}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.tabBar}>
                    {tabs.map(tab => (
                        <TouchableOpacity 
                            key={tab} 
                            style={[styles.tab, { backgroundColor: theme.muted }, activeTab === tab && { backgroundColor: theme.primary }]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, { color: theme.mutedForeground }, activeTab === tab && { color: '#fff' }]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.listContainer}>
                        {grants
                            .filter(g => activeTab === 'ALL' || g.type.toUpperCase().includes(activeTab.slice(0, -1)))
                            .map((item, i) => (
                                <View key={item._id}>
                                    {renderGrantCard({ item, index: i })}
                                </View>
                            ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingVertical: 20 },
    headerSubtitle: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2 },
    headerTitle: { fontSize: 24, fontFamily: 'Inter-Black', letterSpacing: -0.5, marginTop: 4 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16, gap: 8 },
    sectionTitle: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 1.5 },
    recScroll: { paddingHorizontal: 24, gap: 12 },
    recCard: { width: 220, borderRadius: 28, padding: 20, borderWidth: 1 },
    recType: { fontSize: 9, fontFamily: 'Inter-Black', letterSpacing: 1, marginBottom: 10 },
    recTitle: { fontSize: 14, fontFamily: 'Inter-Black', letterSpacing: -0.2, marginBottom: 16, height: 40, lineHeight: 18 },
    recFunding: { fontSize: 13, fontFamily: 'Inter-Black' },
    tabBar: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20, gap: 8 },
    tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
    tabText: { fontSize: 9, fontFamily: 'Inter-Black', letterSpacing: 1 },
    listContainer: { paddingHorizontal: 24, paddingBottom: 40 },
    card: { borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    typeIcon: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    headerText: { flex: 1 },
    typeLabel: { fontSize: 9, fontFamily: 'Inter-Black', letterSpacing: 1 },
    provider: { fontSize: 10, fontFamily: 'Inter-Bold', marginTop: 2 },
    matchBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    matchText: { fontSize: 9, fontFamily: 'Inter-Black' },
    title: { fontSize: 15, fontFamily: 'Inter-Black', letterSpacing: -0.2, marginBottom: 8, lineHeight: 20 },
    funding: { fontSize: 14, fontFamily: 'Inter-Black', marginBottom: 20 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1 },
    deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    deadlineText: { fontSize: 10, fontFamily: 'Inter-Black' }
});

export default GrantsScreen;
