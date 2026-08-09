import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, CardContent } from '@/components/native/card';
import { nativeTheme } from '@/lib/native-theme';
import { useColors } from '@/hooks/use-colors';
import { ScreenHeader, ScreenShell } from '@/components/path-ui';

const SETTINGS = [
  { icon: 'bell' as const, title: 'Reminders', detail: 'Coming soon', disabled: true },
  { icon: 'moon' as const, title: 'Appearance', detail: 'Follows your device', disabled: false },
  { icon: 'info' as const, title: 'About Jack Of All', detail: 'A practical path to a well-rounded life', disabled: false },
];

export default function SettingsRoute() {
  const colors = useColors();

  return (
    <ScreenShell>
      <View style={styles.pagePadding}>
        <ScreenHeader
          eyebrow="SETTINGS"
          title="Make it yours."
          subtitle="Simple controls for a practice that fits your life."
          icon="sliders"
          color={colors.primary}
        />

        <Card style={{ backgroundColor: colors.card }}>
          <CardContent style={styles.settingsList}>
            {SETTINGS.map((setting) => (
              <Pressable
                key={setting.title}
                disabled={setting.disabled}
                style={({ pressed }) => [
                  styles.settingRow,
                  { borderBottomColor: colors.border, opacity: setting.disabled ? 0.48 : pressed ? 0.68 : 1 },
                ]}
              >
                <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
                  <Feather name={setting.icon} size={17} color={colors.foreground} />
                </View>
                <View style={styles.settingCopy}>
                  <Text style={[styles.settingTitle, { color: colors.foreground }]}>{setting.title}</Text>
                  <Text style={[styles.settingDetail, { color: colors.mutedForeground }]}>{setting.detail}</Text>
                </View>
                <Feather name={setting.disabled ? 'clock' : 'chevron-right'} size={17} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </CardContent>
        </Card>

        <View style={[styles.localCard, { backgroundColor: colors.sidebar }]}>
          <View style={[styles.localIcon, { backgroundColor: colors.primary }]}>
            <Feather name="smartphone" size={19} color={colors.primaryForeground} />
          </View>
          <View style={styles.localCopy}>
            <Text style={[styles.localTitle, { color: colors.sidebarForeground }]}>Your progress stays on this device.</Text>
            <Text style={[styles.localDetail, { color: colors.sidebarForeground }]}>
              Jack Of All is local-first for now. No account or connection is needed to keep your practice.
            </Text>
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pagePadding: { paddingHorizontal: nativeTheme.spacing.lg, paddingBottom: 48 },
  settingsList: { paddingVertical: 4 },
  settingRow: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: nativeTheme.spacing.md, borderBottomWidth: 1 },
  settingIcon: { width: 34, height: 34, borderRadius: nativeTheme.radius.md, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, gap: 3 },
  settingTitle: { fontFamily: nativeTheme.typography.sans.semibold, fontSize: 14 },
  settingDetail: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 12 },
  localCard: { flexDirection: 'row', alignItems: 'flex-start', gap: nativeTheme.spacing.md, marginTop: nativeTheme.spacing.xl, padding: nativeTheme.spacing.lg, borderRadius: nativeTheme.radius.lg },
  localIcon: { width: 40, height: 40, borderRadius: nativeTheme.radius.md, alignItems: 'center', justifyContent: 'center' },
  localCopy: { flex: 1, gap: 6 },
  localTitle: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 14 },
  localDetail: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 12, lineHeight: 18, opacity: 0.7 },
});