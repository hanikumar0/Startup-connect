import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Animated,
    PanResponder,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    Heart,
    X,
    Info,
    MessageCircle,
    Zap,
    ShieldCheck,
    Briefcase,
    Filter as FilterIcon,
    ChevronDown,
    Search,
    DollarSign,
    Target
} from 'lucide-react-native';
import { API_URL } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const INDUSTRIES = ["SaaS", "Fintech", "AI/ML", "Healthtech", "Cleantech", "Crypto", "E-commerce"];
const STAGES = ["Idea", "MVP", "Seed", "Series A", "Series B", "Growth"];
const REVENUE_RANGES = ["$0 - $10k", "$10k - $50k", "$50k - $250k", "$250k+"];

const SkeletonCard = () => {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={[styles.card, { padding: 24, elevation: 0, shadowOpacity: 0, backgroundColor: '#fff' }]}>
            <Animated.View style={{ opacity }}>
                <View style={{ height: 180, backgroundColor: '#f1f5f9', borderRadius: 20, marginBottom: 24 }} />
                <View style={{ height: 28, backgroundColor: '#f1f5f9', borderRadius: 8, width: '60%', marginBottom: 12 }} />
                <View style={{ height: 18, backgroundColor: '#f1f5f9', borderRadius: 6, width: '40%', marginBottom: 24 }} />
                <View style={{ height: 80, backgroundColor: '#f1f5f9', borderRadius: 12, marginBottom: 24 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f1f5f9' }} />
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f1f5f9' }} />
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#f1f5f9' }} />
                </View>
            </Animated.View>
        </View>
    );
};

const DiscoverScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    // Filters State
    const [filters, setFilters] = useState({
        sectors: [],
        stages: [],
        revenues: [],
        valuation: '',
    });

    const position = useRef(new Animated.ValueXY()).current;

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const endpoint = user.role === 'INVESTOR' ? '/ai/investor' : '/ai/startup';
            // We pass filters as query params in a real app
            const response = await axios.get(`${API_URL}${endpoint}`);
            if (response.data.success) {
                setMatches(response.data.matches || []);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            position.setValue({ x: gestureState.dx, y: gestureState.dy });
        },
        onPanResponderRelease: (evt, gestureState) => {
            if (gestureState.dx > 120) {
                forceSwipe('right');
            } else if (gestureState.dx < -120) {
                forceSwipe('left');
            } else {
                resetPosition();
            }
        }
    });

    const forceSwipe = (direction) => {
        const x = direction === 'right' ? width + 100 : -width - 100;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false
        }).start(() => onSwipeComplete(direction));
    };

    const onSwipeComplete = async (direction) => {
        const item = matches[currentIndex];
        const target = item.investor || item.startup;

        if (direction === 'right') {
            try {
                await axios.post(`${API_URL}/users/connect`, {
                    recipientId: target.id,
                    message: `Matched via Discovery with ${item.score}% score!`
                });
            } catch (error) {
                console.error('Connection error:', error.message);
            }
        }

        position.setValue({ x: 0, y: 0 });
        setCurrentIndex(currentIndex + 1);
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
        }).start();
    };

    const getCardStyle = () => {
        const rotate = position.x.interpolate({
            inputRange: [-width / 2, 0, width / 2],
            outputRange: ['-10deg', '0deg', '10deg']
        });

        return {
            ...position.getLayout(),
            transform: [{ rotate }]
        };
    };

    const toggleFilter = (key, val) => {
        setFilters(prev => {
            const list = prev[key];
            const newList = list.includes(val) ? list.filter(v => v !== val) : [...list, val];
            return { ...prev, [key]: newList };
        });
    };

    const renderCardContent = (item, isBackground = false) => {
        const target = item.investor || item.startup;
        return (
            <View style={{ flex: 1 }}>
                <View style={[styles.cardVisual, { backgroundColor: theme.muted }]}>
                    <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
                        <Briefcase size={60} color="#fff" />
                    </View>
                    <View style={[styles.scoreBadge, { backgroundColor: theme.foreground }]}>
                        <Zap size={14} color={theme.primary} fill={theme.primary} />
                        <Text style={[styles.scoreText, { color: theme.background }]}>{item.score}% AI Match</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.auditButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() => navigation.navigate('AuditDetail', {
                            entityName: target.name || target.firm,
                            entityType: user.role === 'INVESTOR' ? 'STARTUP' : 'INVESTOR',
                            founderName: target.founder || ''
                        })}
                    >
                        <ShieldCheck size={16} color={theme.primary} />
                        <Text style={[styles.auditButtonText, { color: theme.primary }]}>Run Deep History Audit</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.cardInfo}>
                    <Text style={[styles.entityName, { color: theme.foreground }]}>{target.name || target.firm}</Text>
                    <Text style={[styles.entityType, { color: theme.mutedForeground }]}>{target.industry || target.type}</Text>

                    <View style={[styles.reasoningContainer, { backgroundColor: theme.muted }]}>
                        <Info size={16} color={theme.primary} style={{ marginBottom: 8 }} />
                        <Text style={[styles.reasoningText, { color: theme.foreground }]}>{item.reasoning}</Text>
                    </View>
                </View>

                {!isBackground && (
                    <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
                        <TouchableOpacity style={[styles.roundBtn, { borderColor: '#ef4444' }]} onPress={() => forceSwipe('left')}>
                            <X size={28} color="#ef4444" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.roundBtn, { borderColor: theme.primary }]} onPress={() => navigation.navigate('Chat', { partnerId: target.id, partnerName: target.name || target.firm })}>
                            <MessageCircle size={28} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.roundBtn, { backgroundColor: '#10b981', borderColor: '#10b981' }]} onPress={() => forceSwipe('right')}>
                            <Heart size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const renderCards = () => {
        if (loading) return <View style={styles.skeletonContainer}><SkeletonCard /></View>;

        if (currentIndex >= matches.length) {
            return (
                <View style={[styles.card, styles.emptyCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: theme.primary + '10' }]}>
                        <Zap size={48} color={theme.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: theme.foreground }]}>End of the Line</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.mutedForeground }]}>You've seen all matches for now.</Text>
                    <TouchableOpacity style={[styles.refreshButton, { backgroundColor: theme.primary }]} onPress={fetchMatches}>
                        <Text style={styles.refreshButtonText}>Refresh Discover Feed</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return matches.map((item, i) => {
            if (i < currentIndex) return null;
            const target = item.investor || item.startup;
            if (i === currentIndex) {
                return (
                    <Animated.View key={target.id} style={[getCardStyle(), styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} {...panResponder.panHandlers}>
                        {renderCardContent(item)}
                    </Animated.View>
                );
            }
            return (
                <View key={target.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: (i - currentIndex) * 10, zIndex: matches.length - i }]}>
                    {renderCardContent(item, true)}
                </View>
            );
        }).reverse();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <View>
                    <Text style={[styles.title, { color: theme.foreground }]}>AI DISCOVERY</Text>
                    <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>Swipe to connect with top {user.role === 'INVESTOR' ? 'Startups' : 'Investors'}</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => setIsFilterVisible(true)}
                    style={[styles.filterToggle, { backgroundColor: theme.muted }]}
                >
                    <FilterIcon size={20} color={theme.foreground} />
                    { (filters.sectors.length > 0 || filters.stages.length > 0) && <View style={[styles.filterDot, { backgroundColor: theme.primary }]} /> }
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                {renderCards()}
            </View>

            {/* Granular Filter Modal */}
            <Modal
                visible={isFilterVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsFilterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.foreground }]}>STRATEGIC FILTERS</Text>
                            <TouchableOpacity onPress={() => setIsFilterVisible(false)} style={styles.closeBtn}>
                                <X size={24} color={theme.foreground} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                            {/* Sectors */}
                            <Text style={[styles.filterLabel, { color: theme.mutedForeground }]}>SECTORS</Text>
                            <View style={styles.chipGrid}>
                                {INDUSTRIES.map(s => (
                                    <TouchableOpacity 
                                        key={s} 
                                        onPress={() => toggleFilter('sectors', s)}
                                        style={[styles.chip, { borderColor: theme.border }, filters.sectors.includes(s) && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                    >
                                        <Text style={[styles.chipText, { color: theme.mutedForeground }, filters.sectors.includes(s) && { color: '#fff' }]}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Stages */}
                            <Text style={[styles.filterLabel, { color: theme.mutedForeground, marginTop: 32 }]}>STAGES</Text>
                            <View style={styles.chipGrid}>
                                {STAGES.map(s => (
                                    <TouchableOpacity 
                                        key={s} 
                                        onPress={() => toggleFilter('stages', s)}
                                        style={[styles.chip, { borderColor: theme.border }, filters.stages.includes(s) && { backgroundColor: theme.foreground, borderColor: theme.foreground }]}
                                    >
                                        <Text style={[styles.chipText, { color: theme.mutedForeground }, filters.stages.includes(s) && { color: theme.background }]}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Revenue */}
                            <Text style={[styles.filterLabel, { color: theme.mutedForeground, marginTop: 32 }]}>ANNUAL REVENUE</Text>
                            <View style={styles.chipGrid}>
                                {REVENUE_RANGES.map(r => (
                                    <TouchableOpacity 
                                        key={r} 
                                        onPress={() => toggleFilter('revenues', r)}
                                        style={[styles.chip, { borderColor: theme.border }, filters.revenues.includes(r) && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                    >
                                        <Text style={[styles.chipText, { color: theme.mutedForeground }, filters.revenues.includes(r) && { color: '#fff' }]}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Valuation */}
                            <Text style={[styles.filterLabel, { color: theme.mutedForeground, marginTop: 32 }]}>MIN VALUATION (USD)</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
                                <DollarSign size={18} color={theme.primary} />
                                <TextInput 
                                    style={[styles.input, { color: theme.foreground }]} 
                                    placeholder="Ex: 5000000"
                                    placeholderTextColor={theme.mutedForeground}
                                    keyboardType="numeric"
                                    value={filters.valuation}
                                    onChangeText={(v) => setFilters({...filters, valuation: v})}
                                />
                            </View>

                            <TouchableOpacity 
                                style={[styles.applyBtn, { backgroundColor: theme.primary }]}
                                onPress={() => {
                                    setIsFilterVisible(false);
                                    fetchMatches();
                                }}
                            >
                                <Text style={styles.applyBtnText}>APPLY STRATEGIC FILTERS</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 24, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '900', fontFamily: 'Inter-Black' },
    subtitle: { fontSize: 11, fontFamily: 'Inter-Medium', marginTop: 4 },
    filterToggle: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    filterDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: '#fff' },
    cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
    card: { position: 'absolute', width: width - 32, height: height * 0.7, borderRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, borderWidth: 1, overflow: 'hidden' },
    cardVisual: { height: '40%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    logoContainer: { width: 100, height: 100, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
    scoreBadge: { position: 'absolute', bottom: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    scoreText: { fontWeight: '800', fontSize: 12, marginLeft: 4, fontFamily: 'Inter-Black' },
    cardInfo: { padding: 24, flex: 1 },
    entityName: { fontSize: 24, fontWeight: '900', fontFamily: 'Inter-Black' },
    entityType: { fontSize: 11, fontFamily: 'Inter-Black', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
    reasoningContainer: { marginTop: 16, padding: 16, borderRadius: 20 },
    reasoningText: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter-Medium' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 20, borderTopWidth: 1 },
    roundBtn: { width: 64, height: 64, borderRadius: 32, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    emptyCard: { justifyContent: 'center', alignItems: 'center', padding: 40, borderStyle: 'dashed' },
    emptyIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 20, fontFamily: 'Inter-Black', marginBottom: 8 },
    emptySubtitle: { fontSize: 13, fontFamily: 'Inter-Medium', textAlign: 'center', marginBottom: 32 },
    refreshButton: { height: 56, paddingHorizontal: 32, borderRadius: 18, justifyContent: 'center' },
    refreshButtonText: { color: '#fff', fontSize: 14, fontFamily: 'Inter-Black' },
    auditButton: { position: 'absolute', bottom: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 8, borderWidth: 1 },
    auditButtonText: { fontSize: 11, fontFamily: 'Inter-Black' },
    skeletonContainer: { flex: 1, width: width, padding: 20 },
    
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { height: height * 0.85, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    modalTitle: { fontSize: 18, fontFamily: 'Inter-Black', letterSpacing: 2 },
    closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f920', justifyContent: 'center', alignItems: 'center' },
    filterLabel: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2, marginBottom: 16 },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
    chipText: { fontSize: 12, fontFamily: 'Inter-Bold' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 60, borderRadius: 18, borderWidth: 1, paddingHorizontal: 16 },
    input: { flex: 1, marginLeft: 12, fontSize: 16, fontFamily: 'Inter-Bold' },
    applyBtn: { height: 64, borderRadius: 20, marginTop: 40, justifyContent: 'center', alignItems: 'center' },
    applyBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter-Black', letterSpacing: 1 }
});

export default DiscoverScreen;
