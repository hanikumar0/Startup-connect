import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { ChevronRight, ShieldCheck, Mail, Lock, Cpu } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);

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
            <View style={styles.topSection}>
                 <View style={styles.logoBadge}>
                    <Cpu size={32} color="#fff" />
                 </View>
                 <Text style={styles.heroTitle}>Strategic Connect</Text>
                 <Text style={styles.heroSubtitle}>Institutional Ecosystem Gateway</Text>
            </View>

            <View style={styles.formSection}>
                 <View style={styles.inputCard}>
                    <View style={styles.inputWrapper}>
                        <Mail size={18} color="#94a3b8" />
                        <TextInput 
                            placeholder="Institutional Email" 
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.inputWrapper}>
                        <Lock size={18} color="#94a3b8" />
                        <TextInput 
                            placeholder="Secure Passphrase" 
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                 </View>

                 <TouchableOpacity 
                    style={[styles.loginBtn, isLoading && styles.disabledBtn]} 
                    onPress={handleLogin}
                    disabled={isLoading}
                 >
                    {isLoading ? <ActivityIndicator color="#fff" /> : (
                        <>
                            <Text style={styles.loginText}>CALIBRATE SESSION</Text>
                            <ChevronRight size={20} color="#fff" />
                        </>
                    )}
                 </TouchableOpacity>

                 <TouchableOpacity style={styles.forgotBtn}>
                    <Text style={styles.forgotText}>Identity Recovery Protocol</Text>
                 </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                 <View style={styles.securitySeal}>
                    <ShieldCheck size={14} color="#10b981" />
                    <Text style={styles.securityText}>AES-256 ENCRYPTED TUNNEL ACTIVE</Text>
                 </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    topSection: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    logoBadge: { width: 80, height: 80, borderRadius: 32, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 25, shadowColor: '#1e293b', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 25 },
    heroTitle: { fontSize: 32, fontWeight: '900', color: '#1e293b', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -1.5 },
    heroSubtitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginTop: 10 },
    formSection: { padding: 40, paddingBottom: 60 },
    inputCard: { backgroundColor: '#f8fafc', borderRadius: 32, padding: 15, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 30 },
    inputWrapper: { height: 65, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
    input: { flex: 1, marginLeft: 15, fontSize: 14, fontWeight: '700', color: '#1e293b' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 20 },
    loginBtn: { height: 75, backgroundColor: '#1e293b', borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, shadowColor: '#1e293b', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 10 },
    disabledBtn: { backgroundColor: '#94a3b8' },
    loginText: { fontSize: 11, fontWeight: '900', color: '#fff', letterSpacing: 2.5 },
    forgotBtn: { marginTop: 25, alignSelf: 'center' },
    forgotText: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
    footer: { padding: 40, alignItems: 'center' },
    securitySeal: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
    securityText: { fontSize: 8, fontWeight: '900', color: '#10b981', letterSpacing: 1.5 }
});
