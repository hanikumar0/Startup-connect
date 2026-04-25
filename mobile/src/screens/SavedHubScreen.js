import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Pin, Trash2, Rocket, User, Zap, ChevronRight, Bookmark, Search } from 'lucide-react-native';
import api from '../services/api';

const SavedHubScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'Startup', 'Investor', 'Intelligence'];

    useEffect(() => {
        fetchSaved();
    }, []);

    const fetchSaved = async () => {
        try {
            const res = await api.get('/save');
            if (res.data.success) {
                setItems(res.data.items || []);
            }
        } catch (error) {
            console.error('Fetch Saved Error', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFav = async (id) => {
        try {
            await api.put(`/save/${id}/favorite`);
            setItems(prev => prev.map(i => i._id === id ? { ...i, isFavorite: !i.isFavorite } : i));
        } catch (error) {}
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`/save/${id}`);
            setItems(prev => prev.filter(i => i._id !== id));
        } catch (error) {}
    };

    const filtered = items.filter(i => {
        if (activeTab === 'All') return true;
        return i.targetType.toLowerCase() === activeTab.toLowerCase();
    });

    const renderItem = ({ item }) => {
        const isStartup = item.targetType === 'startup';
        const Icon = isStartup ? Rocket : (item.targetType === 'investor' ? User : Zap);

        return (
            <View style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: isStartup ? '#eef2ff' : '#f0fdf4' }]}>
                    <Icon color={isStartup ? '#4f46e5' : '#16a34a'} size={20} />
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Saved Item'}</Text>
                    <Text style={styles.cardDesc} numberOfLines={1}>{item.description || 'No description'}</Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.typeTag}>{item.targetType.toUpperCase()}</Text>
                        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => toggleFav(item._id)}>
                        <Star size={18} color={item.isFavorite ? '#eab308' : '#cbd5e1'} fill={item.isFavorite ? '#eab308' : 'transparent'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteItem(item._id)}>
                        <Trash2 size={18} color="#f1f5f9" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Saved Items</Text>
                <TouchableOpacity style={styles.searchBtn}>
                    <Search color="#94a3b8" size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabBar}>
                {tabs.map(tab => (
                    <TouchableOpacity 
                        key={tab} 
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList 
                data={filtered}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Bookmark size={48} color="#e2e8f0" strokeWidth={1} />
                        <Text style={styles.emptyTitle}>Your collection is empty</Text>
                        <Text style={styles.emptySubtitle}>Save startups or investors to keep track of your favorites.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
    },
    searchBtn: {
        padding: 8,
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 20,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
    },
    activeTab: {
        backgroundColor: '#4f46e5',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
    },
    activeTabText: {
        color: '#fff',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    typeTag: {
        fontSize: 9,
        fontWeight: '800',
        color: '#4f46e5',
        backgroundColor: '#eef2ff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    dateText: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#334155',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    }
});

export default SavedHubScreen;
