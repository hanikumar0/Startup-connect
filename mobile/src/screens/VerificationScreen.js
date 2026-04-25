import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Clock, CheckCircle, XCircle, FileText, ChevronRight, Star, Sparkles, AlertCircle } from 'lucide-react-native';
import api from '../services/api';
import { BadgeDisplay } from '../components/BadgeDisplay';

const VerificationScreen = ({ navigation }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        linkedinUrl: '',
        websiteUrl: '',
        gstNumber: '',
        additionalNotes: ''
    });

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const res = await api.get('/badges/status');
            if (res.data.success) {
                setStatus(res.data);
                // Pre-fill form if rejected
                if (res.data.latestRequest) {
                    setForm({
                        linkedinUrl: res.data.latestRequest.linkedinUrl || '',
                        websiteUrl: res.data.latestRequest.websiteUrl || '',
                        gstNumber: res.data.latestRequest.gstNumber || '',
                        additionalNotes: res.data.latestRequest.additionalNotes || ''
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load status', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.linkedinUrl && !form.websiteUrl) {
            Alert.alert('Missing Info', 'Please provide at least a LinkedIn or Website URL.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/badges/request', form);
            if (res.data.success) {
                Alert.alert('Submitted', 'Your request is now under review.');
                loadStatus();
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    const verStatus = status?.verificationStatus || 'unverified';
    const isVerified = verStatus === 'verified';
    const isPending = verStatus === 'pending';
    const trustScore = status?.trustScore || 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trust & Badges</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={[styles.statusIcon, { backgroundColor: isVerified ? '#ecfdf5' : isPending ? '#fffbeb' : '#f1f5f9' }]}>
                            <ShieldCheck color={isVerified ? '#059669' : isPending ? '#d97706' : '#64748b'} size={24} />
                        </View>
                        <View style={styles.statusTextContainer}>
                            <Text style={styles.statusLabel}>Verification Status</Text>
                            <Text style={[styles.statusValue, { color: isVerified ? '#059669' : isPending ? '#d97706' : '#64748b' }]}>
                                {verStatus.charAt(0).toUpperCase() + verStatus.slice(1)}
                            </Text>
                        </View>
                        <View style={styles.scoreBox}>
                            <Text style={styles.scoreLabel}>Trust Score</Text>
                            <Text style={styles.scoreValue}>{trustScore}/100</Text>
                        </View>
                    </View>

                    <View style={styles.progressTrack}>
                        <View style={[styles.progressBar, { width: `${trustScore}%` }]} />
                    </View>

                    {status?.badges?.length > 0 && (
                        <View style={styles.badgesSection}>
                            <Text style={styles.sectionLabel}>Active Badges</Text>
                            <BadgeDisplay badges={status.badges} size="md" />
                        </View>
                    )}
                </View>

                {verStatus === 'unverified' || verStatus === 'rejected' ? (
                    <View style={styles.formSection}>
                        <Text style={styles.formTitle}>Submit Verification</Text>
                        <Text style={styles.formSubtitle}>Provide details to earn badges and increase trust.</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>LinkedIn URL</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="https://linkedin.com/in/..."
                                value={form.linkedinUrl}
                                onChangeText={t => setForm({...form, linkedinUrl: t})}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Website URL</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="https://..."
                                value={form.websiteUrl}
                                onChangeText={t => setForm({...form, websiteUrl: t})}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Company Registration (Optional)</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="GST, CIN or PAN"
                                value={form.gstNumber}
                                onChangeText={t => setForm({...form, gstNumber: t})}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Notes</Text>
                            <TextInput 
                                style={[styles.input, styles.textArea]}
                                placeholder="Press links, traction updates, etc."
                                multiline
                                numberOfLines={4}
                                value={form.additionalNotes}
                                onChangeText={t => setForm({...form, additionalNotes: t})}
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.submitBtn}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit for Review</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.infoBox}>
                        <Clock color="#4f46e5" size={20} />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>Verification {isVerified ? 'Active' : 'Pending'}</Text>
                            <Text style={styles.infoSubtitle}>
                                {isVerified 
                                    ? "You're a trusted member of Startup Connect. Keep your profile updated to maintain your score."
                                    : "We are currently reviewing your documents. You'll receive a push notification once approved."}
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
    },
    backText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    scoreBox: {
        alignItems: 'flex-end',
    },
    scoreLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    scoreValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#f1f5f9',
        borderRadius: 3,
        marginBottom: 20,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4f46e5',
        borderRadius: 3,
    },
    badgesSection: {
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
        paddingTop: 16,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    formSection: {
        marginBottom: 40,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 4,
    },
    formSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#1e293b',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#4f46e5',
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#f5f3ff',
        padding: 20,
        borderRadius: 20,
        gap: 16,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#4f46e5',
        marginBottom: 4,
    },
    infoSubtitle: {
        fontSize: 13,
        color: '#7c3aed',
        lineHeight: 18,
    }
});

export default VerificationScreen;
