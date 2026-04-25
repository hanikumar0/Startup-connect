import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, G, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { 
    useSharedValue, 
    useAnimatedProps, 
    withSpring, 
    withDelay,
    FadeIn,
    SlideInRight
} from 'react-native-reanimated';
import { 
    Network, 
    Users, 
    Search, 
    Share2, 
    LayoutGrid, 
    ChevronLeft,
    Zap,
    MessageCircle,
    UserPlus,
    Filter
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../utils/constants';

const { width, height } = Dimensions.get('window');
const GRAPH_SIZE = width - 48;
const CENTER = GRAPH_SIZE / 2;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedG = Animated.createAnimatedComponent(G);

const NetworkScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'graph'
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        setLoading(false); // Simulated for now with mockup data
        setConnections([
            { id: '1', name: 'Alex Rivers', role: 'VC', score: 98, color: '#6366f1' },
            { id: '2', name: 'Sarah Chen', role: 'Founder', score: 85, color: '#10b981' },
            { id: '3', name: 'Mike Ross', role: 'Mentor', score: 92, color: '#f59e0b' },
            { id: '4', name: 'Elena G.', role: 'Angel', score: 78, color: '#ec4899' },
            { id: '5', name: 'David W.', role: 'Partner', score: 88, color: '#8b5cf6' },
            { id: '6', name: 'Jessica L.', role: 'LP', score: 95, color: '#3b82f6' },
        ]);
    };

    const renderListView = () => (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.statsRow}>
                {[
                    { label: 'NODES', val: connections.length + 1 },
                    { label: 'EDGES', val: connections.length * 2 },
                    { label: 'STRENGTH', val: '94%' },
                ].map((s, i) => (
                    <View key={i} style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.statLab, { color: theme.mutedForeground }]}>{s.label}</Text>
                        <Text style={[styles.statVal, { color: theme.foreground }]}>{s.val}</Text>
                    </View>
                ))}
            </View>

            {connections.map((item, idx) => (
                <Animated.View 
                    key={item.id} 
                    entering={FadeIn.delay(idx * 100)}
                    style={[styles.connectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                    <View style={[styles.avatar, { backgroundColor: item.color + '20' }]}>
                        <Text style={[styles.avatarText, { color: item.color }]}>{item.name[0]}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={[styles.cardName, { color: theme.foreground }]}>{item.name}</Text>
                        <Text style={[styles.cardRole, { color: theme.mutedForeground }]}>{item.role} • {item.score}% Compatibility</Text>
                    </View>
                    <TouchableOpacity style={[styles.msgBtn, { backgroundColor: theme.primary + '10' }]}>
                        <MessageCircle size={18} color={theme.primary} />
                    </TouchableOpacity>
                </Animated.View>
            ))}
        </ScrollView>
    );

    const renderGraphView = () => {
        return (
            <View style={styles.graphContainer}>
                <Svg width={GRAPH_SIZE} height={GRAPH_SIZE}>
                    <Defs>
                        <RadialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.2" />
                            <Stop offset="100%" stopColor={theme.primary} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    
                    {/* Background Glow */}
                    <Circle cx={CENTER} cy={CENTER} r={CENTER} fill="url(#grad)" />

                    {/* Connection Lines */}
                    {connections.map((c, i) => {
                        const angle = (i / connections.length) * 2 * Math.PI;
                        const radius = 120;
                        const x = CENTER + radius * Math.cos(angle);
                        const y = CENTER + radius * Math.sin(angle);
                        
                        return (
                            <Line 
                                key={`line-${c.id}`}
                                x1={CENTER} y1={CENTER} 
                                x2={x} y2={y} 
                                stroke={theme.border} 
                                strokeWidth="1"
                                strokeDasharray="4,4"
                            />
                        );
                    })}

                    {/* Outer Nodes */}
                    {connections.map((c, i) => {
                        const angle = (i / connections.length) * 2 * Math.PI;
                        const radius = 120;
                        const x = CENTER + radius * Math.cos(angle);
                        const y = CENTER + radius * Math.sin(angle);

                        return (
                            <G key={`node-${c.id}`}>
                                <Circle 
                                    cx={x} cy={y} r="24" 
                                    fill={isDark ? '#1e293b' : '#fff'} 
                                    stroke={c.color} 
                                    strokeWidth="2" 
                                />
                                <SvgText 
                                    x={x} y={y + 4} 
                                    fontSize="12" 
                                    fontWeight="bold" 
                                    textAnchor="middle" 
                                    fill={theme.foreground}
                                >
                                    {c.name[0]}
                                </SvgText>
                                <SvgText 
                                    x={x} y={y + 40} 
                                    fontSize="10" 
                                    fontWeight="bold" 
                                    textAnchor="middle" 
                                    fill={theme.mutedForeground}
                                >
                                    {c.name.split(' ')[0]}
                                </SvgText>
                            </G>
                        );
                    })}

                    {/* Central Node (User) */}
                    <G>
                        <Circle 
                            cx={CENTER} cy={CENTER} r="32" 
                            fill={theme.primary} 
                            stroke={theme.background} 
                            strokeWidth="4" 
                        />
                        <SvgText 
                            x={CENTER} y={CENTER + 6} 
                            fontSize="16" 
                            fontWeight="900" 
                            textAnchor="middle" 
                            fill="#fff"
                        >
                            YOU
                        </SvgText>
                    </G>
                </Svg>

                <View style={[styles.graphLegend, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.legendText, { color: theme.mutedForeground }]}>
                        Tap a node to view strategic metadata.
                    </Text>
                    <View style={styles.legendDots}>
                        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: '#6366f1' }]} /><Text style={[styles.dotLab, { color: theme.foreground }]}>VC</Text></View>
                        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: '#10b981' }]} /><Text style={[styles.dotLab, { color: theme.foreground }]}>Founder</Text></View>
                        <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: '#f59e0b' }]} /><Text style={[styles.dotLab, { color: theme.foreground }]}>Mentor</Text></View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]}>NETWORK GRAPH</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]}>Visualize your ecosystem density.</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.muted }]}>
                        <Search size={20} color={theme.foreground} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.viewToggle, { backgroundColor: theme.muted }]}>
                <TouchableOpacity 
                    onPress={() => setViewMode('list')}
                    style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: theme.background, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }]}
                >
                    <LayoutGrid size={16} color={viewMode === 'list' ? theme.primary : theme.mutedForeground} />
                    <Text style={[styles.toggleText, { color: viewMode === 'list' ? theme.foreground : theme.mutedForeground }]}>LIST</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setViewMode('graph')}
                    style={[styles.toggleBtn, viewMode === 'graph' && { backgroundColor: theme.background, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }]}
                >
                    <Network size={16} color={viewMode === 'graph' ? theme.primary : theme.mutedForeground} />
                    <Text style={[styles.toggleText, { color: viewMode === 'graph' ? theme.foreground : theme.mutedForeground }]}>GRAPH</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator color={theme.primary} size="large" />
                </View>
            ) : (
                viewMode === 'list' ? renderListView() : renderGraphView()
            )}

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.fab, { backgroundColor: theme.foreground }]}>
                    <UserPlus color={theme.background} size={24} />
                    <Text style={[styles.fabText, { color: theme.background }]}>ADD CONNECTION</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 14,
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        marginTop: 4,
    },
    actionBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewToggle: {
        flexDirection: 'row',
        marginHorizontal: 24,
        padding: 4,
        borderRadius: 16,
        marginBottom: 24,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    toggleText: {
        fontSize: 10,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    scroll: {
        flex: 1,
        paddingHorizontal: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    statLab: {
        fontSize: 9,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    statVal: {
        fontSize: 18,
        fontFamily: 'Inter-Black',
        marginTop: 4,
    },
    connectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontFamily: 'Inter-Black',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
    },
    cardName: {
        fontSize: 15,
        fontFamily: 'Inter-Bold',
    },
    cardRole: {
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        marginTop: 2,
    },
    msgBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    graphContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    graphLegend: {
        marginTop: 40,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        width: width - 48,
    },
    legendText: {
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        textAlign: 'center',
        marginBottom: 16,
    },
    legendDots: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotLab: {
        fontSize: 10,
        fontFamily: 'Inter-Bold',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
    },
    fab: {
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    fabText: {
        fontSize: 12,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    }
});

export default NetworkScreen;
