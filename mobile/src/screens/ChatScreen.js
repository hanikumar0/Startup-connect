import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Send, ChevronLeft } from 'lucide-react-native';
import { API_BASE_URL } from '../utils/constants';

const API_URL = API_BASE_URL;

const ChatScreen = ({ route, navigation }) => {
    const { partnerId, partnerName } = route.params || { partnerId: 'user_2', partnerName: 'Jane Investor' };
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const socketRef = useRef(null);
    const flatListRef = useRef(null);

    const conversationId = [user.id, partnerId].sort().join('_');

    useEffect(() => {
        socketRef.current = io(API_URL);

        socketRef.current.emit('join_room', conversationId);

        socketRef.current.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const messageData = {
            conversationId,
            senderId: user.id,
            receiverId: partnerId,
            text: inputText,
            createdAt: new Date(),
        };

        socketRef.current.emit('send_message', messageData);
        setInputText('');
    };

    const renderItem = ({ item }) => {
        const isMine = item.senderId === user.id;
        return (
            <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                    {item.text}
                </Text>
                <Text style={styles.timestamp}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#111827" size={24} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{partnerName || 'Chat'}</Text>
                    <Text style={styles.onlineStatus}>Online</Text>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline={true}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Send color="#fff" size={20} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        height: 60,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    onlineStatus: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '500',
    },
    messageList: {
        padding: 16,
        paddingBottom: 20,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#4f46e5',
        borderBottomRightRadius: 2,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: '#111827',
    },
    timestamp: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.4)',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputArea: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    input: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
        fontSize: 15,
        color: '#111827',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#4f46e5',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
});

export default ChatScreen;
