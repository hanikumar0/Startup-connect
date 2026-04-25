import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '../services/api';
import { Zap, Globe, Calendar, Bookmark, Share2, ExternalLink } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const IntelligenceScreen = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('news');

    useEffect(() => {
        fetchIntelligence();
    }, [activeTab]);

    const fetchIntelligence = async () => {
        try {
            setLoading(true);
            const res = await apiFetch(`/api/intelligence?type=${activeTab}`);
            const data = await res.json();
            if (data.success) {
                setNews(data.data);
            }
        } catch (error) {
            console.error('Intelligence Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => item.url && Linking.openURL(item.url)}
        >
            {item.image && (
                <Image source={{ uri: item.image }} style={styles.cardImage} />
            )}
            <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                    <View style={styles.sourceTag}>
                        <Globe size={12} color="#4f46e5" />
                        <Text style={styles.sourceText}>{item.source || 'Ecosystem'}</Text>
                    </View>
                    <Text style={styles.dateText}>{new Date(item.publishedAt).toLocaleDateString()}</Text>
                </View>
                
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardSummary} numberOfLines={3}>{item.summary || item.content}</Text>
                
                <View style={styles.cardFooter}>
                    <View style={styles.chipContainer}>
                        {['SaaS', 'Funding'].map((tag, i) => (
                             <View key={i} style={styles.chip}>
                                <Text style={styles.chipText}>{tag}</Text>
                             </View>
                        ))}
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Bookmark size={16} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Share2 size={16} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={styles.iconCircle}>
                        <Zap color="#fff" size={20} />
                    </View>
                    <Text style={styles.title}>Market Intelligence</Text>
                </View>

                <View style={styles.tabBar}>
                    {['news', 'grants', 'events'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && styles.activeTab
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText
                            ]}>
                                {tab.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#4f46e5" />
                </View>
            ) : (
                <FlatList
                    data={news}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                             <Zap size={48} color="#cbd5e1" />
                             <Text style={styles.emptyText}>No intelligence gathered yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    tabBar: {
        flexDirection: 'row',
        gap: 12,
    },
    tab: {
        paddingVertical: 6,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#4f46e5',
    },
    tabText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#94a3b8',
        letterSpacing: 1,
    },
    activeTabText: {
        color: '#4f46e5',
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#f8fafc',
    },
    cardBody: {
        pdding: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sourceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    sourceText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#4f46e5',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    dateText: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
        lineHeight: 24,
        marginBottom: 8,
    },
    cardSummary: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chipContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    chip: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    chipText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
    loadingContainer: {
        paddingVertical: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#cbd5e1',
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

export default IntelligenceScreen;
