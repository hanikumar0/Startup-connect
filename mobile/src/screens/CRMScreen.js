import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target, Search, Filter, MessageSquare, ArrowRight, TrendingUp, Zap, Users, Briefcase } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const { width } = Dimensions.get('window');

const STAGES = {
    startup: [
        { id: 'target', label: 'TARGET' },
        { id: 'contacted', label: 'CONTACT' },
        { id: 'meeting', label: 'MEET' },
        { id: 'interested', label: 'INTEREST' },
        { id: 'dd', label: 'DD' },
        { id: 'committed', label: 'CLOSED' }
    ],
    investor: [
        { id: 'new', label: 'NEW' },
        { id: 'interested', label: 'INTEREST' },
        { id: 'meeting', label: 'MEETING' },
        { id: 'dd', label: 'DD' },
        { id: 'invested', label: 'INVESTED' }
    ]
};

const CRMScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStage, setActiveStage] = useState('new');
    const userRole = user?.role?.toLowerCase() || 'investor';

    useEffect(() => {
        fetchLeads();
    }, [activeStage]);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const res = await api.get('/crm/pipeline');
            if (res.data.success) {
                setLeads(res.data.leads.filter(l => l.stage === activeStage));
            }
        } catch (error) {
            console.error('CRM Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderLead = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 100)}>
            <TouchableOpacity 
                style={[styles.leadCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => navigation.navigate('Chat', { partnerId: item.entityId?._id, partnerName: item.entityId?.name })}
            >
                <View style={styles.leadHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: theme.muted }]}>
                        <Text style={[styles.avatarText, { color: theme.primary }]}>
                            {(item.entityId?.name || item.entityId?.firm || 'U').charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.leadInfo}>
                        <Text style={[styles.leadName, { color: theme.foreground }]}>{item.entityId?.name || item.entityId?.firm || 'Anonymous'}</Text>
                        <Text style={[styles.leadMeta, { color: theme.mutedForeground }]}>
                            {item.entityId?.industry || 'TECH'} • {item.entityId?.stage || 'SEED'}
                        </Text>
                    </View>
                    <View style={[styles.matchBadge, { backgroundColor: theme.primary + '15' }]}>
                        <Zap size={10} color={theme.primary} fill={theme.primary} />
                        <Text style={[styles.matchText, { color: theme.primary }]}>94%</Text>
                    </View>
                </View>
                
                <View style={[styles.leadFooter, { borderTopColor: theme.border }]}>
                    <View style={styles.lastAction}>
                        <Briefcase size={12} color={theme.mutedForeground} />
                        <Text style={[styles.lastActionText, { color: theme.mutedForeground }]}>LAST SYNC: 2D AGO</Text>
                    </View>
                    <TouchableOpacity style={[styles.msgBtn, { backgroundColor: theme.primary }]}>
                        <MessageSquare size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    const stages = STAGES[userRole] || STAGES.investor;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <View style={styles.topRow}>
                    <View>
                        <Text style={[styles.headerLabel, { color: theme.mutedForeground }]}>DEAL FLOW</Text>
                        <Text style={[styles.headerTitle, { color: theme.foreground }]}>PIPELINE INTEL</Text>
                    </View>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.muted }]}>
                        <Search size={20} color={theme.foreground} />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.stageScroll}
                >
                    {stages.map((stage) => (
                        <TouchableOpacity
                            key={stage.id}
                            style={[
                                styles.stageTab,
                                { backgroundColor: theme.muted, borderColor: 'transparent' },
                                activeStage === stage.id && { backgroundColor: theme.primary }
                            ]}
                            onPress={() => setActiveStage(stage.id)}
                        >
                            <Text style={[
                                styles.stageLabel,
                                { color: theme.mutedForeground },
                                activeStage === stage.id && { color: '#fff' }
                            ]}>
                                {stage.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={theme.primary} size="large" />
                </View>
            ) : (
                <FlatList
                    data={leads}
                    renderItem={renderLead}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                             <View style={[styles.emptyIconBox, { backgroundColor: theme.muted }]}>
                                <Target size={40} color={theme.mutedForeground} strokeWidth={1.5} />
                             </View>
                             <Text style={[styles.emptyTitle, { color: theme.foreground }]}>STAGE VACANT</Text>
                             <Text style={[styles.emptyDesc, { color: theme.mutedForeground }]}>Move leads to this protocol to track their progress.</Text>
                        </Animated.View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingVertical: 20, borderBottomWidth: 1 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
    headerLabel: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2 },
    headerTitle: { fontSize: 22, fontFamily: 'Inter-Black', letterSpacing: -0.5, marginTop: 4 },
    actionBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    stageScroll: { paddingHorizontal: 24, paddingBottom: 4 },
    stageTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, marginRight: 10, borderWidth: 1 },
    stageLabel: { fontSize: 9, fontFamily: 'Inter-Black', letterSpacing: 1 },
    listContent: { padding: 24, paddingBottom: 100 },
    leadCard: { borderRadius: 28, borderWidth: 1, padding: 20, marginBottom: 16 },
    leadHeader: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: { width: 52, height: 52, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    avatarText: { fontSize: 20, fontFamily: 'Inter-Black' },
    leadInfo: { flex: 1 },
    leadName: { fontSize: 16, fontFamily: 'Inter-Black', letterSpacing: -0.2 },
    leadMeta: { fontSize: 10, fontFamily: 'Inter-Black', marginTop: 4 },
    matchBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    matchText: { fontSize: 10, fontFamily: 'Inter-Black' },
    leadFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1 },
    lastAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    lastActionText: { fontSize: 9, fontFamily: 'Inter-Black', letterSpacing: 0.5 },
    msgBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { paddingVertical: 100, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyIconBox: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 14, fontFamily: 'Inter-Black', letterSpacing: 1 },
    emptyDesc: { fontSize: 12, fontFamily: 'Inter-Medium', textAlign: 'center', marginTop: 8, lineHeight: 18 }
});

export default CRMScreen;
