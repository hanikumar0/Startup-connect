import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, ChevronLeft, Lock, Calendar, MessageCircle, Info, ShieldCheck, FileDown, ExternalLink } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const VDRRoomScreen = ({ route, navigation }) => {
    const { theme, isDark } = useTheme();
    const { roomId, title } = route.params;
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await api.get(`/vdr/documents/${roomId}`);
            if (res.data.success) {
                setFiles(res.data.files || []);
            }
        } catch (error) {
            console.error('Fetch Files Error', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileIconColor = (type) => {
        if (type?.includes('pdf')) return '#ef4444';
        if (type?.includes('sheet') || type?.includes('excel')) return '#10b981';
        if (type?.includes('presentation')) return '#f59e0b';
        return theme.primary;
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.muted }]}>
                    <ChevronLeft color={theme.foreground} size={20} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]} numberOfLines={1}>{title.toUpperCase()}</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]}>SECURE REPOSITORY</Text>
                </View>
                <TouchableOpacity style={[styles.infoBtn, { backgroundColor: theme.muted }]}>
                    <Info color={theme.foreground} size={18} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeIn} style={[styles.securityBanner, { backgroundColor: '#10b98110' }]}>
                    <ShieldCheck color="#10b981" size={14} />
                    <Text style={styles.securityText}>AES-256 END-TO-END ENCRYPTION ACTIVE</Text>
                </Animated.View>

                <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>ASSETS ({files.length})</Text>

                {files.length > 0 ? (
                    files.map((file, i) => (
                        <Animated.View key={file._id} entering={FadeInDown.delay(i * 100)}>
                            <TouchableOpacity 
                                style={[styles.fileCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={() => file.url && Linking.openURL(file.url)}
                            >
                                <View style={[styles.fileIcon, { backgroundColor: getFileIconColor(file.type) + '15' }]}>
                                    <FileText color={getFileIconColor(file.type)} size={24} />
                                </View>
                                <View style={styles.fileInfo}>
                                    <Text style={[styles.fileName, { color: theme.foreground }]} numberOfLines={1}>{file.originalName.toUpperCase() || 'UNTITLED ASSET'}</Text>
                                    <View style={styles.fileMeta}>
                                        <Text style={[styles.metaText, { color: theme.mutedForeground }]}>{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                                        <View style={[styles.metaDot, { backgroundColor: theme.border }]} />
                                        <Text style={[styles.metaText, { color: theme.mutedForeground }]}>{new Date(file.createdAt).toLocaleDateString().toUpperCase()}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: theme.muted }]} onPress={() => file.url && Linking.openURL(file.url)}>
                                    <FileDown color={theme.foreground} size={18} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </Animated.View>
                    ))
                ) : (
                    <Animated.View entering={FadeIn} style={styles.emptyState}>
                        <View style={[styles.emptyIconBox, { backgroundColor: theme.muted }]}>
                            <FileText color={theme.mutedForeground} size={48} strokeWidth={1} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.foreground }]}>VAULT EMPTY</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.mutedForeground }]}>No documents have been synchronized to this room yet.</Text>
                    </Animated.View>
                )}

                <Animated.View entering={FadeInDown.delay(400)} style={[styles.helpBox, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '20' }]}>
                    <MessageCircle color={theme.primary} size={20} />
                    <View style={styles.helpTextContent}>
                        <Text style={[styles.helpTitle, { color: theme.primary }]}>DUE DILIGENCE ASSISTANCE</Text>
                        <Text style={[styles.helpSubtitle, { color: isDark ? '#a5b4fc' : '#4338ca' }]}>Message the custodian directly for clarification or additional documentation access.</Text>
                    </View>
                </Animated.View>
                
                <View style={{ height: 40 }} />
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, gap: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerTitleContainer: { flex: 1 },
    headerTitle: { fontSize: 15, fontFamily: 'Inter-Black', letterSpacing: -0.2 },
    headerSubtitle: { fontSize: 8, fontFamily: 'Inter-Black', letterSpacing: 1.5, marginTop: 2 },
    infoBtn: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1, padding: 24 },
    securityBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 8, marginBottom: 32 },
    securityText: { fontSize: 8, fontFamily: 'Inter-Black', color: '#059669', letterSpacing: 1 },
    sectionTitle: { fontSize: 10, fontFamily: 'Inter-Black', letterSpacing: 2, marginBottom: 16 },
    fileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1 },
    fileIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    fileInfo: { flex: 1 },
    fileName: { fontSize: 13, fontFamily: 'Inter-Black', marginBottom: 4 },
    fileMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 9, fontFamily: 'Inter-Bold' },
    metaDot: { width: 3, height: 3, borderRadius: 1.5 },
    downloadBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyIconBox: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    emptyTitle: { fontSize: 14, fontFamily: 'Inter-Black', letterSpacing: 1 },
    emptySubtitle: { fontSize: 12, fontFamily: 'Inter-Medium', textAlign: 'center', marginTop: 8 },
    helpBox: { flexDirection: 'row', padding: 24, borderRadius: 28, marginTop: 40, gap: 16, borderWidth: 1 },
    helpTextContent: { flex: 1 },
    helpTitle: { fontSize: 12, fontFamily: 'Inter-Black', marginBottom: 6 },
    helpSubtitle: { fontSize: 11, fontFamily: 'Inter-Medium', lineHeight: 16 }
});

export default VDRRoomScreen;
