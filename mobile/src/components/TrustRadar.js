import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Polyline, Circle, Line, G } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export const TrustRadar = ({ scores }) => {
    const { theme, isDark } = useTheme();
    const size = 200;
    const center = size / 2;
    const radius = size * 0.4;

    const categories = [
        { key: 'identity', label: 'ID' },
        { key: 'financials', label: 'FIN' },
        { key: 'team', label: 'TEAM' },
        { key: 'legal', label: 'LEGAL' },
        { key: 'traction', label: 'TRAC' }
    ];

    const getPoint = (index, value) => {
        const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
        const r = (radius * value) / 100;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    const points = categories.map((cat, i) => getPoint(i, scores[cat.key] || 0));
    const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

    const average = Object.values(scores).reduce((a, b) => a + b, 0) / categories.length;
    const isElite = average >= 85;

    return (
        <View style={styles.container}>
            <Svg height={size} width={size}>
                {/* Background Grids */}
                {[25, 50, 75, 100].map((level) => {
                    const gridPoints = categories.map((_, i) => getPoint(i, level));
                    const gridString = gridPoints.map(p => `${p.x},${p.y}`).join(' ');
                    return (
                        <Polygon
                            key={level}
                            points={gridString}
                            fill="none"
                            stroke={isDark ? '#334155' : '#e2e8f0'}
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Axis Lines */}
                {categories.map((_, i) => {
                    const p = getPoint(i, 100);
                    return (
                        <Line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={p.x}
                            y2={p.y}
                            stroke={isDark ? '#334155' : '#e2e8f0'}
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Score Area */}
                <Polygon
                    points={pointsString}
                    fill={isElite ? '#fbbf24' : theme.primary}
                    fillOpacity={0.4}
                    stroke={isElite ? '#d97706' : theme.primary}
                    strokeWidth="2"
                />

                {/* Labels */}
                {categories.map((cat, i) => {
                    const p = getPoint(i, 120);
                    return (
                        <G key={i}>
                            <Circle cx={getPoint(i, scores[cat.key]).x} cy={getPoint(i, scores[cat.key]).y} r="3" fill={theme.primary} />
                        </G>
                    );
                })}
            </Svg>
            
            <View style={styles.labelContainer}>
                {categories.map((cat, i) => (
                    <Text key={i} style={[styles.axisLabel, { color: theme.mutedForeground }]}>
                        {cat.label}
                    </Text>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    labelContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        marginTop: -10,
    },
    axisLabel: {
        fontSize: 8,
        fontWeight: '900',
        fontFamily: 'Inter-Black',
    }
});
