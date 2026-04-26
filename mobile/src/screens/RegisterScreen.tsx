import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { ChevronRight, Mail, Lock, Rocket, Eye, EyeOff, User, Wallet, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { sendOTP, registerVerify } = useContext(AuthContext);
    const [otp, setOtp] = useState('');
    const navigation = useNavigation<any>();

    const handleNext = async () => {
        if (step === 1) {
            if (!name || !email || !password || !confirmPassword) return;
            if (password !== confirmPassword) {
                Alert.alert("Error", "Passwords do not match");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!role) return;
            setIsLoading(true);
            const res = await sendOTP(email);
            setIsLoading(false);
            if (res.success) {
                setStep(3);
            } else {
                Alert.alert("Error", res.message);
            }
        }
    };

    const handleRegister = async () => {
        if (!otp) return;
        setIsLoading(true);
        const res = await registerVerify({
            name,
            email,
            password,
            confirmPassword,
            role,
            otp
        });
        setIsLoading(false);
        if (res.success) {
            // navigation.navigate('MainTabs'); // AuthContext will automatically redirect if using state
        } else {
            Alert.alert("Error", res.message);
        }
    };

    const renderStep1 = () => (
        <View style={styles.formSection}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>NAME</Text>
                <View style={styles.inputWrapper}>
                    <User size={18} color="#94a3b8" />
                    <TextInput 
                        placeholder="Your name" 
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#94a3b8"
                    />
                </View>
            </View>

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
                <Text style={styles.label}>PASSWORD</Text>
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

            <View style={styles.inputGroup}>
                <Text style={styles.label}>REPEAT PASSWORD</Text>
                <View style={styles.inputWrapper}>
                    <Lock size={18} color="#94a3b8" />
                    <TextInput 
                        placeholder="••••••••" 
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#94a3b8"
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
                <Text style={styles.primaryBtnText}>NEXT</Text>
                <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Choose your role.</Text>
            
            <TouchableOpacity 
                style={[styles.roleCard, role === 'startup' && styles.activeRoleCard]}
                onPress={() => setRole('startup')}
            >
                <View style={[styles.roleIcon, role === 'startup' && styles.activeRoleIcon]}>
                    <Rocket size={24} color={role === 'startup' ? '#fff' : '#4f46e5'} />
                </View>
                <View>
                    <Text style={styles.roleLabel}>FOUNDERS</Text>
                    <Text style={styles.roleTitle}>Founder</Text>
                    <Text style={styles.roleDesc}>I want to find investors for my startup.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.roleCard, role === 'investor' && styles.activeRoleCard]}
                onPress={() => setRole('investor')}
            >
                <View style={[styles.roleIcon, role === 'investor' && styles.activeRoleIcon]}>
                    <Wallet size={24} color={role === 'investor' ? '#fff' : '#1e293b'} />
                </View>
                <View>
                    <Text style={styles.roleLabel}>INVESTORS</Text>
                    <Text style={styles.roleTitle}>Investor</Text>
                    <Text style={styles.roleDesc}>I want to find and fund great startups.</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.btnRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                    <Text style={styles.backBtnText}>BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={handleNext}>
                    <Text style={styles.primaryBtnText}>JOIN</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.formSection}>
            <View style={styles.otpHeader}>
                <View style={styles.otpIconWrapper}>
                    <ShieldCheck size={40} color="#4f46e5" />
                </View>
                <Text style={styles.otpTitle}>Verify.</Text>
                <Text style={styles.otpSubtitle}>We sent a code to your email.</Text>
            </View>

            <View style={styles.otpInputGroup}>
                <Text style={styles.label}>CODE</Text>
                <TextInput 
                    placeholder="••••••" 
                    style={styles.otpInput}
                    maxLength={6}
                    keyboardType="number-pad"
                    placeholderTextColor="#cbd5e1"
                    value={otp}
                    onChangeText={setOtp}
                />
            </View>

            <TouchableOpacity 
                style={[styles.primaryBtn, isLoading && styles.disabledBtn]} 
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? <ActivityIndicator color="#fff" /> : (
                    <Text style={styles.primaryBtnText}>COMPLETE</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendBtn}>
                <Text style={styles.resendText}>RESEND CODE</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.topSection}>
                    <TouchableOpacity style={styles.navBack} onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
                        <ArrowLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <View style={styles.logoBadge}>
                            <Rocket size={28} color="#fff" />
                        </View>
                        <Text style={styles.brandName}>STARTUP CONNECT</Text>
                    </View>
                    <Text style={styles.heroTitle}>Join Us.</Text>
                    <Text style={styles.heroSubtitle}>Connect with startups and investors today.</Text>
                </View>

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already in? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginUsText}>LOGIN</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingBottom: 40 },
    topSection: { paddingHorizontal: 30, paddingTop: 40, marginBottom: 20 },
    navBack: { marginBottom: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    logoBadge: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    brandName: { fontSize: 18, fontWeight: '900', color: '#1e293b', letterSpacing: -1, fontStyle: 'italic' },
    heroTitle: { fontSize: 42, fontWeight: '900', color: '#1e293b', letterSpacing: -2, fontStyle: 'italic', marginBottom: 5 },
    heroSubtitle: { fontSize: 16, fontWeight: '700', color: '#64748b', fontStyle: 'italic' },
    
    formSection: { paddingHorizontal: 30 },
    sectionTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b', fontStyle: 'italic', marginBottom: 25, textTransform: 'uppercase', letterSpacing: -1 },
    
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, fontStyle: 'italic', marginLeft: 5, marginBottom: 10 },
    inputWrapper: { height: 65, borderRadius: 20, backgroundColor: '#f8fafc', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderWidth: 1, borderColor: '#f1f5f9' },
    input: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '700', color: '#1e293b' },

    primaryBtn: { height: 70, backgroundColor: '#1e293b', borderRadius: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 10, shadowColor: '#1e293b', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.2, shadowRadius: 25, elevation: 8 },
    primaryBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 5, fontStyle: 'italic' },
    disabledBtn: { opacity: 0.7 },

    btnRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
    backBtn: { width: 100, height: 70, borderRadius: 22, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    backBtnText: { fontSize: 11, fontWeight: '900', color: '#64748b', letterSpacing: 2 },

    roleCard: { padding: 25, borderRadius: 30, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 20 },
    activeRoleCard: { borderColor: '#4f46e5', backgroundColor: '#f0f0ff' },
    roleIcon: { width: 55, height: 55, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10 },
    activeRoleIcon: { backgroundColor: '#4f46e5' },
    roleLabel: { fontSize: 8, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, marginBottom: 4 },
    roleTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b', fontStyle: 'italic', textTransform: 'uppercase' },
    roleDesc: { fontSize: 13, fontWeight: '600', color: '#64748b', fontStyle: 'italic', marginTop: 5 },

    otpHeader: { alignItems: 'center', marginVertical: 30 },
    otpIconWrapper: { width: 90, height: 90, borderRadius: 30, backgroundColor: '#f0f0ff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    otpTitle: { fontSize: 32, fontWeight: '900', color: '#1e293b', fontStyle: 'italic', textTransform: 'uppercase' },
    otpSubtitle: { fontSize: 15, fontWeight: '700', color: '#94a3b8', fontStyle: 'italic', marginTop: 5 },
    otpInputGroup: { marginBottom: 30 },
    otpInput: { height: 80, backgroundColor: '#f8fafc', borderRadius: 25, textAlign: 'center', fontSize: 36, fontWeight: '900', letterSpacing: 15, color: '#1e293b', borderWidth: 1, borderColor: '#f1f5f9' },
    resendBtn: { marginTop: 25, alignSelf: 'center' },
    resendText: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, fontStyle: 'italic' },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
    footerText: { fontSize: 13, fontWeight: '700', color: '#64748b', fontStyle: 'italic' },
    loginUsText: { fontSize: 13, fontWeight: '900', color: '#4f46e5', textDecorationLine: 'underline' }
});
