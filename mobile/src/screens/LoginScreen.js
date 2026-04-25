import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Platform,
    ActivityIndicator
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Rocket, ShieldCheck, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const LoginScreen = ({ navigation }) => {
    const [role, setRole] = useState('startup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const { theme, isDark } = useTheme();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setIsLoading(true);
        setError('');
        const result = await login(email, password, role);
        if (!result.success) {
            setError(result.message);
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.content}
                enableOnAndroid={true}
                extraScrollHeight={20}
                showsVerticalScrollIndicator={false}
            >
                {/* Branding */}
                <Animated.View entering={FadeIn} style={styles.branding}>
                    <View style={styles.logoRow}>
                        <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
                            <Rocket color="#fff" size={20} />
                        </View>
                        <Text style={[styles.logoText, { color: theme.foreground }]}>STARTUP CONNECT</Text>
                    </View>
                </Animated.View>

                {/* Hero Section */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.hero}>
                    <Text style={[styles.title, { color: theme.foreground }]}>HI AGAIN.</Text>
                    <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>Enter your credentials to access the alpha ecosystem.</Text>
                </Animated.View>

                {/* Role Tabs */}
                <Animated.View entering={FadeInDown.delay(200)} style={[styles.tabs, { backgroundColor: theme.muted }]}>
                    <TouchableOpacity 
                        style={[styles.tab, role === 'startup' && { backgroundColor: theme.primary }]}
                        onPress={() => setRole('startup')}
                    >
                        <Text style={[styles.tabText, role === 'startup' ? { color: '#fff' } : { color: theme.mutedForeground }]}>STARTUP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, role === 'investor' && { backgroundColor: theme.primary }]}
                        onPress={() => setRole('investor')}
                    >
                        <Text style={[styles.tabText, role === 'investor' ? { color: '#fff' } : { color: theme.mutedForeground }]}>INVESTOR</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Form */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.form}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.mutedForeground }]}>IDENTIFIER</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.input, color: theme.foreground, borderColor: theme.border }]}
                            placeholder="Email address"
                            placeholderTextColor={theme.mutedForeground}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.label, { color: theme.mutedForeground }]}>PASSWORD</Text>
                            <TouchableOpacity>
                                <Text style={[styles.forgotText, { color: theme.primary }]}>FORGOT?</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.input, color: theme.foreground, borderColor: theme.border }]}
                            placeholder="••••••••"
                            placeholderTextColor={theme.mutedForeground}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={true}
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.loginBtn, { backgroundColor: theme.foreground }]} 
                        onPress={handleLogin} 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={theme.background} />
                        ) : (
                            <Text style={[styles.loginBtnText, { color: theme.background }]}>AUTHENTICATE</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)} style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.mutedForeground }]}>No account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={[styles.footerLink, { color: theme.primary }]}>JOIN THE ALPHA</Text>
                    </TouchableOpacity>
                </Animated.View>
                
                <Animated.View entering={FadeIn.delay(600)} style={styles.secureBadge}>
                    <ShieldCheck size={14} color={theme.primary} />
                    <Text style={[styles.secureText, { color: theme.foreground }]}>ENCRYPTED SESSION</Text>
                </Animated.View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 32,
        paddingTop: 40,
        paddingBottom: 40,
    },
    branding: {
        marginBottom: 48,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 14,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    hero: {
        marginBottom: 32,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: -2,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        lineHeight: 20,
    },
    tabs: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 4,
        marginBottom: 32,
    },
    tab: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    tabText: {
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 1.5,
    },
    forgotText: {
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 15,
        fontFamily: 'Inter-SemiBold',
        borderWidth: 1,
    },
    loginBtn: {
        height: 60,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    loginBtnText: {
        fontSize: 13,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    footerText: {
        fontSize: 13,
        fontFamily: 'Inter-Medium',
    },
    footerLink: {
        fontSize: 13,
        fontFamily: 'Inter-Black',
        textDecorationLine: 'underline',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 60,
    },
    secureText: {
        fontSize: 9,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontFamily: 'Inter-Bold',
        textAlign: 'center',
        marginBottom: 16,
    }
});

export default LoginScreen;

