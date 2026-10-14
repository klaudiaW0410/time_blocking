import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, Block } from '../store/types';
import { ColorTheme } from '../theme/colors';
import { formatTime } from '../lib/time';

interface TaskRowProps {
  task: Task;
  block?: Block;
  theme: ColorTheme;
  onToggleDone: (id: string) => void;
  onOpenBlock: (blockId: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  block,
  theme,
  onToggleDone,
  onOpenBlock,
}) => {
  const blockColor = block?.color ?? theme.accentLight;
  const timeLabel = block ? `${formatTime(block.start)} – ${formatTime(block.end)}` : '';

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: blockColor,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Checkbox button (44x44 min touch target) */}
      <TouchableOpacity
        onPress={() => onToggleDone(task.id)}
        style={styles.checkboxTouch}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={`Mark task: ${task.title} as ${task.done ? 'uncompleted' : 'completed'}`}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkbox,
            { borderColor: theme.gray, backgroundColor: theme.surface },
            task.done && {
              backgroundColor: theme.successTick,
              borderColor: theme.successTick,
            },
          ]}
        >
          {task.done && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>

      {/* Main card body & arrow button: opens block details */}
      <TouchableOpacity
        onPress={() => block && onOpenBlock(block.id)}
        style={styles.cardContent}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Block details: ${block?.title ?? ''}`}
      >
        <View style={styles.textContainer}>
          {timeLabel ? (
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>
              {timeLabel}
            </Text>
          ) : null}

          <Text
            style={[
              styles.taskTitle,
              { color: theme.text },
              task.done && [styles.taskTitleDone, { color: theme.gray }],
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={17} color={theme.gray} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    ...(Platform.OS === 'web'
      ? {
          cursor: 'pointer',
          transition: 'all 0.18s ease-in-out',
        }
      : {}),
  },
  checkboxTouch: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingVertical: 2,
  },
  textContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  arrowContainer: {
    paddingLeft: 8,
    paddingRight: 4,
  },
});
