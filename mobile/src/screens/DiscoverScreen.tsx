import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Search, MapPin, Target, Wallet, Rocket, ChevronRight, Filter } from 'lucide-react-native';
import api from '../services/api';

export default function DiscoverScreen({ navigation }: any) {
    const [startups, setStartups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'startup' | 'investor'>('startup');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/discover/${activeTab === 'startup' ? 'startups' : 'investors'}`);
            if (res.data.success) {
                setStartups(res.data[activeTab === 'startup' ? 'startups' : 'investors']);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const renderCard = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.9}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.logoContainer, activeTab === 'startup' ? styles.startupLogo : styles.investorLogo]}>
                    <Text style={styles.logoText}>{(item.startupName || item.investorName || "S")[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                        <Text style={styles.name}>{item.startupName || item.investorName}</Text>
                        {activeTab === 'startup' ? <Rocket size={14} color="#6366f1" /> : <Wallet size={14} color="#10b981" />}
                    </View>
                    <Text style={styles.industry}>{(item.industry || "Generalist").toUpperCase()}</Text>
                </View>
            </View>

            <Text style={styles.tagline} numberOfLines={2}>
              {item.tagline || item.bio || "No description provided."}
            </Text>

            <View style={styles.cardFooter}>
                <View style={styles.stat}>
                    <MapPin size={12} color="#94a3b8" />
                    <Text style={styles.statLabel}>{item.location || 'Remote'}</Text>
                </View>
                {activeTab === 'startup' && (
                    <View style={styles.stat}>
                        <Target size={12} color="#94a3b8" />
                        <Text style={styles.statLabel}>{item.stage}</Text>
                    </View>
                )}
                <View style={styles.viewBtn}>
                    <ChevronRight size={18} color="#fff" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Search size={18} color="#94a3b8" />
                    <TextInput 
                        placeholder="Search institutional flow..." 
                        style={styles.searchInput}
                        placeholderTextColor="#94a3b8"
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color="#1e293b" />
                </TouchableOpacity>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'startup' && styles.activeTab]}
                    onPress={() => setActiveTab('startup')}
                >
                    <Text style={[styles.tabText, activeTab === 'startup' && styles.activeTabText]}>Startups</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'investor' && styles.activeTab]}
                    onPress={() => setActiveTab('investor')}
                >
                    <Text style={[styles.tabText, activeTab === 'investor' && styles.activeTabText]}>Investors</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList 
                    data={startups}
                    renderItem={renderCard}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
    searchBar: { flex: 1, backgroundColor: '#fff', height: 55, borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, borderWidth: 1, borderColor: '#f1f5f9', marginRight: 12 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 13, fontWeight: '700', color: '#1e293b' },
    filterBtn: { height: 55, width: 55, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
    tabBar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10 },
    tab: { paddingHorizontal: 25, height: 40, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    activeTab: { backgroundColor: '#1e293b' },
    tabText: { textTransform: 'uppercase', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: '#94a3b8' },
    activeTabText: { color: '#fff' },
    list: { padding: 20, paddingBottom: 100 },
    card: { backgroundColor: '#fff', borderRadius: 34, padding: 25, marginBottom: 20, borderWidth: 1, borderColor: '#f8fafc' },
    cardHeader: { flexDirection: 'row', marginBottom: 20 },
    logoContainer: { height: 50, width: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    startupLogo: { backgroundColor: '#eff6ff' },
    investorLogo: { backgroundColor: '#ecfdf5' },
    logoText: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
    row: { flexDirection: 'row', alignItems: 'center' },
    name: { fontSize: 18, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5, marginRight: 6 },
    industry: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginTop: 2 },
    tagline: { fontSize: 14, fontWeight: '600', color: '#64748b', lineHeight: 22, marginBottom: 20, fontStyle: 'italic' },
    cardFooter: { flexDirection: 'row', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9', justifyContent: 'space-between', alignItems: 'center' },
    stat: { flexDirection: 'row', alignItems: 'center' },
    statLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginLeft: 6 },
    viewBtn: { height: 40, width: 40, borderRadius: 16, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center' }
});
