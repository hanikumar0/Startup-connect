import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    ShieldCheck
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const VideoCallScreen = ({ route, navigation }) => {
    const { roomId } = route.params || { roomId: 'room-abc-123' };
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const endCall = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <View style={styles.remoteVideoContainer}>
                <View style={styles.remoteAvatar}>
                    <Text style={styles.avatarText}>JI</Text>
                </View>
                <Text style={styles.remoteName}>Jane Investor (Verified)</Text>
            </View>

            <View style={[styles.localVideoContainer, !isVideoOn ? styles.hiddenVideo : {}]}>
                {!isVideoOn && (
                    <View style={styles.localAvatar}>
                        <Text style={styles.localAvatarText}>JD</Text>
                    </View>
                )}
                <View style={styles.placeholderVideo} />
                <Text style={styles.localName}>You</Text>
            </View>

            <View style={styles.header}>
                <View style={styles.securityBadge}>
                    <ShieldCheck color="#10b981" size={14} />
                    <Text style={styles.securityText}>AES-256 Encrypted</Text>
                </View>
                <Text style={styles.roomText}>{roomId}</Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, !isMicOn ? styles.controlButtonOff : {}]}
                    onPress={() => setIsMicOn(!isMicOn)}
                >
                    {isMicOn ? <Mic color="#fff" size={24} /> : <MicOff color="#fff" size={24} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, !isVideoOn ? styles.controlButtonOff : {}]}
                    onPress={() => setIsVideoOn(!isVideoOn)}
                >
                    {isVideoOn ? <Video color="#fff" size={24} /> : <VideoOff color="#fff" size={24} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.endCallButton]}
                    onPress={endCall}
                >
                    <PhoneOff color="#fff" size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    remoteVideoContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    remoteAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#374151',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    remoteName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    localVideoContainer: {
        position: 'absolute',
        bottom: 120,
        right: 20,
        width: 120,
        height: 180,
        borderRadius: 12,
        backgroundColor: '#1f2937',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#4f46e5',
    },
    placeholderVideo: {
        flex: 1,
        backgroundColor: '#111827',
    },
    localAvatar: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        backgroundColor: '#1f2937',
    },
    localAvatarText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    localName: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    header: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16,185,129,0.3)',
    },
    securityText: {
        color: '#10b981',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    roomText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 8,
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlButtonOff: {
        backgroundColor: '#ef4444',
    },
    endCallButton: {
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    hiddenVideo: {
        opacity: 0,
    }
});

export default VideoCallScreen;
