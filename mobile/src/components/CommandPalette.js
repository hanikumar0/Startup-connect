import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    Dimensions,
    FlatList,
    Platform
} from 'react-native';
import Animated, { 
    FadeIn, 
    FadeOut, 
    SlideInUp, 
    SlideOutUp,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Search, Rocket, User, Target, Zap, X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { height, width } = Dimensions.get('window');

const COMMANDS = [
    { id: '1', title: 'LAUNCH VDR', subtitle: 'Access secure document vault', icon: Rocket, screen: 'VDR' },
    { id: '2', title: 'ALPHA COACH', subtitle: 'Chat with AI funding assistant', icon: Zap, screen: 'AICoach' },
    { id: '3', title: 'VIEW PIPELINE', subtitle: 'Check deal flow status', icon: Target, screen: 'MainTabs', params: { screen: 'CRM' } },
    { id: '4', title: 'MEMBER NETWORK', subtitle: 'Search verified community', icon: User, screen: 'Network' },
    { id: '5', title: 'TOGGLE THEME', subtitle: 'Switch between light/dark mode', icon: ShieldCheck, action: 'THEME' },
];

export const CommandPalette = ({ visible, onClose }) => {
    const { theme, isDark, toggleTheme } = useTheme();
    const navigation = useNavigation();
    const [search, setSearch] = useState('');

    if (!visible) return null;

    const handleSelect = (item) => {
        if (item.action === 'THEME') {
            toggleTheme();
        } else {
            navigation.navigate(item.screen, item.params);
        }
        onClose();
    };


    const renderItem = ({ item }) => {
        const Icon = item.icon;
        return (
            <TouchableOpacity 
                style={[styles.item, { borderBottomColor: theme.border }]}
                onPress={() => handleSelect(item)}
            >

                <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                    <Icon size={18} color={theme.primary} />
                </View>
                <View style={styles.itemContent}>
                    <Text style={[styles.itemTitle, { color: theme.foreground }]}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: theme.mutedForeground }]}>{item.subtitle}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut} 
            style={styles.overlay}
        >
            <TouchableOpacity 
                style={styles.backdrop} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <BlurView 
                    intensity={40} 
                    tint={isDark ? "dark" : "light"} 
                    style={StyleSheet.absoluteFill} 
                />
            </TouchableOpacity>

            <Animated.View 
                entering={SlideInUp.springify().damping(15)} 
                exiting={SlideOutUp}
                style={[styles.modal, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
                <View style={[styles.searchRow, { borderBottomColor: theme.border }]}>
                    <Search size={20} color={theme.mutedForeground} />
                    <TextInput
                        style={[styles.input, { color: theme.foreground }]}
                        placeholder="Search commands..."
                        placeholderTextColor={theme.mutedForeground}
                        autoFocus={true}
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity onPress={onClose}>
                        <X size={20} color={theme.mutedForeground} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={COMMANDS.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={() => (
                        <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>COMMANDS</Text>
                    )}
                />
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        justifyContent: 'flex-start',
        paddingTop: Platform.OS === 'ios' ? 100 : 60,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modal: {
        width: width * 0.9,
        alignSelf: 'center',
        borderRadius: 20,
        borderWidth: 1,
        maxHeight: height * 0.6,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 60,
        borderBottomWidth: 1,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter-Medium',
    },
    list: {
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
        letterSpacing: 1.5,
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        gap: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 13,
        fontWeight: '800',
        fontFamily: 'Inter-Bold',
        letterSpacing: 0.5,
    },
    itemSubtitle: {
        fontSize: 11,
        fontWeight: '500',
        fontFamily: 'Inter-Regular',
        marginTop: 2,
    }
});
