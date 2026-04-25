import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, { 
    FadeIn, 
    FadeInRight, 
    FadeOutLeft, 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring 
} from 'react-native-reanimated';
import { 
    Rocket, 
    ChevronRight, 
    ChevronLeft, 
    MapPin, 
    Briefcase, 
    DollarSign, 
    Sparkles, 
    Globe, 
    ShieldCheck,
    Target
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { API_URL } from '../utils/constants';

const { width } = Dimensions.get('window');

const INDUSTRIES = ["SaaS", "Fintech", "AI/ML", "Healthtech", "Cleantech", "Crypto/Web3", "E-commerce"];
const STAGES = ["Idea", "MVP", "Seed", "Series A", "Series B", "Growth"];
const INVESTOR_TYPES = ["Angel", "VC", "Private Equity", "Family Office", "Corporate"];

const OnboardingScreen = ({ navigation }) => {
    const { user, refreshUser } = useAuth();
    const { theme, isDark } = useTheme();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        location: '',
        startupName: '',
        investorName: '',
        firmName: '',
        industry: '',
        investorType: '',
        stage: '',
        fundingRequired: '',
        checkSize: '',
        description: '',
        bio: '',
        isPublic: true,
    });

    const progress = useSharedValue(0.2);

    useEffect(() => {
        progress.value = withSpring(step / 5);
    }, [step]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));

    const handleNext = () => {
        if (step < 5) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const improveWithAi = async () => {
        const text = user?.role === 'startup' ? formData.description : formData.bio;
        if (!text || text.length < 10) return;

        setIsImproving(true);
        try {
            const response = await axios.post(`${API_URL}/ai/improve-text`, {
                text,
                type: user?.role === 'startup' ? 'startup_vision' : 'investor_thesis'
            });
            
            if (response.data.improvedText) {
                setFormData({
                    ...formData,
                    [user?.role === 'startup' ? "description" : "bio"]: response.data.improvedText
                });
            }
        } catch (err) {
            console.error("AI improvement failed", err);
        } finally {
            setIsImproving(false);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            const role = user?.role;
            const endpoint = role === 'startup' ? `${API_URL}/startup/create` : `${API_URL}/investor/create`;
            
            const payload = role === 'startup' ? {
                startupName: formData.startupName || user.name,
                industry: formData.industry || INDUSTRIES[0],
                stage: formData.stage.toLowerCase() || 'idea',
                fundingRequired: parseFloat(formData.fundingRequired) || 0,
                location: formData.location || "Remote",
                description: formData.description || "No description provided."
            } : {
                investorName: user.name,
                firmName: formData.firmName || "Independent",
                investorType: formData.investorType || "Angel",
                checkSizeMin: parseFloat(formData.checkSize) * 0.5 || 10000,
                checkSizeMax: parseFloat(formData.checkSize) * 2 || 1000000,
                preferredIndustries: [formData.industry || INDUSTRIES[0]],
                location: formData.location || "Remote",
                bio: formData.bio || "Professional Investor profile."
            };

            await axios.post(endpoint, payload);
            await refreshUser();
            // AppNavigator will handle redirection based on onboardingCompleted
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile');
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.foreground }]}>IDENTITY</Text>
                        <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>Where are you based in the world?</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.mutedForeground }]}>LOCATION</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
                                <MapPin size={20} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.foreground }]}
                                    placeholder="Ex: San Francisco, Remote"
                                    placeholderTextColor={theme.mutedForeground}
                                    value={formData.location}
                                    onChangeText={(v) => setFormData({...formData, location: v})}
                                />
                            </View>
                        </View>
                    </Animated.View>
                );
            case 2:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.foreground }]}>REPRESENTATION</Text>
                        <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>
                            {user?.role === 'startup' ? 'What is the name of your venture?' : 'Which firm do you represent?'}
                        </Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.mutedForeground }]}>
                                {user?.role === 'startup' ? 'COMPANY NAME' : 'FIRM NAME'}
                            </Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
                                {user?.role === 'startup' ? <Rocket size={20} color={theme.primary} /> : <Briefcase size={20} color={theme.primary} />}
                                <TextInput
                                    style={[styles.input, { color: theme.foreground }]}
                                    placeholder={user?.role === 'startup' ? "Ex: Tech Flow Inc" : "Ex: Vision Capital"}
                                    placeholderTextColor={theme.mutedForeground}
                                    value={user?.role === 'startup' ? formData.startupName : formData.firmName}
                                    onChangeText={(v) => setFormData({...formData, [user?.role === 'startup' ? 'startupName' : 'firmName']: v})}
                                />
                            </View>
                        </View>
                    </Animated.View>
                );
            case 3:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.foreground }]}>CORE METRICS</Text>
                        <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>Define your operational focus.</Text>
                        
                        <Text style={[styles.label, { color: theme.mutedForeground, marginBottom: 12 }]}>PRIMARY SECTOR</Text>
                        <View style={styles.chipContainer}>
                            {INDUSTRIES.map(ind => (
                                <TouchableOpacity 
                                    key={ind}
                                    onPress={() => setFormData({...formData, industry: ind})}
                                    style={[
                                        styles.chip, 
                                        { borderColor: theme.border },
                                        formData.industry === ind && { backgroundColor: theme.primary, borderColor: theme.primary }
                                    ]}
                                >
                                    <Text style={[
                                        styles.chipText, 
                                        { color: theme.mutedForeground },
                                        formData.industry === ind && { color: '#fff' }
                                    ]}>{ind}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: theme.mutedForeground, marginTop: 24, marginBottom: 12 }]}>STAGE</Text>
                        <View style={styles.chipContainer}>
                            {STAGES.map(s => (
                                <TouchableOpacity 
                                    key={s}
                                    onPress={() => setFormData({...formData, stage: s})}
                                    style={[
                                        styles.chip, 
                                        { borderColor: theme.border },
                                        formData.stage === s && { backgroundColor: theme.foreground, borderColor: theme.foreground }
                                    ]}
                                >
                                    <Text style={[
                                        styles.chipText, 
                                        { color: theme.mutedForeground },
                                        formData.stage === s && { color: theme.background }
                                    ]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                );
            case 4:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <Text style={[styles.stepTitle, { color: theme.foreground }]}>FINANCIALS</Text>
                        <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>
                            {user?.role === 'startup' ? 'How much capital are you raising?' : 'What is your typical check size?'}
                        </Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.mutedForeground }]}>AMOUNT (USD)</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.input, borderColor: theme.border }]}>
                                <DollarSign size={20} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: theme.foreground }]}
                                    placeholder="Ex: 500000"
                                    keyboardType="numeric"
                                    placeholderTextColor={theme.mutedForeground}
                                    value={user?.role === 'startup' ? formData.fundingRequired : formData.checkSize}
                                    onChangeText={(v) => setFormData({...formData, [user?.role === 'startup' ? 'fundingRequired' : 'checkSize']: v})}
                                />
                            </View>
                        </View>
                    </Animated.View>
                );
            case 5:
                return (
                    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContainer}>
                        <View style={styles.headerRow}>
                            <View>
                                <Text style={[styles.stepTitle, { color: theme.foreground }]}>THE VISION</Text>
                                <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>Tell your story to the ecosystem.</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={improveWithAi}
                                disabled={isImproving}
                                style={[styles.aiButton, { backgroundColor: theme.primary + '20' }]}
                            >
                                {isImproving ? <ActivityIndicator size="small" color={theme.primary} /> : <Sparkles size={16} color={theme.primary} />}
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.inputGroup}>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.input, color: theme.foreground, borderColor: theme.border }]}
                                placeholder={user?.role === 'startup' ? "Describe your vision..." : "Your investment thesis..."}
                                placeholderTextColor={theme.mutedForeground}
                                multiline
                                numberOfLines={6}
                                value={user?.role === 'startup' ? formData.description : formData.bio}
                                onChangeText={(v) => setFormData({...formData, [user?.role === 'startup' ? 'description' : 'bio']: v})}
                            />
                        </View>

                        <TouchableOpacity 
                            onPress={() => setFormData({...formData, isPublic: !formData.isPublic})}
                            style={[styles.toggleCard, { backgroundColor: theme.muted, borderColor: theme.border }]}
                        >
                            <View style={styles.toggleText}>
                                <Globe size={20} color={theme.primary} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={[styles.toggleTitle, { color: theme.foreground }]}>Public Visibility</Text>
                                    <Text style={[styles.toggleDesc, { color: theme.mutedForeground }]}>Allow verified users to find you</Text>
                                </View>
                            </View>
                            <View style={[styles.toggle, formData.isPublic ? { backgroundColor: theme.primary } : { backgroundColor: theme.border }]}>
                                <View style={[styles.toggleDot, formData.isPublic ? { transform: [{ translateX: 20 }] } : { transform: [{ translateX: 0 }] }]} />
                            </View>
                        </TouchableOpacity>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    </Animated.View>
                );
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressBar, { backgroundColor: theme.primary }, progressStyle]} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.stepCounter, { color: theme.mutedForeground }]}>STEP {step} OF 5</Text>
                    <Text style={[styles.percentage, { color: theme.primary }]}>{Math.round((step/5)*100)}%</Text>
                </View>
            </View>

            <KeyboardAwareScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderStepContent()}
            </KeyboardAwareScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity 
                    onPress={handleBack}
                    disabled={step === 1}
                    style={[styles.backBtn, step === 1 && { opacity: 0 }]}
                >
                    <ChevronLeft size={24} color={theme.foreground} />
                </TouchableOpacity>

                {step < 5 ? (
                    <TouchableOpacity 
                        onPress={handleNext}
                        style={[styles.nextBtn, { backgroundColor: theme.foreground }]}
                    >
                        <Text style={[styles.nextBtnText, { color: theme.background }]}>NEXT</Text>
                        <ChevronRight size={20} color={theme.background} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        onPress={handleSubmit}
                        disabled={isLoading}
                        style={[styles.nextBtn, { backgroundColor: theme.primary }]}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.nextBtnText}>COMPLETE</Text>
                                <ShieldCheck size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    stepCounter: {
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
    },
    percentage: {
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 100,
    },
    stepContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 32,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: -1,
    },
    stepSubtitle: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        marginTop: 8,
        marginBottom: 40,
        lineHeight: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 64,
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 12,
        fontFamily: 'Inter-Bold',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    aiButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textArea: {
        height: 200,
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        textAlignVertical: 'top',
    },
    toggleCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: 20,
    },
    toggleText: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleTitle: {
        fontSize: 14,
        fontFamily: 'Inter-Bold',
    },
    toggleDesc: {
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        marginTop: 2,
    },
    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
    },
    toggleDot: {
        width: 20,
        height: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        backgroundColor: 'transparent',
    },
    backBtn: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextBtn: {
        height: 56,
        paddingHorizontal: 32,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    nextBtnText: {
        fontSize: 14,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
        color: '#fff',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        fontFamily: 'Inter-Bold',
        textAlign: 'center',
        marginTop: 16,
    }
});

export default OnboardingScreen;
