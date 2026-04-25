import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  ShieldCheck, Building2, TrendingUp, Zap, User, Star,
  Activity, Clock, Award, Crown, GraduationCap, BrainCircuit, Network
} from 'lucide-react-native';

const BADGE_META = {
  verified_startup:   { label: "Verified", color: "#4f46e5", bg: "#eef2ff", icon: ShieldCheck },
  registered_company: { label: "Registered", color: "#2563eb", bg: "#eff6ff", icon: Building2 },
  raising_now:        { label: "Raising", color: "#059669", bg: "#ecfdf5", icon: TrendingUp },
  high_traction:      { label: "High Traction", color: "#d97706", bg: "#fffbeb", icon: Zap },
  active_founder:     { label: "Active", color: "#7c3aed", bg: "#f5f3ff", icon: User },
  top_rated_startup:  { label: "Top Rated", color: "#ea580c", bg: "#fff7ed", icon: Star },
  verified_investor:  { label: "Verified", color: "#4f46e5", bg: "#eef2ff", icon: ShieldCheck },
  active_investor:    { label: "Active", color: "#059669", bg: "#ecfdf5", icon: Activity },
  recent_investor:    { label: "Recent", color: "#2563eb", bg: "#eff6ff", icon: Clock },
  trusted_vc:         { label: "Trusted VC", color: "#7c3aed", bg: "#f5f3ff", icon: Award },
  fast_responder:     { label: "Fast", color: "#16a34a", bg: "#f0fdf4", icon: Zap },
  premium_investor:   { label: "Premium", color: "#d97706", bg: "#fffbeb", icon: Crown },
  trusted_mentor:     { label: "Mentor", color: "#9333ea", bg: "#faf5ff", icon: GraduationCap },
  expert_advisor:     { label: "Expert", color: "#4f46e5", bg: "#eef2ff", icon: BrainCircuit },
  top_connector:      { label: "Connector", color: "#2563eb", bg: "#eff6ff", icon: Network },
};

export const BadgeDisplay = ({ badges = [], size = 'sm', max = 3 }) => {
  if (!badges || badges.length === 0) return null;

  const visible = badges.slice(0, max);
  const overflow = badges.length - max;

  const iconSize = size === 'xs' ? 10 : size === 'sm' ? 12 : 14;
  const fontSize = size === 'xs' ? 9 : size === 'sm' ? 10 : 12;

  return (
    <View style={styles.container}>
      {visible.map((badge) => {
        const meta = BADGE_META[badge];
        if (!meta) return null;
        const Icon = meta.icon;

        return (
          <View key={badge} style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Icon color={meta.color} size={iconSize} />
            <Text style={[styles.label, { color: meta.color, fontSize }]}>
              {meta.label}
            </Text>
          </View>
        );
      })}
      {overflow > 0 && (
        <View style={[styles.badge, styles.overflowBadge]}>
          <Text style={[styles.label, styles.overflowLabel, { fontSize }]}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  label: {
    fontWeight: '700',
  },
  overflowBadge: {
    backgroundColor: '#f1f5f9',
  },
  overflowLabel: {
    color: '#64748b',
  }
});
