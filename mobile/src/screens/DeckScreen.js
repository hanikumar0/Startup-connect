import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Plus, Eye, Share2, MoreVertical, Layout, Clock, Download } from 'lucide-react-native';
import api from '../services/api';

const DeckScreen = ({ navigation }) => {
    const [decks, setDecks] = useState([
        { id: '1', name: 'Series A Pitch Deck', version: '2.4', date: '2024-03-15', views: 142, size: '12.4MB', active: true },
        { id: '2', name: 'Flash Pitch (v1)', version: '1.0', date: '2024-01-10', views: 89, size: '4.2MB', active: false },
        { id: '3', name: 'Product Deep-dive', version: '1.2', date: '2024-02-20', views: 45, size: '28.1MB', active: false },
    ]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Pitch Decks</Text>
                <TouchableOpacity style={styles.addBtn}>
                    <Plus color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.activeCard}>
                    <Text style={styles.activeLabel}>CURRENT ACTIVE DECK</Text>
                    <View style={styles.activeContent}>
                        <View style={styles.deckIcon}>
                            <Layout color="#4f46e5" size={32} />
                        </View>
                        <View style={styles.activeText}>
                            <Text style={styles.activeTitle}>{decks[0].name}</Text>
                            <Text style={styles.activeMeta}>Version {decks[0].version} • {decks[0].size}</Text>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Eye color="#64748b" size={14} />
                            <Text style={styles.statText}>{decks[0].views} Total Views</Text>
                        </View>
                        <View style={styles.stat}>
                            <Share2 color="#64748b" size={14} />
                            <Text style={styles.statText}>18 Direct Shares</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.shareBtn}>
                        <Text style={styles.shareBtnText}>Share Secure Link</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Version History</Text>
                {decks.map(deck => (
                    <View key={deck.id} style={styles.historyCard}>
                        <View style={styles.historyIcon}>
                            <FileText color="#94a3b8" size={20} />
                        </View>
                        <View style={styles.historyBody}>
                            <Text style={styles.historyName}>{deck.name}</Text>
                            <Text style={styles.historyDate}>{new Date(deck.date).toLocaleDateString()} • v{deck.version}</Text>
                        </View>
                        <TouchableOpacity style={styles.moreBtn}>
                            <Download color="#cbd5e1" size={18} />
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.tipBox}>
                    <Clock color="#4f46e5" size={20} />
                    <View style={styles.tipText}>
                        <Text style={styles.tipTitle}>Investor Retention</Text>
                        <Text style={styles.tipSubtitle}>Investors spend an average of 3 min 44 sec on a deck. Optimize your 'Problem' slide for maximum engagement.</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    activeCard: {
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    activeLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#4f46e5',
        letterSpacing: 1.5,
        marginBottom: 16,
    },
    activeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    deckIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#f5f3ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activeText: {
        flex: 1,
    },
    activeTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    activeMeta: {
        fontSize: 13,
        color: '#64748b',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    shareBtn: {
        backgroundColor: '#1e293b',
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#334155',
        marginBottom: 16,
    },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    historyIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyBody: {
        flex: 1,
    },
    historyName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
    },
    historyDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    moreBtn: {
        padding: 8,
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: '#f5f3ff',
        padding: 20,
        borderRadius: 24,
        marginTop: 20,
        marginBottom: 40,
        gap: 16,
    },
    tipText: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4f46e5',
        marginBottom: 4,
    },
    tipSubtitle: {
        fontSize: 13,
        color: '#7c3aed',
        lineHeight: 18,
    }
});

export default DeckScreen;
