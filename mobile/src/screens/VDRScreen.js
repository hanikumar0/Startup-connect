import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    Lock, 
    FileText, 
    ChevronRight, 
    Eye, 
    ShieldAlert, 
    FolderOpen, 
    Users, 
    Clock,
    Plus,
    Upload,
    ShieldCheck,
    BarChart3
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const VDRScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVDRData();
    }, []);

    const loadVDRData = async () => {
        try {
            const res = await api.get('/vdr/my');
            if (res.data.success) {
                setRooms(res.data.rooms || []);
            }
        } catch (error) {
            console.error('VDR Load Error', error);
        } finally {
            setLoading(false);
        }
    };

    const renderRoom = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 100)}>
            <TouchableOpacity 
                style={[styles.roomCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => navigation.navigate('VDRRoom', { roomId: item._id, title: item.startupName || 'VDR Room' })}
            >
                <View style={[styles.roomIcon, { backgroundColor: theme.primary + '10' }]}>
                    <FolderOpen color={theme.primary} size={24} />
                </View>
                <View style={styles.roomInfo}>
                    <Text style={[styles.roomTitle, { color: theme.foreground }]}>{item.startupName || 'SECURE DATA ROOM'}</Text>
                    <Text style={[styles.roomSubtitle, { color: theme.mutedForeground }]}>
                        {item.fileCount || 0} DOCUMENTS • {item.investorName || 'STRATEGIC PARTNERS'}
                    </Text>
                </View>
                <ChevronRight color={theme.mutedForeground} size={20} />
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <View>
                    <Text style={[styles.headerLabel, { color: theme.mutedForeground }]}>INSTITUTIONAL VAULT</Text>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]}>SECURE DATA ROOM</Text>
                </View>
                <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: theme.foreground }]}>
                    <Upload size={20} color={theme.background} />
                </TouchableOpacity>
            </View>

            <View style={[styles.statsRow, { borderBottomColor: theme.border }]}>
                {[
                    { icon: Eye, val: '12', lab: 'VIEWS', color: theme.primary },
                    { icon: Lock, val: 'SECURE', lab: 'AES-256', color: '#10b981' },
                    { icon: BarChart3, val: '3', lab: 'ACTIVE VCs', color: '#8b5cf6' },
                ].map((s, i) => (
                    <View key={i} style={styles.statBox}>
                        <s.icon color={s.color} size={16} />
                        <Text style={[styles.statValue, { color: theme.foreground }]}>{s.val}</Text>
                        <Text style={[styles.statLabel, { color: theme.mutedForeground }]}>{s.lab}</Text>
                    </View>
                ))}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>ACTIVE REPOSITORIES</Text>
                
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
                ) : rooms.length > 0 ? (
                    <FlatList 
                        data={rooms}
                        renderItem={renderRoom}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                    />
                ) : (
                    <Animated.View entering={FadeIn} style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={[styles.lockIconBox, { backgroundColor: theme.muted }]}>
                            <Lock color={theme.mutedForeground} size={40} strokeWidth={1.5} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.foreground }]}>ENCRYPTED INFRASTRUCTURE</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.mutedForeground }]}>
                            Your VDR is the central hub for investor due diligence. All assets are shard-encrypted.
                        </Text>
                        
                        <TouchableOpacity style={[styles.setupBtn, { backgroundColor: theme.foreground }]}>
                            <Text style={[styles.setupBtnText, { color: theme.background }]}>INITIALIZE VAULT</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                <View style={styles.recentActivity}>
                    <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>AUDIT TRAIL</Text>
                    {[
                        { title: 'Peak XV viewed Financial Model', time: '2 HOURS AGO', color: theme.primary },
                        { title: 'Access granted to Accel Partners', time: 'YESTERDAY', color: '#10b981' },
                        { title: 'Series A Deck V4.2 Uploaded', time: '2 DAYS AGO', color: '#f59e0b' },
                    ].map((act, i) => (
                        <Animated.View entering={FadeInDown.delay(500 + i * 100)} key={i} style={styles.activityItem}>
                            <View style={[styles.activityDot, { backgroundColor: act.color }]} />
                            <View style={styles.activityText}>
                                <Text style={[styles.activityTitle, { color: theme.foreground }]}>{act.title}</Text>
                                <Text style={[styles.activityTime, { color: theme.mutedForeground }]}>{act.time}</Text>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <View style={styles.securityBadge}>
                    <ShieldCheck size={14} color="#10b981" />
                    <Text style={styles.securityText}>BANK-GRADE ENCRYPTION ACTIVE</Text>
                </View>
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
    headerLabel: {
        fontSize: 10,
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'Inter-Black',
        letterSpacing: -0.5,
        marginTop: 4,
    },
    uploadBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        justifyContent: 'space-between',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 14,
        fontFamily: 'Inter-Black',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 9,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
        marginTop: 2,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    sectionTitle: {
        fontSize: 10,
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
        marginBottom: 16,
    },
    roomCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
        borderWidth: 1,
    },
    roomIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    roomInfo: {
        flex: 1,
    },
    roomTitle: {
        fontSize: 14,
        fontFamily: 'Inter-Black',
        letterSpacing: 0.5,
    },
    roomSubtitle: {
        fontSize: 9,
        fontFamily: 'Inter-Bold',
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 32,
        borderRadius: 32,
        marginBottom: 32,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    lockIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontFamily: 'Inter-Black',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 24,
    },
    setupBtn: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 18,
    },
    setupBtnText: {
        fontSize: 11,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    recentActivity: {
        marginTop: 24,
        marginBottom: 40,
    },
    activityItem: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    activityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    activityText: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 13,
        fontFamily: 'Inter-Bold',
    },
    activityTime: {
        fontSize: 10,
        fontFamily: 'Inter-Medium',
        marginTop: 2,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#10b98110',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    securityText: {
        fontSize: 9,
        fontFamily: 'Inter-Black',
        color: '#059669',
        letterSpacing: 0.5,
    }
});

export default VDRScreen;
