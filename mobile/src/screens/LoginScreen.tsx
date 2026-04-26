import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { ChevronRight, Mail, Lock, Rocket, Eye, EyeOff, Github, Linkedin } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginType, setLoginType] = useState('startup');
    const { login } = useContext(AuthContext);
    const navigation = useNavigation<any>();

    const handleLogin = async () => {
        if (!email || !password) return;
        setIsLoading(true);
        const res = await login(email, password);
        if (!res.success) {
            alert(res.message);
        }
        setIsLoading(false);
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.topSection}>
                    <View style={styles.header}>
                        <View style={styles.logoBadge}>
                            <Rocket size={28} color="#fff" />
                        </View>
                        <Text style={styles.brandName}>STARTUP CONNECT</Text>
                    </View>
                    <Text style={styles.heroTitle}>Hi Again.</Text>
                    <Text style={styles.heroSubtitle}>Connect with startups and investors instantly.</Text>
                </View>

                <View style={styles.socialSection}>
                    <TouchableOpacity style={styles.socialBtn}>
                        <Linkedin size={20} color="#1e293b" />
                        <Text style={styles.socialText}>LinkedIn</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialBtn}>
                        <Github size={20} color="#1e293b" />
                        <Text style={styles.socialText}>GitHub</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.roleToggle}>
                    <TouchableOpacity 
                        style={[styles.roleTab, loginType === 'startup' && styles.activeRoleTab]}
                        onPress={() => setLoginType('startup')}
                    >
                        <Text style={[styles.roleTabText, loginType === 'startup' && styles.activeRoleTabText]}>STARTUP LOGIN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.roleTab, loginType === 'investor' && styles.activeRoleTab]}
                        onPress={() => setLoginType('investor')}
                    >
                        <Text style={[styles.roleTabText, loginType === 'investor' && styles.activeRoleTabText]}>INVESTOR LOGIN</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR USE EMAIL</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>EMAIL</Text>
                        <View style={styles.inputWrapper}>
                            <Mail size={18} color="#94a3b8" />
                            <TextInput 
                                placeholder="Enter your email" 
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <TouchableOpacity>
                                <Text style={styles.forgotText}>FORGOT?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Lock size={18} color="#94a3b8" />
                            <TextInput 
                                placeholder="••••••••" 
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholderTextColor="#94a3b8"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.loginBtn, isLoading && styles.disabledBtn]} 
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? <ActivityIndicator color="#fff" /> : (
                            <Text style={styles.loginBtnText}>LOGIN</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>No account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.joinUsText}>JOIN US</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingBottom: 40 },
    topSection: { paddingHorizontal: 30, paddingTop: 60, marginBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    logoBadge: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    brandName: { fontSize: 18, fontWeight: '900', color: '#1e293b', letterSpacing: -1, fontStyle: 'italic' },
    heroTitle: { fontSize: 42, fontWeight: '900', color: '#1e293b', letterSpacing: -2, fontStyle: 'italic', marginBottom: 5 },
    heroSubtitle: { fontSize: 16, fontWeight: '700', color: '#64748b', fontStyle: 'italic' },
    
    socialSection: { flexDirection: 'row', paddingHorizontal: 30, gap: 15, marginBottom: 30 },
    socialBtn: { flex: 1, height: 60, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#f8fafc', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    socialText: { fontSize: 11, fontWeight: '900', color: '#1e293b', letterSpacing: 1, fontStyle: 'italic' },

    roleToggle: { marginHorizontal: 30, backgroundColor: '#f8fafc', borderRadius: 20, padding: 6, flexDirection: 'row', marginBottom: 30 },
    roleTab: { flex: 1, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    activeRoleTab: { backgroundColor: '#4f46e5', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 },
    roleTabText: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5 },
    activeRoleTabText: { color: '#fff' },

    dividerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, marginBottom: 30 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#f1f5f9' },
    dividerText: { marginHorizontal: 15, fontSize: 8, fontWeight: '900', color: '#cbd5e1', letterSpacing: 4 },

    formSection: { paddingHorizontal: 30 },
    inputGroup: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    label: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, fontStyle: 'italic', marginLeft: 5, marginBottom: 10 },
    inputWrapper: { height: 65, borderRadius: 20, backgroundColor: '#f8fafc', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    input: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '700', color: '#1e293b' },
    forgotText: { fontSize: 9, fontWeight: '900', color: '#4f46e5', letterSpacing: 1 },

    loginBtn: { height: 70, backgroundColor: '#1e293b', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#1e293b', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 25, elevation: 8 },
    disabledBtn: { opacity: 0.7 },
    loginBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 5, fontStyle: 'italic' },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { fontSize: 13, fontWeight: '700', color: '#64748b', fontStyle: 'italic' },
    joinUsText: { fontSize: 13, fontWeight: '900', color: '#4f46e5', textDecorationLine: 'underline' }
});
