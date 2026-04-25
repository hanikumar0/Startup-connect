import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrainCircuit, Send, Sparkles, MessageSquare, Target, Rocket, ChevronLeft, Zap, Info } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, SlideInRight } from 'react-native-reanimated';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const AICoachScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const [messages, setMessages] = useState([
        { 
            id: '1', 
            role: 'coach', 
            content: "HELLO FOUNDER. I AM ALPHA. YOUR AI STRATEGIC ADVISOR. I AM TUNED FOR PITCH OPTIMIZATION, MARKET INTELLIGENCE, AND INVESTOR PSYCHOLOGY. WHAT IS OUR OBJECTIVE TODAY?" 
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef();

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { id: Date.now().toString(), role: 'user', content: input.toUpperCase() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/improve-text', { 
                text: input,
                type: 'startup_vision' 
            });

            const coachMsg = { 
                id: (Date.now() + 1).toString(), 
                role: 'coach', 
                content: (res.data.improvedText || "ANALYSIS COMPLETE. TO MAXIMIZE CONVERSION, FOCUS ON SCALABILITY METRICS AND UNIT ECONOMICS. SHALL I REWRITE THE VISION WITH A VENTURE-SCALE FOCUS?").toUpperCase()
            };
            setMessages(prev => [...prev, coachMsg]);
        } catch (error) {
            console.error('AI Coach Error', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.muted }]}>
                        <ChevronLeft color={theme.foreground} size={20} />
                    </TouchableOpacity>
                    <View style={styles.headerLabelRow}>
                        <Text style={[styles.headerLabel, { color: theme.mutedForeground }]}>AI ADVISORY</Text>
                        <View style={[styles.dot, { backgroundColor: theme.border }]} />
                        <Text style={[styles.headerLabel, { color: theme.primary }]}>ALPHA CORE</Text>
                    </View>
                </View>
                <View style={styles.headerMain}>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]}>ALPHA COACH</Text>
                    <View style={[styles.statusBadge, { backgroundColor: theme.primary + '15' }]}>
                        <View style={[styles.pulse, { backgroundColor: theme.primary }]} />
                        <Text style={[styles.statusText, { color: theme.primary }]}>LIVE</Text>
                    </View>
                </View>
            </View>

            <ScrollView 
                ref={scrollRef}
                style={styles.chatContainer}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, index) => (
                    <Animated.View 
                        key={msg.id} 
                        entering={index === messages.length - 1 ? SlideInRight : FadeIn}
                        style={[
                            styles.messageRow, 
                            msg.role === 'user' ? styles.userRow : styles.coachRow
                        ]}
                    >
                        {msg.role === 'coach' && (
                            <View style={[styles.coachAvatar, { backgroundColor: theme.primary }]}>
                                <BrainCircuit color="#fff" size={12} />
                            </View>
                        )}
                        <View style={[
                            styles.bubble, 
                            msg.role === 'user' ? [styles.userBubble, { backgroundColor: theme.foreground }] : [styles.coachBubble, { backgroundColor: theme.card, borderColor: theme.border }]
                        ]}>
                            <Text style={[
                                styles.messageText,
                                msg.role === 'user' ? [styles.userText, { color: theme.background }] : [styles.coachText, { color: theme.foreground }]
                            ]}>
                                {msg.content}
                            </Text>
                        </View>
                    </Animated.View>
                ))}
                {loading && (
                    <View style={styles.coachRow}>
                        <View style={[styles.coachAvatar, { backgroundColor: theme.primary }]}>
                            <BrainCircuit color="#fff" size={12} />
                        </View>
                        <View style={[styles.bubble, styles.coachBubble, { backgroundColor: theme.card, borderColor: theme.border, paddingVertical: 8 }]}>
                            <ActivityIndicator size="small" color={theme.primary} />
                        </View>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputArea, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                    <View style={styles.suggestions}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {['OPTIMIZE VISION', 'INVESTOR Q&A', 'TRACTION CHECK', 'METRIC FIX'].map(tag => (
                                <TouchableOpacity 
                                    key={tag} 
                                    style={[styles.tag, { backgroundColor: theme.muted, borderColor: theme.border }]}
                                    onPress={() => setInput(tag)}
                                >
                                    <Text style={[styles.tagText, { color: theme.mutedForeground }]}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.inputRow}>
                        <TextInput 
                            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.foreground }]}
                            placeholder="COMMAND ALPHA..."
                            placeholderTextColor={theme.mutedForeground}
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />
                        <TouchableOpacity 
                            style={[styles.sendBtn, { backgroundColor: input.trim() ? theme.primary : theme.muted }]}
                            onPress={sendMessage}
                            disabled={!input.trim()}
                        >
                            <Send color={input.trim() ? "#fff" : theme.mutedForeground} size={18} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    headerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerLabel: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    headerTitle: { fontSize: 24, fontFamily: 'Inter-Black', letterSpacing: -0.5 },
    backBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    pulse: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 8, fontFamily: 'Inter-Black', letterSpacing: 1 },
    chatContainer: { flex: 1, padding: 24 },
    messageRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
    userRow: { justifyContent: 'flex-end' },
    coachRow: { justifyContent: 'flex-start' },
    coachAvatar: { width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginBottom: 4 },
    bubble: { maxWidth: '85%', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 24 },
    userBubble: { borderBottomRightRadius: 4 },
    coachBubble: { borderBottomLeftRadius: 4, borderWidth: 1 },
    messageText: { fontSize: 13, fontFamily: 'Inter-Medium', lineHeight: 18 },
    userText: { fontWeight: '700' },
    coachText: { fontWeight: '700' },
    inputArea: { padding: 20, borderTopWidth: 1 },
    suggestions: { marginBottom: 16 },
    tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginRight: 8 },
    tagText: { fontSize: 9, fontFamily: 'Inter-Black', letterSpacing: 0.5 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
    input: { flex: 1, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12, fontSize: 13, fontFamily: 'Inter-Medium', maxHeight: 100, borderWidth: 1 },
    sendBtn: { width: 48, height: 48, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }
});

export default AICoachScreen;
