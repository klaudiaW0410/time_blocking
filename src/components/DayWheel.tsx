import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Pressable,
} from 'react-native';
import Svg, {
  G,
  Path,
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Block, Task } from '../store/types';
import { ColorTheme } from '../theme/colors';
import { angleForMinute, polarToCartesian, slicePath } from '../lib/geometry';
import { blockContains, formatTime } from '../lib/time';

interface DayWheelProps {
  blocks: Block[];
  tasks: Task[];
  theme: ColorTheme;
  selectedDate: string;
  currentMinute: number;
  onSelectBlock: (block: Block) => void;
}

export const DayWheel: React.FC<DayWheelProps> = ({
  blocks,
  tasks,
  theme,
  selectedDate,
  currentMinute,
  onSelectBlock,
}) => {
  const { width } = useWindowDimensions();

  // Fits cleanly inside the 390px frame with padding
  const size = Math.min(Math.max(width - 32, 300), 356);
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.385;
  const innerRadius = size * 0.225;
  const midRadius = (innerRadius + outerRadius) / 2;

  // Active block currently containing currentMinute
  const activeBlock = useMemo(() => {
    return blocks.find((b) => blockContains(b, currentMinute));
  }, [blocks, currentMinute]);

  const currentAngle = angleForMinute(currentMinute);
  const currentTimeStr = formatTime(currentMinute);

  // Day name in Polish capitalized
  const dayName = useMemo(() => {
    const raw = format(new Date(), 'EEEE', { locale: pl });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, []);

  // Compute tasks progress per block for the selected date
  const blockProgressMap = useMemo(() => {
    const map: Record<string, { done: number; total: number; label: string }> = {};
    for (const b of blocks) {
      const blockTasks = tasks.filter(
        (t) => t.blockId === b.id && t.date === selectedDate
      );
      const total = blockTasks.length;
      const done = blockTasks.filter((t) => t.done).length;
      let label = '';
      if (total > 0) {
        label = done === total ? `✓ ${done}/${total}` : `${done}/${total}`;
      }
      map[b.id] = { done, total, label };
    }
    return map;
  }, [blocks, tasks, selectedDate]);

  // Labels every 3 hours outside the circle: 0:00, 3:00, 6:00, 9:00, 12:00, 15:00, 18:00, 21:00
  const hourMarkers = [
    { label: '0:00', angle: 0 },
    { label: '3:00', angle: 45 },
    { label: '6:00', angle: 90 },
    { label: '9:00', angle: 135 },
    { label: '12:00', angle: 180 },
    { label: '15:00', angle: 225 },
    { label: '18:00', angle: 270 },
    { label: '21:00', angle: 315 },
  ];

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track outlines */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={outerRadius}
          fill="none"
          stroke={theme.border}
          strokeWidth={1.5}
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="none"
          stroke={theme.border}
          strokeWidth={1}
        />

        {/* 3-hour markers on perimeter */}
        {hourMarkers.map((marker) => {
          const tickStart = polarToCartesian(centerX, centerY, outerRadius + 1, marker.angle);
          const tickEnd = polarToCartesian(centerX, centerY, outerRadius + 5, marker.angle);
          const labelPos = polarToCartesian(centerX, centerY, outerRadius + 14, marker.angle);

          return (
            <G key={`marker-${marker.label}`}>
              <Line
                x1={tickStart.x}
                y1={tickStart.y}
                x2={tickEnd.x}
                y2={tickEnd.y}
                stroke={theme.gray}
                strokeWidth={1.2}
              />
              <SvgText
                x={labelPos.x}
                y={labelPos.y + 3}
                fontSize={9}
                fontWeight="500"
                fill={theme.textSecondary}
                textAnchor="middle"
              >
                {marker.label}
              </SvgText>
            </G>
          );
        })}

        {/* Time block slices */}
        {blocks.map((block) => {
          const startAngle = angleForMinute(block.start);
          const endAngle = angleForMinute(block.end);
          const isActive = activeBlock?.id === block.id;
          const path = slicePath(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle);

          // Calculate angular width
          let diffAngle = endAngle - startAngle;
          if (diffAngle < 0) diffAngle += 360;
          const midAngle = (startAngle + diffAngle / 2) % 360;

          // Midpoint placement for labels
          const labelPoint = polarToCartesian(centerX, centerY, midRadius, midAngle);
          const progress = blockProgressMap[block.id];
          const timeRangeStr = `${formatTime(block.start)} – ${formatTime(block.end)}`;

          return (
            <G
              key={block.id}
              onPress={() => onSelectBlock(block)}
              style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}
            >
              <Path
                d={path}
                fill={block.color}
                stroke={isActive ? theme.text : theme.background}
                strokeWidth={isActive ? 2.5 : 1.5}
                opacity={isActive ? 1 : 0.95}
              />

              {/* Text on slice if angular width permits */}
              {diffAngle >= 22 && (
                <G>
                  <SvgText
                    x={labelPoint.x}
                    y={diffAngle > 40 ? labelPoint.y - 7 : labelPoint.y + 2}
                    fontSize={diffAngle > 50 ? 10.5 : 9}
                    fontWeight={isActive ? '800' : '600'}
                    fill={theme.text}
                    textAnchor="middle"
                  >
                    {block.title.length > 9 && diffAngle < 45
                      ? `${block.title.slice(0, 7)}…`
                      : block.title}
                  </SvgText>

                  {diffAngle > 40 ? (
                    <SvgText
                      x={labelPoint.x}
                      y={labelPoint.y + 4}
                      fontSize={7.8}
                      fontWeight="400"
                      fill={theme.textSecondary}
                      textAnchor="middle"
                    >
                      {timeRangeStr}
                    </SvgText>
                  ) : null}

                  {progress?.label ? (
                    <SvgText
                      x={labelPoint.x}
                      y={diffAngle > 40 ? labelPoint.y + 14 : labelPoint.y + 11}
                      fontSize={8}
                      fontWeight="600"
                      fill={progress.done === progress.total ? theme.successTick : theme.textSecondary}
                      textAnchor="middle"
                    >
                      {progress.label}
                    </SvgText>
                  ) : null}
                </G>
              )}
            </G>
          );
        })}

        {/* Center white disk */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={innerRadius - 3}
          fill={theme.surface}
          stroke={theme.border}
          strokeWidth={1.5}
        />

        {/* Dark dot on perimeter showing current time */}
        {(() => {
          const dotPos = polarToCartesian(centerX, centerY, outerRadius, currentAngle);
          const innerPos = polarToCartesian(centerX, centerY, innerRadius - 2, currentAngle);

          return (
            <G key="current-time-indicator">
              <Line
                x1={innerPos.x}
                y1={innerPos.y}
                x2={dotPos.x}
                y2={dotPos.y}
                stroke={theme.text}
                strokeWidth={1.8}
                strokeDasharray="2,3"
                opacity={0.65}
              />
              <Circle
                cx={dotPos.x}
                cy={dotPos.y}
                r={6.5}
                fill={theme.text}
                opacity={0.2}
              />
              <Circle
                cx={dotPos.x}
                cy={dotPos.y}
                r={4}
                fill={theme.text}
                stroke={theme.surface}
                strokeWidth={1.5}
              />
            </G>
          );
        })()}
      </Svg>

      {/* Center interactive content overlay */}
      <Pressable
        style={[
          styles.centerOverlay,
          {
            width: (innerRadius - 3) * 2,
            height: (innerRadius - 3) * 2,
            borderRadius: innerRadius - 3,
          },
        ]}
        onPress={() => activeBlock && onSelectBlock(activeBlock)}
        accessibilityRole="button"
        accessibilityLabel={`Aktualny czas ${currentTimeStr}, blok ${activeBlock?.title ?? 'brak'}`}
      >
        <Ionicons
          name="sunny-outline"
          size={18}
          color={theme.sunIcon}
          style={{ marginBottom: 1 }}
        />
        <Text style={[styles.centerTimeText, { color: theme.text }]}>
          {currentTimeStr}
        </Text>
        <Text style={[styles.centerDayText, { color: theme.gray }]}>
          {dayName}
        </Text>
        {activeBlock && (
          <Text
            style={[styles.centerActiveBlockText, { color: theme.accent }]}
            numberOfLines={1}
          >
            {activeBlock.title}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  centerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 6,
  },
  centerTimeText: {
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  centerDayText: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: -1,
  },
  centerActiveBlockText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
});
