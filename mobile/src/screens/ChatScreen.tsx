import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { Send, Plus, Paperclip, ChevronLeft, ShieldCheck, Cpu } from 'lucide-react-native';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import { format } from 'date-fns';

export default function ChatScreen({ route, navigation }: any) {
    const { conversationId, participantName } = route.params;
    const { user } = React.useContext(AuthContext);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const socketRef = useRef<any>(null);
    
    useEffect(() => {
        if (!user) return;
        fetchMessages();
        setupSocket();
        
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);

    const setupSocket = () => {
        socketRef.current = io('http://localhost:5000');
        socketRef.current.emit('auth', user.id);
        socketRef.current.emit('join_conversation', conversationId);

        socketRef.current.on('receive_message', (message: any) => {
            setMessages(prev => [...prev, message]);
        });
    };

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/messages/${conversationId}`);
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const sendMessage = () => {
        if (!inputText.trim() || !user) return;

        const messageData = {
            conversationId,
            senderId: user.id,
            text: inputText,
            messageType: 'text'
        };

        socketRef.current.emit('send_message', messageData);
        setInputText('');
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === user?.id || item.senderId._id === user?.id;
        
        return (
            <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.otherMessageWrapper]}>
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                        {item.text}
                    </Text>
                    <View style={styles.bubbleFooter}>
                         <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                         {isMe && <ShieldCheck size={10} color="#fff" style={{ marginLeft: 4 }} />}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.securityBanner}>
                <ShieldCheck size={12} color="#10b981" />
                <Text style={styles.securityText}>End-to-End Cryptographic Tunnel Active</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : (
                <FlatList 
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    ref={flatListRef}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}

            <View style={styles.inputArea}>
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Paperclip size={20} color="#94a3b8" />
                    </TouchableOpacity>
                    <TextInput 
                        placeholder="Calibrate message..." 
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholderTextColor="#94a3b8"
                        multiline
                    />
                </View>
                <TouchableOpacity 
                    style={[styles.sendBtn, !inputText.trim() && styles.disabledBtn]}
                    onPress={sendMessage}
                    disabled={!inputText.trim()}
                >
                    <Send size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    securityBanner: { height: 35, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    securityText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, color: '#94a3b8', marginLeft: 6 },
    messageList: { padding: 25, paddingBottom: 40 },
    messageWrapper: { marginBottom: 20, flexDirection: 'row' },
    myMessageWrapper: { justifyContent: 'flex-end' },
    otherMessageWrapper: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', padding: 18, borderRadius: 28 },
    myBubble: { backgroundColor: '#1e293b', borderBottomRightRadius: 5 },
    otherBubble: { backgroundColor: '#f8fafc', borderBottomLeftRadius: 5 },
    messageText: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
    myMessageText: { color: '#fff' },
    otherMessageText: { color: '#1e293b' },
    bubbleFooter: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 8 },
    timestamp: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', color: '#94a3b8' },
    inputArea: { padding: 20, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f8fafc', paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
    inputContainer: { flex: 1, height: 55, backgroundColor: '#f8fafc', borderRadius: 22, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
    attachBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    input: { flex: 1, marginLeft: 5, fontSize: 14, fontWeight: '600', color: '#1e293b' },
    sendBtn: { width: 55, height: 55, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
    disabledBtn: { backgroundColor: '#94a3b8' },
    loadingContainer: { flex: 1, justifyContent: 'center' }
});
