import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { ShieldCheck, History, TrendingUp, AlertTriangle, ExternalLink, ChevronLeft, Award } from 'lucide-react-native';
import { API_URL } from '../utils/constants';

const AuditDetailScreen = ({ route, navigation }) => {
    const { entityName, entityType, founderName } = route.params;
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAudit = async () => {
        try {
            const response = await axios.post(`${API_URL}/verify/deep-audit`, {
                entityName,
                entityType,
                founderName
            });
            if (response.data.success) {
                setReport(response.data.data);
            }
        } catch (error) {
            console.error('Audit Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAudit();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>AI performing deep history audit...</Text>
                <Text style={styles.subLoadingText}>Checking external funding records, past ventures, and reputation.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transparency Report</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Score Section */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.scoreValue}>{report.trustScore}</Text>
                        <Text style={styles.scoreLabel}>Trust Score</Text>
                    </View>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.entityName}>{entityName}</Text>
                        <View style={styles.badgeRow}>
                            <View style={[styles.riskBadge, { backgroundColor: report.riskAssessment === 'Low' ? '#dcfce7' : '#fee2e2' }]}>
                                <Text style={[styles.riskText, { color: report.riskAssessment === 'Low' ? '#166534' : '#991b1b' }]}>
                                    {report.riskAssessment} Risk
                                </Text>
                            </View>
                            <ShieldCheck size={16} color="#4f46e5" />
                        </View>
                    </View>
                </View>

                {/* AI Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Award size={20} color="#4f46e5" />
                        <Text style={styles.sectionTitle}>Strategic Summary</Text>
                    </View>
                    <Text style={styles.summaryText}>{report.summary}</Text>
                </View>

                {/* Funding History */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <TrendingUp size={20} color="#059669" />
                        <Text style={styles.sectionTitle}>External Funding History</Text>
                    </View>
                    {report.pastFunding.map((item, index) => (
                        <View key={index} style={styles.historyItem}>
                            <View style={styles.historyDot} />
                            <View style={styles.historyInfo}>
                                <Text style={styles.historyYear}>{item.year} - {item.round}</Text>
                                <Text style={styles.historyAmount}>{item.amount}</Text>
                                <Text style={styles.historySource}>via {item.source}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Founder Track Record */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <History size={20} color="#b45309" />
                        <Text style={styles.sectionTitle}>Track Record</Text>
                    </View>
                    {report.founderTrackRecord.map((item, index) => (
                        <View key={index} style={styles.recordItem}>
                            <View style={styles.recordIcon}>
                                <Award size={14} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.recordName}>{item.company}</Text>
                                <Text style={styles.recordRole}>{item.role}</Text>
                            </View>
                            <Text style={styles.recordOutcome}>{item.outcome}</Text>
                        </View>
                    ))}
                </View>

                {/* Risks */}
                <View style={[styles.section, styles.riskSection]}>
                    <View style={styles.sectionHeader}>
                        <AlertTriangle size={20} color="#dc2626" />
                        <Text style={styles.sectionTitle}>Risk Assessment</Text>
                    </View>
                    <Text style={styles.riskNoteText}>{report.riskNotes}</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
    },
    subLoadingText: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    scoreCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#4f46e5',
    },
    scoreLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    scoreInfo: {
        marginLeft: 20,
        flex: 1,
    },
    entityName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    riskBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    riskText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    summaryText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#334155',
    },
    historyItem: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    historyDot: {
        width: 4,
        backgroundColor: '#059669',
        borderRadius: 2,
        marginVertical: 4,
    },
    historyYear: {
        fontSize: 13,
        fontWeight: '800',
        color: '#059669',
    },
    historyAmount: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0f172a',
        marginTop: 2,
    },
    historySource: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    recordItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    recordIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#b45309',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    recordName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    recordRole: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    recordOutcome: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#059669',
    },
    riskSection: {
        borderColor: '#fee2e2',
        backgroundColor: '#fffafb',
    },
    riskNoteText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#991b1b',
    }
});

export default AuditDetailScreen;
