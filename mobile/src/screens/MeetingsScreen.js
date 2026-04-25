import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    Calendar as CalendarIcon, 
    Plus, 
    Clock, 
    Video, 
    ChevronLeft, 
    ChevronRight,
    Zap,
    MapPin,
    Users
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../utils/constants';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width - 80;
const HOUR_HEIGHT = 80;

const MeetingsScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    useEffect(() => {
        fetchMeetings();
    }, [selectedDate]);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/meetings`);
            if (res.data.success) {
                // Filter meetings for the selected date
                const filtered = res.data.meetings.filter(m => 
                    isSameDay(new Date(m.startTime), selectedDate)
                );
                setMeetings(filtered);
            }
        } catch (err) {
            console.error('Failed to fetch meetings', err);
        } finally {
            setLoading(false);
        }
    };

    const renderTimeGrid = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        return (
            <View style={styles.gridContainer}>
                {hours.map(hour => (
                    <View key={hour} style={[styles.hourRow, { borderBottomColor: theme.border }]}>
                        <View style={styles.timeLabelContainer}>
                            <Text style={[styles.timeLabel, { color: theme.mutedForeground }]}>
                                {hour === 0 ? '12 AM' : hour > 12 ? `${hour - 12} PM` : `${hour} ${hour === 12 ? 'PM' : 'AM'}`}
                            </Text>
                        </View>
                        <View style={styles.hourSlot} />
                    </View>
                ))}

                {/* Meeting Blocks */}
                {meetings.map((meeting) => {
                    const startDate = new Date(meeting.startTime);
                    const startHour = startDate.getHours();
                    const startMinutes = startDate.getMinutes();
                    const top = (startHour * HOUR_HEIGHT) + (startMinutes / 60 * HOUR_HEIGHT);
                    
                    // Assume 1 hour duration if not specified
                    const height = HOUR_HEIGHT; 

                    return (
                        <TouchableOpacity 
                            key={meeting._id}
                            style={[
                                styles.meetingBlock, 
                                { 
                                    top, 
                                    height, 
                                    backgroundColor: theme.primary,
                                    borderColor: theme.background,
                                    borderLeftWidth: 4,
                                    borderLeftColor: theme.foreground
                                }
                            ]}
                            onPress={() => navigation.navigate('VideoCall', { roomId: meeting._id })}
                        >
                            <View style={styles.meetingInfo}>
                                <Text style={styles.meetingTitle}>{meeting.title.toUpperCase()}</Text>
                                <View style={styles.meetingMeta}>
                                    <Clock size={10} color="#ffffff80" />
                                    <Text style={styles.meetingTimeText}>
                                        {format(startDate, 'HH:mm')} - {format(new Date(startDate.getTime() + 3600000), 'HH:mm')}
                                    </Text>
                                </View>
                            </View>
                            <Video size={16} color="#fff" />
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.foreground }]}>DILIGENCE REGISTRY</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]}>Synchronize with global partners.</Text>
                </View>
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.foreground }]}>
                    <Plus size={24} color={theme.background} />
                </TouchableOpacity>
            </View>

            {/* Date Picker Strip */}
            <View style={[styles.dateStrip, { borderBottomColor: theme.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                    {weekDays.map((date, i) => {
                        const isSelected = isSameDay(date, selectedDate);
                        return (
                            <TouchableOpacity 
                                key={i} 
                                onPress={() => setSelectedDate(date)}
                                style={[
                                    styles.dateCard, 
                                    isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                                ]}
                            >
                                <Text style={[styles.dayName, { color: theme.mutedForeground }, isSelected && { color: '#fff' }]}>
                                    {format(date, 'EEE').toUpperCase()}
                                </Text>
                                <Text style={[styles.dayNum, { color: theme.foreground }, isSelected && { color: '#fff' }]}>
                                    {format(date, 'dd')}
                                </Text>
                                {isSelected && <View style={styles.activeDot} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Timeline Grid */}
            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator color={theme.primary} size="large" />
                </View>
            ) : (
                <ScrollView 
                    style={styles.timeline} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {renderTimeGrid()}
                </ScrollView>
            )}

            {/* Quick Stats Overlay */}
            <View style={[styles.overlay, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.overlayItem}>
                    <Users size={16} color={theme.primary} />
                    <Text style={[styles.overlayText, { color: theme.foreground }]}>{meetings.length} SESSIONS</Text>
                </View>
                <View style={styles.vDivider} />
                <TouchableOpacity onPress={() => navigation.navigate('VideoCall', { roomId: 'instant' })} style={styles.overlayItem}>
                    <Zap size={16} color="#f59e0b" fill="#f59e0b" />
                    <Text style={[styles.overlayText, { color: theme.foreground }]}>START INSTANT</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 14,
        fontFamily: 'Inter-Black',
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontSize: 11,
        fontFamily: 'Inter-Medium',
        marginTop: 4,
    },
    addBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateStrip: {
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    dateScroll: {
        paddingHorizontal: 24,
        gap: 12,
    },
    dateCard: {
        width: 60,
        height: 80,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayName: {
        fontSize: 9,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    dayNum: {
        fontSize: 18,
        fontFamily: 'Inter-Black',
        marginTop: 4,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff',
        marginTop: 6,
    },
    timeline: {
        flex: 1,
    },
    gridContainer: {
        paddingTop: 20,
        position: 'relative',
    },
    hourRow: {
        flexDirection: 'row',
        height: HOUR_HEIGHT,
        borderBottomWidth: 1,
    },
    timeLabelContainer: {
        width: 80,
        alignItems: 'center',
        paddingTop: -10, // Offset to center label on line
    },
    timeLabel: {
        fontSize: 10,
        fontFamily: 'Inter-Bold',
        backgroundColor: 'transparent',
    },
    hourSlot: {
        flex: 1,
    },
    meetingBlock: {
        position: 'absolute',
        left: 80,
        right: 16,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    meetingInfo: {
        flex: 1,
    },
    meetingTitle: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Inter-Black',
        letterSpacing: 0.5,
    },
    meetingMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    meetingTimeText: {
        color: '#ffffff80',
        fontSize: 10,
        fontFamily: 'Inter-Bold',
    },
    overlay: {
        position: 'absolute',
        bottom: 32,
        left: 24,
        right: 24,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    overlayItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    overlayText: {
        fontSize: 10,
        fontFamily: 'Inter-Black',
        letterSpacing: 1,
    },
    vDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#e2e8f0',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default MeetingsScreen;
