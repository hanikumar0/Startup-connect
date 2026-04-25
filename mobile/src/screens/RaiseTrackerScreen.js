import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Plus, DollarSign, Calendar, Users, BrainCircuit, LineChart, Target, Zap, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

const RaiseTrackerScreen = () => {
    const { theme, isDark } = useTheme();
    const [round, setRound] = useState(null);
    const [pipeline, setPipeline] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/raise/me');
            if (res.data.success) {
                setRound(res.data.round);
                setPipeline(res.data.pipeline);
            }
        } catch (error) {
            console.error('Raise Tracker Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amt) => {
        return `₹${(amt / 10000000).toFixed(1)}Cr`;
    };

    const totalCommitted = (round?.softCommittedAmount || 0) + (round?.hardCommittedAmount || 0);
    const progress = round ? Math.min(100, (totalCommitted / round.targetAmount) * 100) : 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <View>
                    <Text style={[styles.headerLabel, { color: theme.mutedForeground }]}>FUNDRAISING HUB</Text>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]}>RAISE COMMAND</Text>
                </View>
                {!round && (
                    <TouchableOpacity style={[styles.setupBtn, { backgroundColor: theme.primary }]}>
                        <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={theme.primary} size="large" />
                </View>
            ) : (
                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                    {round ? (
                        <View style={styles.content}>
                            {/* Round Velocity Card */}
                            <Animated.View entering={FadeInDown} style={[styles.roundCard, { backgroundColor: theme.foreground }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.roundType, { color: theme.background + '80' }]}>
                                        {round.roundType.toUpperCase()} PROTOCOL
                                    </Text>
                                    <View style={[styles.fundedBadge, { backgroundColor: theme.primary }]}>
                                        <Text style={styles.fundedText}>{Math.round(progress)}% FUNDED</Text>
                                    </View>
                                </View>

                                <View style={styles.amountRow}>
                                    <View>
                                        <Text style={[styles.amountVal, { color: theme.background }]}>{formatCurrency(totalCommitted)}</Text>
                                        <Text style={[styles.amountLab, { color: theme.background + '60' }]}>TOTAL COMMITTED</Text>
                                    </View>
                                    <View style={styles.alignRight}>
                                        <Text style={[styles.targetVal, { color: theme.background + '60' }]}>{formatCurrency(round.targetAmount)}</Text>
                                        <Text style={[styles.targetLab, { color: theme.background + '40' }]}>GOAL</Text>
                                    </View>
                                </View>

                                <View style={[styles.progressBg, { backgroundColor: theme.background + '20' }]}>
                                    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
                                </View>

                                <View style={styles.commitmentRow}>
                                    <View style={styles.typeItem}>
                                        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                                        <Text style={[styles.typeText, { color: theme.background + '80' }]}>HARD: {formatCurrency(round.hardCommittedAmount)}</Text>
                                    </View>
                                    <View style={styles.typeItem}>
                                        <View style={[styles.dot, { backgroundColor: '#a855f7' }]} />
                                        <Text style={[styles.typeText, { color: theme.background + '80' }]}>SOFT: {formatCurrency(round.softCommittedAmount)}</Text>
                                    </View>
                                </View>
                            </Animated.View>

                            {/* Pipeline Metrics */}
                            <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>PIPELINE VELOCITY</Text>
                            <View style={styles.metricsGrid}>
                                {[
                                    { label: 'LEADS', val: pipeline?.totalContacted || 0, icon: Users, color: theme.primary },
                                    { label: 'MEETS', val: pipeline?.meetings || 0, icon: Calendar, color: '#f59e0b' },
                                    { label: 'DILIGENCE', val: pipeline?.dueDiligence || 0, icon: Target, color: '#8b5cf6' },
                                    { label: 'DEALS', val: round.commitments.length, icon: TrendingUp, color: '#10b981' },
                                ].map((stat, i) => (
                                    <Animated.View key={i} entering={FadeInDown.delay(100 + i * 100)} style={[styles.metricBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                        <stat.icon size={16} color={stat.color} />
                                        <Text style={[styles.metricVal, { color: theme.foreground }]}>{stat.val}</Text>
                                        <Text style={[styles.metricLab, { color: theme.mutedForeground }]}>{stat.label}</Text>
                                    </Animated.View>
                                ))}
                            </View>

                            {/* AI Forecasting */}
                            <Animated.View entering={FadeInDown.delay(500)} style={[styles.aiCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '20' }]}>
                                <View style={styles.aiHeader}>
                                    <BrainCircuit size={18} color={theme.primary} />
                                    <Text style={[styles.aiTitle, { color: theme.primary }]}>AI MOMENTUM FORECAST</Text>
                                </View>
                                <Text style={[styles.aiText, { color: isDark ? '#a5b4fc' : '#4338ca' }]}>
                                    {progress >= 50
                                        ? "ROUND VELOCITY IS EXCEPTIONAL. FOCUS ON CLOSING DUE DILIGENCE LEADS TO REACH 100% WITHIN 14 DAYS."
                                        : "MOMENTUM IS INCREASING. SECURE ONE MORE HARD COMMITMENT TO ANCHOR THE REST OF THE ROUND."}
                                </Text>
                            </Animated.View>

                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Text style={[styles.actionBtnText, { color: theme.foreground }]}>MANAGE COMMITMENTS</Text>
                                <ChevronRight size={16} color={theme.mutedForeground} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                             <View style={[styles.emptyIconBox, { backgroundColor: theme.muted }]}>
                                <TrendingUp size={40} color={theme.mutedForeground} strokeWidth={1.5} />
                             </View>
                             <Text style={[styles.emptyTitle, { color: theme.foreground }]}>NO ACTIVE ROUND</Text>
                             <Text style={[styles.emptyDesc, { color: theme.mutedForeground }]}>Initialize your fundraising protocol to track commitments and AI insights.</Text>
                             <TouchableOpacity style={[styles.initBtn, { backgroundColor: theme.foreground }]}>
                                <Text style={[styles.initBtnText, { color: theme.background }]}>START FUNDRAISE</Text>
                             </TouchableOpacity>
                        </Animated.View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1 },
    headerLabel: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2 },
    headerTitle: { fontSize: 22, fontFamily: 'Inter-Black', letterSpacing: -0.5, marginTop: 4 },
    setupBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    scroll: { flex: 1 },
    content: { padding: 24 },
    roundCard: { borderRadius: 32, padding: 24, marginBottom: 32 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    roundType: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2 },
    fundedBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    fundedText: { color: '#fff', fontSize: 10, fontFamily: 'Inter-Black' },
    amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
    amountVal: { fontSize: 32, fontFamily: 'Inter-Black', letterSpacing: -1 },
    amountLab: { fontSize: 9, fontFamily: 'Inter-Black', letterSpacing: 1, marginTop: 4 },
    alignRight: { alignItems: 'flex-end' },
    targetVal: { fontSize: 16, fontFamily: 'Inter-Black' },
    targetLab: { fontSize: 8, fontFamily: 'Inter-Black', letterSpacing: 1, marginTop: 4 },
    progressBg: { height: 10, borderRadius: 5, marginBottom: 20, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 5 },
    commitmentRow: { flexDirection: 'row', gap: 16 },
    typeItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    typeText: { fontSize: 10, fontFamily: 'Inter-Bold' },
    sectionTitle: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2, marginBottom: 16 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
    metricBox: { width: (width - 60) / 2, borderRadius: 24, padding: 20, borderWidth: 1 },
    metricVal: { fontSize: 22, fontFamily: 'Inter-Black', marginTop: 12 },
    metricLab: { fontSize: 9, fontFamily: 'Inter-Black', letterSpacing: 1, marginTop: 4 },
    aiCard: { borderRadius: 24, padding: 20, borderWidth: 1, marginBottom: 24 },
    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    aiTitle: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 1.5 },
    aiText: { fontSize: 12, fontFamily: 'Inter-Black', lineHeight: 18 },
    actionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 40 },
    actionBtnText: { fontSize: 12, fontFamily: 'Inter-Black', letterSpacing: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { paddingVertical: 100, alignItems: 'center', paddingHorizontal: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 14, fontFamily: 'Inter-Black', letterSpacing: 1 },
    emptyDesc: { fontSize: 12, fontFamily: 'Inter-Medium', textAlign: 'center', marginTop: 8, lineHeight: 18, marginBottom: 32 },
    initBtn: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 20 },
    initBtnText: { fontSize: 12, fontFamily: 'Inter-Black', letterSpacing: 1 }
});

export default RaiseTrackerScreen;
