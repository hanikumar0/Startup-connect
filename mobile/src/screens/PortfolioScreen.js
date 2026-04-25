import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Briefcase, TrendingUp, PieChart, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react-native';
import { API_URL } from '../utils/constants';

const PortfolioScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConnections = async () => {
        try {
            const response = await axios.get(`${API_URL}/users/connections`);
            if (response.data.success) {
                setConnections(response.data.connections || []);
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchConnections();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your Portfolio</Text>
                <Text style={styles.subtitle}>
                    {user?.role === 'INVESTOR' ? 'Active investments and deal flow' : 'Connected investors and advisors'}
                </Text>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.statsGrid}>
                    <View style={[styles.statBox, { borderLeftColor: '#4f46e5' }]}>
                        <PieChart size={18} color="#4f46e5" />
                        <Text style={styles.statValue}>{connections.length}</Text>
                        <Text style={styles.statLabel}>Partners</Text>
                    </View>
                    <View style={[styles.statBox, { borderLeftColor: '#059669' }]}>
                        <TrendingUp size={18} color="#059669" />
                        <Text style={styles.statValue}>12%</Text>
                        <Text style={styles.statLabel}>Avg Yield</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {user?.role === 'INVESTOR' ? 'Invested Companies' : 'Strategic Partners'}
                    </Text>
                    <Badge count={connections.length} />
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />
                ) : connections.length > 0 ? (
                    connections.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.dealCard}
                            onPress={() => navigation.navigate('Chat', { partnerId: item.id, partnerName: item.name })}
                        >
                            <View style={styles.dealInfo}>
                                <View style={[styles.logoContainer, { backgroundColor: item.role === 'INVESTOR' ? '#4f46e5' : '#059669' }]}>
                                    <Briefcase size={20} color="#fff" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.businessName}>{item.name}</Text>
                                        <ShieldCheck size={14} color="#059669" />
                                    </View>
                                    <Text style={styles.dealStage}>
                                        {item.role === 'INVESTOR' ? 'Lead Investor' : 'Series A Startup'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.tagRow}>
                                <View style={styles.miniTag}>
                                    <Zap size={10} color="#b45309" />
                                    <Text style={styles.miniTagText}>MATCHED</Text>
                                </View>
                                <ArrowUpRight size={18} color="#94a3b8" />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIllustration}>
                            <Briefcase size={40} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>No strategic partners yet</Text>
                        <Text style={styles.emptySubtitle}>Start swiping in Discovery to find and connect with {user?.role === 'INVESTOR' ? 'startups' : 'investors'}.</Text>
                        <TouchableOpacity
                            style={styles.discoverBtn}
                            onPress={() => navigation.navigate('DiscoverFlow')}
                        >
                            <Text style={styles.discoverBtnText}>Go to Discover</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const Badge = ({ count }) => (
    <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        padding: 24,
        paddingTop: 40,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    badge: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#475569',
    },
    dealCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    dealInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    businessName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
    },
    dealStage: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    tagRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    miniTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    miniTagText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#b45309',
    },
    emptyState: {
        marginTop: 40,
        alignItems: 'center',
        padding: 32,
    },
    emptyIllustration: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    discoverBtn: {
        marginTop: 24,
        backgroundColor: '#4f46e5',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
    },
    discoverBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    }
});

export default PortfolioScreen;
