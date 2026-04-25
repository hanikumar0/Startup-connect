import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    CreditCard, 
    Zap, 
    ShieldCheck, 
    TrendingUp, 
    Clock, 
    History, 
    ArrowRight, 
    ChevronLeft, 
    Download,
    Star
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import axios from 'axios';
import { API_URL } from '../utils/constants';

const { width } = Dimensions.get('window');

const BillingScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const [subscription, setSubscription] = useState(null);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBillingInfo();
    }, []);

    const fetchBillingInfo = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/billing/subscription`);
            if (res.data.success) {
                setSubscription(res.data.subscription);
                setUsage(res.data.usage);
            }
        } catch (err) {
            console.error('Failed to fetch billing', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBoost = async () => {
        try {
            await axios.post(`${API_URL}/billing/boost`);
            // Show success toast or alert
        } catch (err) {
            console.error('Boost failed', err);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loading, { backgroundColor: theme.background }]}>
                <ActivityIndicator color={theme.primary} size="large" />
            </View>
        );
    }

    const sub = subscription || { plan: 'free', status: 'active', endDate: new Date() };
    const use = usage || { messagesSent: 0, contactsUnlocked: 0 };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.foreground} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.foreground }]}>STRATEGIC BILLING</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Status Badge */}
                <Animated.View entering={FadeIn} style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: sub.status === 'active' ? '#10b98120' : '#ef444420' }]}>
                        <ShieldCheck size={14} color={sub.status === 'active' ? '#10b981' : '#ef4444'} />
                        <Text style={[styles.badgeText, { color: sub.status === 'active' ? '#10b981' : '#ef4444' }]}>
                            {sub.status === 'active' ? 'MEMBERSHIP CURRENT' : 'MEMBERSHIP LAPSED'}
                        </Text>
                    </View>
                </Animated.View>

                {/* Plan Hero */}
                <Animated.View entering={FadeInDown.delay(100)} style={[styles.planHero, { backgroundColor: theme.primary }]}>
                    <View style={styles.planHeader}>
                        <Zap color="#fff" size={24} />
                        <Text style={styles.planTitle}>{sub.plan.toUpperCase()} TIER</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.currency}>₹</Text>
                        <Text style={styles.price}>{sub.plan === 'pro' ? '1,499' : sub.plan === 'premium' ? '3,999' : '0'}</Text>
                        <Text style={styles.period}>/mo</Text>
                    </View>
                    <Text style={styles.planDesc}>
                        {sub.plan === 'free' ? 'Unlock full velocity growth tools.' : 'Active strategic subscription with full operational access.'}
                    </Text>
                    <View style={styles.planFooter}>
                        <View>
                            <Text style={styles.footerLabel}>RENEWAL DATE</Text>
                            <Text style={styles.footerVal}>{new Date(sub.endDate).toLocaleDateString()}</Text>
                        </View>
                        <TouchableOpacity style={styles.manageBtn}>
                            <Text style={styles.manageBtnText}>MANAGE</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Quota Telemetry */}
                <Animated.View entering={FadeInDown.delay(200)} style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.foreground }]}>QUOTA TELEMETRY</Text>
                    
                    <View style={styles.quotaRow}>
                        <View style={styles.quotaInfo}>
                            <Text style={[styles.quotaLabel, { color: theme.mutedForeground }]}>OUTBOUND VELOCITY</Text>
                            <Text style={[styles.quotaVal, { color: theme.foreground }]}>{use.messagesSent}<Text style={styles.quotaMax}> / {sub.plan === 'free' ? 5 : '∞'}</Text></Text>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: theme.muted }]}>
                            <View style={[styles.progressFill, { backgroundColor: theme.primary, width: '60%' }]} />
                        </View>
                    </View>

                    <View style={styles.quotaRow}>
                        <View style={styles.quotaInfo}>
                            <Text style={[styles.quotaLabel, { color: theme.mutedForeground }]}>STRATEGIC UNLOCKS</Text>
                            <Text style={[styles.quotaVal, { color: theme.foreground }]}>{use.contactsUnlocked}<Text style={styles.quotaMax}> / {sub.plan === 'free' ? 0 : '∞'}</Text></Text>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: theme.muted }]}>
                            <View style={[styles.progressFill, { backgroundColor: '#10b981', width: '20%' }]} />
                        </View>
                    </View>
                </Animated.View>

                {/* Velocity Boost */}
                <Animated.View entering={FadeInDown.delay(300)} style={[styles.boostCard, { backgroundColor: theme.foreground }]}>
                    <View style={styles.boostInfo}>
                        <View style={styles.boostHeader}>
                            <Star color={theme.primary} size={20} />
                            <Text style={[styles.boostTitle, { color: theme.background }]}>VELOCITY BOOST</Text>
                        </View>
                        <Text style={[styles.boostDesc, { color: theme.background + '80' }]}>
                            Force your profile to the absolute top of discovery results for 168 hours.
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleBoost} style={[styles.executeBtn, { backgroundColor: theme.primary }]}>
                        <Text style={styles.executeText}>EXECUTE BOOST</Text>
                        <ArrowRight color="#fff" size={16} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Audit Trail */}
                <Animated.View entering={FadeInDown.delay(400)} style={styles.auditSection}>
                    <View style={styles.auditHeader}>
                        <History size={20} color={theme.mutedForeground} />
                        <Text style={[styles.auditTitle, { color: theme.foreground }]}>TRANSACTION AUDIT</Text>
                    </View>
                    
                    <View style={[styles.auditCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.auditRow}>
                            <View>
                                <Text style={[styles.auditRef, { color: theme.foreground }]}>#TX-984210</Text>
                                <Text style={[styles.auditDate, { color: theme.mutedForeground }]}>{new Date().toLocaleDateString()}</Text>
                            </View>
                            <View style={styles.auditRight}>
                                <Text style={[styles.auditAmount, { color: theme.foreground }]}>₹{sub.plan === 'pro' ? '1,499' : '3,999'}</Text>
                                <TouchableOpacity style={styles.downloadBtn}>
                                    <Download size={16} color={theme.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
    },
    backBtn: {
        padding: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    badgeRow: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 24,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 6,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    planHero: {
        borderRadius: 32,
        padding: 32,
        marginBottom: 24,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    planTitle: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Inter-Black',
        letterSpacing: -0.5,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 24,
    },
    currency: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        marginRight: 4,
    },
    price: {
        color: '#fff',
        fontSize: 48,
        fontFamily: 'Inter-Black',
        letterSpacing: -2,
    },
    period: {
        color: '#ffffff80',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        marginLeft: 4,
    },
    planDesc: {
        color: '#ffffffa0',
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        marginTop: 12,
        lineHeight: 20,
    },
    planFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#ffffff20',
    },
    footerLabel: {
        color: '#ffffff60',
        fontSize: 9,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    footerVal: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        marginTop: 2,
    },
    manageBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#ffffff20',
    },
    manageBtnText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    section: {
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
        marginBottom: 24,
    },
    quotaRow: {
        marginBottom: 20,
    },
    quotaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    quotaLabel: {
        fontSize: 9,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    quotaVal: {
        fontSize: 18,
        fontFamily: 'Inter-Black',
    },
    quotaMax: {
        fontSize: 12,
        color: '#94a3b8',
    },
    progressTrack: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
    },
    boostCard: {
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    boostInfo: {
        flex: 1,
        marginRight: 16,
    },
    boostHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    boostTitle: {
        fontSize: 14,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    boostDesc: {
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        lineHeight: 16,
    },
    executeBtn: {
        width: 100,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    executeText: {
        color: '#fff',
        fontSize: 9,
        fontFamily: 'Inter-Black',
        textAlign: 'center',
    },
    auditSection: {
        marginTop: 8,
    },
    auditHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
    },
    auditTitle: {
        fontSize: 11,
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
    },
    auditCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
    },
    auditRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    auditRef: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },
    auditDate: {
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        marginTop: 2,
    },
    auditRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    auditAmount: {
        fontSize: 18,
        fontFamily: 'Inter-Black',
    },
    downloadBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#6366f110',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default BillingScreen;
