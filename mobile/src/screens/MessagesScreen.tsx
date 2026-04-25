import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MessageSquare, Check, CheckCheck, Plus, Search } from 'lucide-react-native';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesScreen({ navigation }: any) {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/messages/conversations');
            if (res.data.success) {
                setConversations(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const renderConversation = ({ item }: { item: any }) => {
        const otherParticipant = item.participants.find((p: any) => p._id !== item.currentUserId);
        
        return (
            <TouchableOpacity 
                style={styles.chatCard}
                onPress={() => navigation.navigate('Chat', { conversationId: item._id, participantName: otherParticipant?.name })}
            >
                <View style={styles.avatarContainer}>
                    {otherParticipant?.avatar ? (
                        <Image source={{ uri: otherParticipant.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{otherParticipant?.name?.[0] || 'U'}</Text>
                        </View>
                    )}
                    <View style={styles.onlineBadge} />
                </View>

                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.participantName}>{otherParticipant?.name || 'Venture Partner'}</Text>
                        <Text style={styles.time}>
                            {item.lastMessage?.at ? formatDistanceToNow(new Date(item.lastMessage.at)) : ''}
                        </Text>
                    </View>
                    <View style={styles.chatFooter}>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {item.lastMessage?.text || 'No messages yet'}
                        </Text>
                        {item.unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Inbound Pulse</Text>
                <TouchableOpacity style={styles.composeBtn}>
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                     <Search size={18} color="#94a3b8" />
                     <Text style={styles.searchPlaceholder}>Search Secure Channels...</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList 
                    data={conversations}
                    renderItem={renderConversation}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 25, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: '900', color: '#1e293b', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -1 },
    composeBtn: { width: 50, height: 50, borderRadius: 18, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', shadowColor: '#1e293b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
    searchSection: { paddingHorizontal: 25, marginBottom: 20 },
    searchBar: { height: 50, backgroundColor: '#f8fafc', borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
    searchPlaceholder: { marginLeft: 10, fontSize: 13, fontWeight: '700', color: '#94a3b8' },
    list: { paddingBottom: 100 },
    chatCard: { flexDirection: 'row', padding: 25, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    avatarContainer: { position: 'relative', width: 60, height: 60 },
    avatar: { width: 60, height: 60, borderRadius: 24 },
    avatarPlaceholder: { width: 60, height: 60, borderRadius: 24, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#dbeafe' },
    avatarText: { fontSize: 24, fontWeight: '900', color: '#2563eb' },
    onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10b981', borderWidth: 3, borderColor: '#fff' },
    chatInfo: { flex: 1, marginLeft: 20 },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    participantName: { fontSize: 16, fontWeight: '900', color: '#1e293b', letterSpacing: -0.3 },
    time: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
    chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    lastMessage: { fontSize: 13, fontWeight: '600', color: '#64748b', fontStyle: 'italic', maxWidth: '85%' },
    unreadBadge: { backgroundColor: '#4f46e5', paddingHorizontal: 8, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    unreadText: { fontSize: 10, fontWeight: '900', color: '#fff' },
    loadingContainer: { flex: 1, justifyContent: 'center' }
});
