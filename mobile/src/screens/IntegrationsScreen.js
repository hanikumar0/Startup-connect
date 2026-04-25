import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, Mail, Target, ExternalLink, ShieldCheck, ChevronRight, Share2 } from 'lucide-react-native';
import api from '../services/api';

const IntegrationsScreen = ({ navigation }) => {
    const [status, setStatus] = useState({
        slack: true,
        gmail: false,
        crm: true,
        hubspot: false
    });

    const integrations = [
        {
            id: 'slack',
            title: 'Slack',
            desc: 'Real-time alert notifications',
            icon: MessageSquare,
            color: '#4a154b',
            bg: '#f3ebf3',
            connected: status.slack
        },
        {
            id: 'gmail',
            title: 'Gmail / Outlook',
            desc: 'Sync emails and calendar events',
            icon: Mail,
            color: '#ea4335',
            bg: '#fef2f2',
            connected: status.gmail
        },
        {
            id: 'hubspot',
            title: 'HubSpot CRM',
            desc: 'Import and sync your pipeline',
            icon: Target,
            color: '#ff7a59',
            bg: '#fff7f5',
            connected: status.hubspot
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Integrations</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.infoBox}>
                    <ShieldCheck color="#4f46e5" size={24} />
                    <View style={styles.infoText}>
                        <Text style={styles.infoTitle}>Secure API Sync</Text>
                        <Text style={styles.infoSubtitle}>We use OAuth 2.0 to ensure your data stays encrypted and secure between platforms.</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>External Platforms</Text>
                
                {integrations.map(item => {
                    const Icon = item.icon;
                    return (
                        <View key={item.id} style={styles.card}>
                            <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                                <Icon color={item.color} size={24} />
                            </View>
                            <View style={styles.cardBody}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <Text style={styles.cardDesc}>{item.desc}</Text>
                            </View>
                            <View style={styles.cardAction}>
                                <Text style={[styles.statusText, { color: item.connected ? '#059669' : '#94a3b8' }]}>
                                    {item.connected ? 'Connected' : 'Not Linked'}
                                </Text>
                                <ChevronRight color="#cbd5e1" size={16} />
                            </View>
                        </View>
                    );
                })}

                <View style={styles.webPromo}>
                    <Text style={styles.promoTitle}>Want to connect more?</Text>
                    <Text style={styles.promoDesc}>New integrations like Salesforce, Notion, and Airtable must be configured on our web dashboard.</Text>
                    <TouchableOpacity style={styles.webBtn}>
                        <Text style={styles.webBtnText}>Open Web Dashboard</Text>
                        <ExternalLink color="#fff" size={14} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#f5f3ff',
        padding: 20,
        borderRadius: 24,
        gap: 16,
        marginBottom: 32,
    },
    infoText: {
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
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 12,
        color: '#64748b',
    },
    cardAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    webPromo: {
        marginTop: 40,
        backgroundColor: '#1e293b',
        padding: 24,
        borderRadius: 28,
        alignItems: 'center',
    },
    promoTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    promoDesc: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    webBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4f46e5',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 8,
    },
    webBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    }
});

export default IntegrationsScreen;
