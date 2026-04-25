import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Target, Zap, ChevronRight, Rocket, Wallet, ShieldCheck } from 'lucide-react-native';
import api from '../services/api';

export default function MatchScreen() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const res = await api.get('/match/recommendations');
            if (res.data.success) {
                setMatches(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const renderMatch = ({ item }: { item: any }) => {
        const score = Math.round(item.matchScore || 85);
        
        return (
            <TouchableOpacity style={styles.matchCard}>
                <View style={styles.matchHeader}>
                    <View style={styles.scoreBadge}>
                        <Zap size={14} color="#f59e0b" fill="#f59e0b" />
                        <Text style={styles.scoreText}>{score}% SIGNAL</Text>
                    </View>
                    <ShieldCheck size={16} color="#10b981" />
                </View>

                <View style={styles.profileSection}>
                    <View style={styles.identity}>
                         <Text style={styles.name}>{item.startupName || item.investorName}</Text>
                         <Text style={styles.industry}>{(item.industry || "Strategic Partner").toUpperCase()}</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(item.startupName || item.investorName || "P")[0]}</Text>
                    </View>
                </View>

                <View style={styles.reasonArea}>
                    <Text style={styles.reasonTitle}>ALIGNMENT VECTORS</Text>
                    <View style={styles.vectorList}>
                         <View style={styles.vector}><Text style={styles.vectorText}>Sector Fit</Text></View>
                         <View style={styles.vector}><Text style={styles.vectorText}>Phase Alpha</Text></View>
                         <View style={styles.vector}><Text style={styles.vectorText}>Asset Scale</Text></View>
                    </View>
                </View>

                <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>INITIATE TUNNEL</Text>
                    <ChevronRight size={18} color="#fff" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.hero}>
                <Text style={styles.heroSubtitle}>High-Probability Pipeline</Text>
                <Text style={styles.heroTitle}>Strategic Matches</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList 
                    data={matches}
                    renderItem={renderMatch}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Target size={60} color="#e2e8f0" strokeWidth={1} />
                            <Text style={styles.emptyTitle}>NO SIGNAL DETECTED</Text>
                            <Text style={styles.emptyText}>Update your strategic profile to calibrate the recommendation engine.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    hero: { padding: 25, paddingTop: 60, backgroundColor: '#fff' },
    heroSubtitle: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    heroTitle: { fontSize: 32, fontWeight: '900', color: '#1e293b', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -1 },
    list: { padding: 25, paddingBottom: 100 },
    matchCard: { backgroundColor: '#f8fafc', borderRadius: 36, padding: 30, marginBottom: 25, borderWidth: 1, borderColor: '#f1f5f9' },
    matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    scoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#fef3c7' },
    scoreText: { fontSize: 9, fontWeight: '900', color: '#d97706', marginLeft: 6, letterSpacing: 1 },
    profileSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    identity: { flex: 1 },
    name: { fontSize: 22, fontWeight: '900', color: '#1e293b', fontStyle: 'italic', letterSpacing: -0.5 },
    industry: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginTop: 4 },
    avatar: { width: 60, height: 60, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#eff6ff' },
    avatarText: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    reasonArea: { marginBottom: 30 },
    reasonTitle: { fontSize: 8, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, marginBottom: 12 },
    vectorList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    vector: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#f1f5f9' },
    vectorText: { fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
    actionBtn: { height: 60, backgroundColor: '#1e293b', borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    actionText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 2 },
    loadingContainer: { flex: 1, justifyContent: 'center' },
    empty: { marginTop: 100, alignItems: 'center', paddingHorizontal: 50 },
    emptyTitle: { fontSize: 14, fontWeight: '900', color: '#1e293b', marginTop: 25, letterSpacing: 2 },
    emptyText: { fontSize: 12, fontWeight: '600', color: '#94a3b8', textAlign: 'center', marginTop: 10, lineHeight: 20, fontStyle: 'italic' }
});
