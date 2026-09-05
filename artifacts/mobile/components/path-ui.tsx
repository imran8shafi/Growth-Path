import { Feather } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInLeft, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdaptiveInsight } from '@/components/adaptive-insight';
import { DailyRing } from '@/components/progress-visuals';
import { nativeTheme } from '@/lib/native-theme';
import type { Book, TrackKey, TraitKey } from '@/context/progress';
import { getBookReason, getRecommendedBooks, getTodayTasks, useProgress } from '@/context/progress';

type IconName = keyof typeof Feather.glyphMap;

const INCLUDED_GUIDES: Record<TrackKey, number> = {
  mind: require('../assets/books/growth-path-mind-field-guide.pdf'),
  body: require('../assets/books/growth-path-body-field-guide.pdf'),
  soul: require('../assets/books/growth-path-soul-field-guide.pdf'),
  freedom: require('../assets/books/growth-path-freedom-field-guide.pdf'),
};

async function openIncludedGuide(track: TrackKey) {
  const asset = Asset.fromModule(INCLUDED_GUIDES[track]);

  try {
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    if (Platform.OS === 'web') {
      await WebBrowser.openBrowserAsync(asset.uri);
      return;
    }
    await Linking.openURL(uri);
  } catch {
    try {
      await WebBrowser.openBrowserAsync(asset.uri);
    } catch {
      Alert.alert('Could not open the guide', 'The PDF is included with Growth Path, but this device does not have an available PDF viewer.');
    }
  }
}

export type TrackConfig = {
  key: TrackKey; label: string; title: string; description: string; benefit: string;
  icon: IconName; color: string; glow: string;
  resource: { eyebrow: string; title: string; detail: string; icon: IconName };
};

export const TRACKS: Record<TrackKey, TrackConfig> = {
  mind: { key: 'mind', label: 'Mind', title: 'Defend the last fortress.', description: 'Build focus, disciplined thought, and resistance to distraction and manipulation.', benefit: 'What governs your attention eventually governs your life.', icon: 'book-open', color: '#55D6FF', glow: 'rgba(85,214,255,0.22)', resource: { eyebrow: 'FORTRESS PRINCIPLE', title: 'Attention is a vote.', detail: 'What you repeatedly return to becomes the shape of your mind.', icon: 'crosshair' } },
  body: { key: 'body', label: 'Body', title: 'Build physical capability.', description: 'Train strength, energy, movement, and recovery—not appearance alone.', benefit: 'A capable body expands what the rest of your life can ask of you.', icon: 'activity', color: '#4CD6B0', glow: 'rgba(76,214,176,0.22)', resource: { eyebrow: 'CAPACITY PRINCIPLE', title: 'Energy must be built.', detail: 'Movement, recovery, and repetition create a body you can rely on.', icon: 'sunrise' } },
  soul: { key: 'soul', label: 'Soul', title: 'Strengthen conviction.', description: 'Examine what you believe, live it deliberately, and return to meaning.', benefit: 'Conviction keeps achievement from becoming directionless.', icon: 'sun', color: '#FFCC66', glow: 'rgba(255,204,102,0.22)', resource: { eyebrow: 'CONVICTION QUESTION', title: 'What deserves my devotion?', detail: 'Carry the answer into your choices, work, and relationships.', icon: 'heart' } },
  freedom: { key: 'freedom', label: 'Freedom', title: 'Create the power to choose.', description: 'Build financial strength, portable skills, systems, and real mobility.', benefit: 'Freedom is having options that do not depend on permission.', icon: 'key', color: '#8D7CFF', glow: 'rgba(141,124,255,0.22)', resource: { eyebrow: 'AUTONOMY PRINCIPLE', title: 'Own the engine.', detail: 'Build skills and assets that keep working after today ends.', icon: 'compass' } },
};

export function ScreenShell({ children, scroll = true, contentStyle }: { children: React.ReactNode; scroll?: boolean; contentStyle?: ViewStyle }) {
  const insets = useSafeAreaInsets();
  const drift = useSharedValue(0);
  useEffect(() => { drift.value = withRepeat(withSequence(withTiming(1, { duration: 5200 }), withTiming(0, { duration: 5200 })), -1); }, [drift]);
  const orb = useAnimatedStyle(() => ({ transform: [{ translateY: drift.value * 22 }, { scale: 0.96 + drift.value * 0.08 }], opacity: 0.18 + drift.value * 0.1 }));
  const content = <View style={[styles.shell, { paddingTop: insets.top + (Platform.OS === 'web' ? 22 : 6), paddingBottom: Math.max(insets.bottom, 18) + 88 }, contentStyle]}>{children}</View>;
  return (
    <LinearGradient colors={['#050A12', '#07131F', '#071B2A']} style={styles.background}>
      <StatusBar style="light" />
      <Animated.View pointerEvents="none" style={[styles.ambientOrb, orb]} />
      {scroll ? <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>{content}</ScrollView> : content}
    </LinearGradient>
  );
}

export function ScreenHeader({ eyebrow, title, subtitle, icon, color = '#55D6FF' }: { eyebrow: string; title: string; subtitle: string; icon?: IconName; color?: string }) {
  return (
    <Animated.View entering={FadeInLeft.duration(520)} style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}><Text style={[styles.eyebrow, { color }]}>{eyebrow}</Text><Text style={styles.title}>{title}</Text></View>
        {icon ? <View style={[styles.headerIconGlow, { backgroundColor: `${color}18`, borderColor: `${color}45` }]}><LinearGradient colors={[color, `${color}AA`]} style={styles.headerIcon}><Feather name={icon} size={23} color="#050A12" /></LinearGradient></View> : null}
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

export function TaskRow({ id, track, title, detail, meta, xp, trackColor, trait, onPress, isComplete: completeProp, index = 0 }: {
  id: string; track: TrackKey; title: string; detail: string; meta: string; xp: number; trackColor: string; trackIcon: string;
  trait?: TraitKey; onPress?: () => void; isComplete?: boolean; index?: number;
}) {
  const { isComplete, toggle } = useProgress();
  const complete = completeProp ?? isComplete(id);
  const scale = useSharedValue(1);
  const motion = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handlePress = () => {
    scale.value = withSequence(withSpring(0.975), withSpring(complete ? 1 : 1.018), withSpring(1));
    (onPress ?? (() => toggle(id, track, xp, trait)))();
  };
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(430)} style={motion}>
      <Pressable testID={`task-${id}`} accessibilityRole="checkbox" accessibilityState={{ checked: complete }} onPress={handlePress} style={[styles.taskRow, complete && { borderColor: `${trackColor}65`, backgroundColor: `${trackColor}10` }]}>
        <View style={[styles.taskAccent, { backgroundColor: trackColor }]} />
        <View style={[styles.check, { borderColor: complete ? trackColor : '#355065', backgroundColor: complete ? trackColor : '#102235' }]}>{complete ? <Feather name="check" size={15} color="#050A12" /> : null}</View>
        <View style={styles.taskCopy}><Text style={[styles.taskTitle, complete && styles.taskTitleComplete]}>{title}</Text><Text style={styles.taskDetail}>{detail}</Text></View>
        <View style={styles.taskMetaWrap}><Text style={styles.taskMeta}>{meta}</Text><View style={[styles.xpPill, { backgroundColor: `${trackColor}1C` }]}><Text style={[styles.taskXp, { color: trackColor }]}>+{xp}</Text></View></View>
      </Pressable>
    </Animated.View>
  );
}

function BookCard({ book, color, reason, expanded, index, onPress }: { book: Book; color: string; reason: string; expanded: boolean; index: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const [opening, setOpening] = useState(false);
  const motion = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handleOpen = async () => {
    if (!book.includedPdf || opening) return;
    setOpening(true);
    try {
      await openIncludedGuide(book.track);
    } finally {
      setOpening(false);
    }
  };
  return (
    <Animated.View entering={FadeInDown.delay(380 + index * 80).duration(480)} style={motion}>
      <View style={[styles.bookCard, expanded && { borderColor: `${color}70`, backgroundColor: `${color}0E` }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={`${book.title} by ${book.author}`}
          onPress={onPress}
          onPressIn={() => { scale.value = withSpring(0.985); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          style={styles.bookTopRow}
        >
          <View style={[styles.bookIcon, { backgroundColor: `${color}1C` }]}><Feather name={book.includedPdf ? 'file-text' : 'book-open'} size={18} color={color} /></View>
          <View style={styles.bookHeading}><Text style={styles.bookTitle}>{book.title}</Text><Text style={styles.bookAuthor}>{book.author}</Text></View>
          <View style={[styles.journeyPill, { backgroundColor: `${color}18` }]}><Text style={[styles.journeyText, { color }]}>{book.includedPdf ? 'PDF INCLUDED' : book.tier === 'starter' ? 'START HERE' : 'GO DEEPER'}</Text></View>
          <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color="#61788A" />
        </Pressable>
        {expanded ? (
          <Animated.View entering={FadeIn.duration(320)} style={styles.bookExpanded}>
            <Text style={styles.bookPromise}>{book.promise}</Text>
            <View style={styles.whyRow}><Feather name="target" size={12} color={color} /><View style={styles.whyCopy}><Text style={[styles.bookPracticeLabel, { color }]}>WHY THIS, FOR YOU</Text><Text style={styles.bookReason}>{reason}</Text></View></View>
            <View style={[styles.bookPractice, { borderLeftColor: color }]}>
              <Text style={[styles.bookPracticeLabel, { color }]}>DAY 1 OF {book.journeyDays}</Text>
              <Text style={styles.bookPracticeText}>{book.practice}</Text>
            </View>
            {book.includedPdf ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`Open ${book.title} PDF`} disabled={opening} onPress={() => { void handleOpen(); }} style={({ pressed }) => [styles.openGuideButton, { backgroundColor: color }, pressed && styles.openGuideButtonPressed, opening && styles.openGuideButtonDisabled]}>
                <Feather name={opening ? 'loader' : 'file-text'} size={15} color="#050A12" />
                <Text style={styles.openGuideText}>{opening ? 'Preparing guide…' : 'Open included PDF'}</Text>
                {!opening ? <Feather name="external-link" size={14} color="#050A12" /> : null}
              </Pressable>
            ) : null}
          </Animated.View>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function TrackScreen({ track }: { track: TrackKey }) {
  const config = TRACKS[track];
  const { profile, isComplete, hapticsEnabled, adaptivePlan, planDate } = useProgress();
  const router = useRouter();
  const tasks = getTodayTasks(track, profile, planDate, adaptivePlan);
  const books = getRecommendedBooks(track, profile);
  const completed = tasks.filter((task) => isComplete(task.id)).length;
  const [expandedBook, setExpandedBook] = useState<string | null>(books[0]?.id ?? null);
  const readingStyle = profile?.readingStyle === 'practical' ? 'fast, practical ideas' : profile?.readingStyle === 'deep' ? 'deeper philosophy and reflection' : profile?.readingStyle === 'exercises' ? 'practice-first learning' : 'a mix of tools and deeper ideas';
  return (
    <ScreenShell>
      <View style={styles.pagePadding}>
        <Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={19} color="#F6FBFF" /><Text style={styles.backText}>TODAY</Text></Pressable>
        <ScreenHeader eyebrow={`${config.label.toUpperCase()} PATH`} title={config.title} subtitle={config.description} icon={config.icon} color={config.color} />
        <Animated.View entering={FadeInDown.delay(120).duration(520)} style={[styles.pathHero, { borderColor: `${config.color}45`, backgroundColor: config.glow }]}>
          <View style={styles.pathHeroCopy}><Text style={[styles.heroEyebrow, { color: config.color }]}>TODAY’S SIGNAL</Text><Text style={styles.heroTitle}>{completed === 3 ? 'Path complete.' : `${3 - completed} quest${3 - completed === 1 ? '' : 's'} remain.`}</Text><Text style={styles.heroBody}>{config.benefit}</Text></View>
          <DailyRing completed={completed} total={3} size={104} />
        </Animated.View>
        <AdaptiveInsight track={track} />
        <View style={styles.sectionRow}><Text style={styles.sectionLabel}>Today’s practice</Text><Text style={[styles.sectionMeta, { color: config.color }]}>{completed}/3 COMPLETE</Text></View>
        <View style={styles.taskList}>{tasks.map((task, index) => <TaskRow key={task.id} {...task} trackColor={config.color} index={index} />)}</View>
        <Animated.View entering={FadeInDown.delay(320).duration(520)} style={[styles.resourceCard, { borderColor: `${config.color}45` }]}>
          <View style={[styles.resourceIcon, { backgroundColor: `${config.color}1D` }]}><Feather name={config.resource.icon} size={21} color={config.color} /></View>
          <View style={styles.resourceCopy}><Text style={[styles.resourceEyebrow, { color: config.color }]}>{config.resource.eyebrow}</Text><Text style={styles.resourceTitle}>{config.resource.title}</Text><Text style={styles.resourceDetail}>{config.resource.detail}</Text></View>
        </Animated.View>
        <View style={styles.booksHeader}>
          <View><Text style={styles.sectionLabel}>Books for your path</Text><Text style={styles.booksSubtitle}>Chosen for {readingStyle}</Text></View>
          <View style={[styles.personalizedPill, { borderColor: `${config.color}50` }]}><Feather name="sliders" size={11} color={config.color} /><Text style={[styles.personalizedText, { color: config.color }]}>PERSONALIZED</Text></View>
        </View>
        <View style={styles.bookList}>
          {books.map((book, index) => <BookCard key={book.id} book={book} color={config.color} reason={getBookReason(book, profile)} expanded={expandedBook === book.id} index={index} onPress={() => {
            if (hapticsEnabled) void Haptics.selectionAsync();
            setExpandedBook((current) => current === book.id ? null : book.id);
          }} />)}
        </View>
        <Pressable testID={`back-home-${track}`} onPress={() => router.replace('/')} style={styles.returnButton}><Text style={styles.returnText}>Return to today</Text><Feather name="arrow-right" size={17} color="#050A12" /></Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 }, scroll: { flex: 1, backgroundColor: 'transparent' }, scrollContent: { flexGrow: 1 }, shell: { flex: 1 },
  ambientOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, right: -155, top: 90, backgroundColor: '#168BB0' },
  pagePadding: { paddingHorizontal: 18 }, backButton: { alignSelf: 'flex-start', height: 38, flexDirection: 'row', alignItems: 'center', gap: 8 }, backText: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.bold, fontSize: 10, letterSpacing: 1.5 },
  header: { paddingTop: 14, paddingBottom: 22 }, headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 15 }, headerCopy: { flex: 1 },
  eyebrow: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 10.5, letterSpacing: 2 }, title: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 31, lineHeight: 36, letterSpacing: -0.9, marginTop: 8 },
  subtitle: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 14, lineHeight: 21, marginTop: 11, maxWidth: 335 },
  headerIconGlow: { width: 58, height: 58, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, headerIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pathHero: { minHeight: 145, borderRadius: 21, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden' }, pathHeroCopy: { flex: 1 },
  heroEyebrow: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 9.5, letterSpacing: 1.7 }, heroTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 21, marginTop: 7 }, heroBody: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11.5, lineHeight: 17, marginTop: 7 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 28, marginBottom: 11 }, sectionLabel: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 17 }, sectionMeta: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 9.5, letterSpacing: 1.2 }, taskList: { gap: 10 },
  taskRow: { minHeight: 82, borderRadius: 17, borderWidth: 1, borderColor: '#203A4F', backgroundColor: 'rgba(13,28,42,0.9)', padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11, overflow: 'hidden' },
  taskAccent: { position: 'absolute', left: 0, top: 17, bottom: 17, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 }, check: { width: 27, height: 27, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  taskCopy: { flex: 1, gap: 4 }, taskTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 13.5 }, taskTitleComplete: { color: '#91A7B8', textDecorationLine: 'line-through' },
  taskDetail: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11, lineHeight: 16 }, taskMetaWrap: { alignItems: 'flex-end', gap: 6 }, taskMeta: { color: '#61788A', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 0.7 },
  xpPill: { minWidth: 39, height: 24, borderRadius: 12, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center' }, taskXp: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 10 },
  resourceCard: { marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, borderRadius: 18, backgroundColor: 'rgba(13,28,42,0.86)', borderWidth: 1 }, resourceIcon: { width: 45, height: 45, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resourceCopy: { flex: 1 }, resourceEyebrow: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 9, letterSpacing: 1.4 }, resourceTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 15, marginTop: 4 }, resourceDetail: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11.5, lineHeight: 17, marginTop: 4 },
  booksHeader: { marginTop: 28, marginBottom: 11, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }, booksSubtitle: { color: '#61788A', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, marginTop: 4 },
  personalizedPill: { height: 26, borderRadius: 13, borderWidth: 1, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 5 }, personalizedText: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 0.8 }, bookList: { gap: 9 },
  bookCard: { borderRadius: 17, borderWidth: 1, borderColor: '#203A4F', backgroundColor: 'rgba(13,28,42,0.9)', padding: 13 }, bookTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 }, bookIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bookHeading: { flex: 1 }, bookTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 13 }, bookAuthor: { color: '#61788A', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, marginTop: 3 }, journeyPill: { height: 23, borderRadius: 12, paddingHorizontal: 7, justifyContent: 'center' }, journeyText: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 8, letterSpacing: 0.6 },
  bookExpanded: { marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#203A4F' }, bookPromise: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11.5, lineHeight: 17 }, whyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.025)' }, whyCopy: { flex: 1 }, bookReason: { color: '#C8D8E3', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, lineHeight: 15, marginTop: 4 }, bookPractice: { borderLeftWidth: 2, paddingLeft: 10, marginTop: 12 }, bookPracticeLabel: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1.1 }, bookPracticeText: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.medium, fontSize: 11.5, lineHeight: 17, marginTop: 4 },
  openGuideButton: { minHeight: 45, borderRadius: 13, marginTop: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, openGuideButtonPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] }, openGuideButtonDisabled: { opacity: 0.62 }, openGuideText: { color: '#050A12', fontFamily: nativeTheme.typography.sans.bold, fontSize: 12.5, flexShrink: 1 },
  returnButton: { minHeight: 52, borderRadius: 16, backgroundColor: '#F6FBFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 24 }, returnText: { color: '#050A12', fontFamily: nativeTheme.typography.sans.bold, fontSize: 14 },
});
