import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Block, Task } from '../store/types';
import { ColorTheme } from '../theme/colors';
import { formatTime, blockContains } from '../lib/time';
import { angleForMinute, polarToCartesian, slicePath } from '../lib/geometry';

interface WidgetsViewProps {
  blocks: Block[];
  tasks: Task[];
  theme: ColorTheme;
  currentMinute: number;
  selectedDate: string;
}

export const WidgetsView: React.FC<WidgetsViewProps> = ({
  blocks,
  tasks,
  theme,
  currentMinute,
  selectedDate,
}) => {
  // Find active block
  const activeBlock = useMemo(() => {
    return blocks.find((b) => blockContains(b, currentMinute)) ?? blocks[0];
  }, [blocks, currentMinute]);

  // Find next 2 blocks in schedule
  const nextBlocks = useMemo(() => {
    if (!activeBlock) return [];
    const sorted = [...blocks].sort((a, b) => a.start - b.start);
    const activeIdx = sorted.findIndex((b) => b.id === activeBlock.id);
    const result: Block[] = [];
    for (let i = 1; i <= 2; i++) {
      const nextIdx = (activeIdx + i) % sorted.length;
      result.push(sorted[nextIdx]);
    }
    return result;
  }, [blocks, activeBlock]);

  // Tasks for active block today
  const activeBlockTasks = useMemo(() => {
    if (!activeBlock) return [];
    return tasks.filter((t) => t.blockId === activeBlock.id && t.date === selectedDate);
  }, [tasks, activeBlock, selectedDate]);

  const doneCount = activeBlockTasks.filter((t) => t.done).length;
  const totalCount = activeBlockTasks.length;

  // Calculate elapsed progress inside active block
  const blockTimeProgress = useMemo(() => {
    if (!activeBlock) return 0;
    const { start, end } = activeBlock;
    let duration = end - start;
    if (duration <= 0) duration += 1440;
    let elapsed = currentMinute - start;
    if (elapsed < 0) elapsed += 1440;
    return Math.min(Math.max(elapsed / duration, 0), 1);
  }, [activeBlock, currentMinute]);

  const minutesRemaining = useMemo(() => {
    if (!activeBlock) return 0;
    let rem = activeBlock.end - currentMinute;
    if (rem < 0) rem += 1440;
    return rem;
  }, [activeBlock, currentMinute]);

  const remHours = Math.floor(minutesRemaining / 60);
  const remMinutes = minutesRemaining % 60;
  const remString =
    remHours > 0 ? `Pozostało ${remHours}h ${remMinutes}m` : `Pozostało ${remMinutes} min`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Makiety Widgetów iOS</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          WidgetKit (SwiftUI) na ekran początkowy i blokady
        </Text>
      </View>

      {/* 1. SMALL WIDGET (Square) */}
      <View style={styles.widgetWrapper}>
        <Text style={[styles.widgetSectionTitle, { color: theme.gray }]}>
          1. Mały widget (systemSmall)
        </Text>
        <View
          style={[
            styles.smallWidgetCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Top block badge & icon */}
          <View style={styles.smallWidgetHeader}>
            <View
              style={[
                styles.smallWidgetIconCircle,
                { backgroundColor: activeBlock?.color ?? theme.accentLight },
              ]}
            >
              <Ionicons
                name={(activeBlock?.icon as keyof typeof Ionicons.glyphMap) ?? 'time-outline'}
                size={17}
                color={theme.text}
              />
            </View>
            <Text style={[styles.smallWidgetBadge, { color: theme.accent }]}>TERAZ</Text>
          </View>

          {/* Block Title & Hours */}
          <Text style={[styles.smallWidgetTitle, { color: theme.text }]} numberOfLines={1}>
            {activeBlock?.title ?? 'Czas wolny'}
          </Text>
          <Text style={[styles.smallWidgetHours, { color: theme.textSecondary }]}>
            {activeBlock ? `${formatTime(activeBlock.start)} – ${formatTime(activeBlock.end)}` : ''}
          </Text>

          {/* Task Progress */}
          <View style={styles.smallWidgetTaskRow}>
            <Ionicons name="checkbox-outline" size={13} color={theme.gray} />
            <Text style={[styles.smallWidgetTasksText, { color: theme.textSecondary }]}>
              {totalCount > 0 ? `${doneCount}/${totalCount} zadań` : 'Brak zadań'}
            </Text>
          </View>

          {/* Time Remaining Progress Bar */}
          <View style={styles.smallWidgetProgressTrack}>
            <View
              style={[
                styles.smallWidgetProgressFill,
                {
                  width: `${blockTimeProgress * 100}%`,
                  backgroundColor: theme.accent,
                },
              ]}
            />
          </View>
          <Text style={[styles.smallWidgetRemainingText, { color: theme.textSecondary }]}>
            {remString}
          </Text>
        </View>
      </View>

      {/* 2. MEDIUM WIDGET (Rectangle) */}
      <View style={styles.widgetWrapper}>
        <Text style={[styles.widgetSectionTitle, { color: theme.gray }]}>
          2. Średni widget (systemMedium)
        </Text>
        <View
          style={[
            styles.mediumWidgetCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {/* Left: Mini Day Wheel */}
          <View style={styles.mediumLeftWheel}>
            {(() => {
              const miniSize = 108;
              const cx = miniSize / 2;
              const cy = miniSize / 2;
              const outerR = miniSize * 0.45;
              const innerR = miniSize * 0.26;
              const curAngle = angleForMinute(currentMinute);
              const dot = polarToCartesian(cx, cy, outerR, curAngle);

              return (
                <Svg width={miniSize} height={miniSize} viewBox={`0 0 ${miniSize} ${miniSize}`}>
                  {blocks.map((b) => {
                    const sA = angleForMinute(b.start);
                    const eA = angleForMinute(b.end);
                    const d = slicePath(cx, cy, innerR, outerR, sA, eA);
                    return <Path key={b.id} d={d} fill={b.color} stroke={theme.surface} strokeWidth={1} />;
                  })}
                  <Circle cx={cx} cy={cy} r={innerR - 2} fill={theme.surface} />
                  <Circle cx={dot.x} cy={dot.y} r={3.5} fill={theme.text} stroke={theme.surface} strokeWidth={1} />
                </Svg>
              );
            })()}
            <Text style={[styles.mediumMiniTime, { color: theme.text }]}>
              {formatTime(currentMinute)}
            </Text>
          </View>

          {/* Right: Current + 2 Upcoming Blocks */}
          <View style={styles.mediumRightInfo}>
            <View style={styles.mediumBlockItem}>
              <View style={[styles.colorPill, { backgroundColor: activeBlock?.color ?? theme.accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.mediumBlockName, { color: theme.text }]} numberOfLines={1}>
                  {activeBlock?.title} <Text style={{ color: theme.accent, fontSize: 10 }}>● Teraz</Text>
                </Text>
                <Text style={[styles.mediumBlockTime, { color: theme.textSecondary }]}>
                  {activeBlock ? `${formatTime(activeBlock.start)} – ${formatTime(activeBlock.end)}` : ''}
                </Text>
              </View>
            </View>

            {nextBlocks.map((b) => (
              <View key={b.id} style={styles.mediumBlockItem}>
                <View style={[styles.colorPill, { backgroundColor: b.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.mediumBlockName, { color: theme.text }]} numberOfLines={1}>
                    {b.title}
                  </Text>
                  <Text style={[styles.mediumBlockTime, { color: theme.textSecondary }]}>
                    {formatTime(b.start)} – {formatTime(b.end)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 3. LOCK SCREEN WIDGET (Pill) */}
      <View style={styles.widgetWrapper}>
        <Text style={[styles.widgetSectionTitle, { color: theme.gray }]}>
          3. Widget ekranu blokady (accessoryRectangular)
        </Text>
        <View
          style={[
            styles.lockScreenCard,
            {
              backgroundColor: theme.surfaceSubtle,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.lockScreenPill}>
            <Ionicons
              name={(activeBlock?.icon as keyof typeof Ionicons.glyphMap) ?? 'time'}
              size={18}
              color={theme.accent}
            />
            <Text style={[styles.lockScreenText, { color: theme.text }]}>
              {activeBlock?.title} do {activeBlock ? formatTime(activeBlock.end) : ''}
            </Text>
          </View>
          <Text style={[styles.lockScreenSubtext, { color: theme.textSecondary }]}>
            {remString}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  widgetWrapper: {
    marginBottom: 20,
  },
  widgetSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  smallWidgetCard: {
    width: 165,
    height: 165,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'space-between',
  },
  smallWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallWidgetIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallWidgetBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  smallWidgetTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  smallWidgetHours: {
    fontSize: 11,
    fontWeight: '500',
  },
  smallWidgetTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  smallWidgetTasksText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  smallWidgetProgressTrack: {
    height: 4,
    backgroundColor: '#DCE0E6',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  smallWidgetProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  smallWidgetRemainingText: {
    fontSize: 9.5,
    fontWeight: '500',
  },
  mediumWidgetCard: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    gap: 12,
  },
  mediumLeftWheel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediumMiniTime: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: -4,
  },
  mediumRightInfo: {
    flex: 1,
    gap: 8,
  },
  mediumBlockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorPill: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  mediumBlockName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  mediumBlockTime: {
    fontSize: 10.5,
    fontWeight: '400',
  },
  lockScreenCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  lockScreenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  lockScreenText: {
    fontSize: 15,
    fontWeight: '700',
  },
  lockScreenSubtext: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
