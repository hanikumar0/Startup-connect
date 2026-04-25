import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image } from 'react-native';
import { User, ShieldCheck, CreditCard, Bell, Settings, LogOut, ChevronRight, Rocket, Wallet, TrendingUp } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useContext(AuthContext);

    const ProfileItem = ({ icon: Icon, title, subtitle, onPress, color = "#1e293b" }: any) => (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
                <Icon size={20} color={color} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{title}</Text>
                {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                         <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
                         </View>
                         <View style={styles.roleBadge}>
                            {user?.role === 'startup' ? <Rocket size={12} color="#fff" /> : <Wallet size={12} color="#fff" />}
                         </View>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={styles.planBadge}>
                             <Text style={styles.planText}>PRO MEMBER</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statsBar}>
                    {[
                        { label: 'MATCHES', value: '14' },
                        { label: 'MEETINGS', value: '08' },
                        { label: 'UNLOCKS', value: '32' },
                    ].map((s, i) => (
                        <View key={i} style={styles.statItem}>
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>PLATFORM GOVERNANCE</Text>
                <ProfileItem 
                    icon={User} 
                    title="Identity Management" 
                    subtitle="Edit startup profile & assets" 
                    color="#4f46e5"
                />
                <ProfileItem 
                    icon={ShieldCheck} 
                    title="Security & Auth" 
                    subtitle="PIN, FaceID & PGP Keys" 
                    color="#10b981"
                />
                <ProfileItem 
                    icon={CreditCard} 
                    title="Institutional Billing" 
                    subtitle="Manage Pro subscriptions" 
                    color="#f59e0b"
                />
                <ProfileItem 
                    icon={Bell} 
                    title="Notification Relay" 
                    subtitle="Push & Email frequencies" 
                    color="#6366f1"
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>STRATEGIC ASSETS</Text>
                <ProfileItem 
                    icon={TrendingUp} 
                    title="Ecosystem Analytics" 
                    subtitle="Quarterly performance audit" 
                />
                <ProfileItem 
                    icon={Settings} 
                    title="Protocol Settings" 
                />
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <LogOut size={20} color="#ef4444" />
                <Text style={styles.logoutText}>TERMINATE SESSION</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.versionText}>STARTUP CONNECT MOBILE [v1.0.strategic]</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { backgroundColor: '#fff', padding: 25, paddingTop: 60, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 20 },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 80, height: 80, borderRadius: 32, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
    roleBadge: { position: 'absolute', bottom: -5, right: -5, width: 30, height: 30, borderRadius: 12, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
    userInfo: { marginLeft: 25 },
    userName: { fontSize: 24, fontWeight: '900', color: '#1e293b', fontStyle: 'italic', letterSpacing: -0.5 },
    userEmail: { fontSize: 13, fontWeight: '600', color: '#94a3b8', fontStyle: 'italic', marginTop: 4 },
    planBadge: { backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 12 },
    planText: { fontSize: 8, fontWeight: '900', color: '#2563eb', letterSpacing: 1.5 },
    statsBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 15 },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '900', color: '#1e293b', fontStyle: 'italic' },
    statLabel: { fontSize: 8, fontWeight: '900', color: '#94a3b8', letterSpacing: 1.5, marginTop: 4 },
    section: { padding: 25, marginTop: 15 },
    sectionTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2, marginBottom: 20 },
    item: { backgroundColor: '#fff', padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
    iconContainer: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    itemInfo: { flex: 1, marginLeft: 15 },
    itemTitle: { fontSize: 14, fontWeight: '800', color: '#1e293b', letterSpacing: -0.3 },
    itemSubtitle: { fontSize: 11, fontWeight: '600', color: '#94a3b8', fontStyle: 'italic', marginTop: 2 },
    logoutBtn: { margin: 25, height: 65, borderRadius: 24, backgroundColor: '#fee2e2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 0 },
    logoutText: { fontSize: 10, fontWeight: '900', color: '#ef4444', letterSpacing: 2 },
    footer: { padding: 40, alignItems: 'center', marginBottom: 50 },
    versionText: { fontSize: 8, fontWeight: '800', color: '#cbd5e1', letterSpacing: 1 }
});
