import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Block, Task } from '../store/types';
import { ColorTheme } from '../theme/colors';
import { formatTime, blocksOverlap } from '../lib/time';

interface AddModalProps {
  visible: boolean;
  blocks: Block[];
  theme: ColorTheme;
  initialMode?: 'block' | 'task';
  onClose: () => void;
  onAddBlock: (block: Block) => void;
  onAddTask: (task: Task) => void;
}

const AVAILABLE_ICONS = [
  'sunny-outline',
  'moon-outline',
  'book-outline',
  'barbell-outline',
  'restaurant-outline',
  'laptop-outline',
  'leaf-outline',
  'briefcase-outline',
  'bicycle-outline',
  'cafe-outline',
  'musical-notes-outline',
  'bed-outline',
] as const;

interface InnerAddContentProps {
  blocks: Block[];
  theme: ColorTheme;
  initialMode: 'block' | 'task';
  onClose: () => void;
  onAddBlock: (block: Block) => void;
  onAddTask: (task: Task) => void;
}

const AddModalContent: React.FC<InnerAddContentProps> = ({
  blocks,
  theme,
  initialMode,
  onClose,
  onAddBlock,
  onAddTask,
}) => {
  const [mode, setMode] = useState<'block' | 'task'>(initialMode);

  // New Block State
  const [blockTitle, setBlockTitle] = useState('');
  const [blockColor, setBlockColor] = useState(theme.palette[0]);
  const [blockIcon, setBlockIcon] = useState<string>(AVAILABLE_ICONS[0]);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [repeat, setRepeat] = useState<'daily' | 'weekdays'>('daily');
  const [blockError, setBlockError] = useState<string | null>(null);

  // New Task State
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState<string>(
    blocks[0]?.id ?? ''
  );
  const [taskDay, setTaskDay] = useState<'today' | 'tomorrow'>('today');
  const [taskError, setTaskError] = useState<string | null>(null);

  const handleCreateBlock = () => {
    setBlockError(null);
    if (!blockTitle.trim()) {
      setBlockError('Please enter a block name.');
      return;
    }

    const startH = parseInt(startHour, 10);
    const startM = parseInt(startMinute, 10);
    const endH = parseInt(endHour, 10);
    const endM = parseInt(endMinute, 10);

    if (
      isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM) ||
      startH < 0 || startH > 23 || startM < 0 || startM > 59 ||
      endH < 0 || endH > 23 || endM < 0 || endM > 59
    ) {
      setBlockError('Please enter valid hours (0–23) and minutes (0–59).');
      return;
    }

    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    if (start === end) {
      setBlockError('Start and end times cannot be the same.');
      return;
    }

    // Overlap validation
    const candidate = { start, end };
    const overlapping = blocks.find((b) => blocksOverlap(candidate, b));
    if (overlapping) {
      setBlockError(
        `This time overlaps with "${overlapping.title}" (${formatTime(overlapping.start)} – ${formatTime(overlapping.end)}).`
      );
      return;
    }

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      title: blockTitle.trim(),
      start,
      end,
      color: blockColor,
      icon: blockIcon,
      repeat,
    };

    onAddBlock(newBlock);
    onClose();
  };

  const handleCreateTask = () => {
    setTaskError(null);
    if (!taskTitle.trim()) {
      setTaskError('Please enter a task title.');
      return;
    }
    if (!selectedBlockId) {
      setTaskError('Please select a time block for this task.');
      return;
    }

    const dateStr =
      taskDay === 'today'
        ? format(new Date(), 'yyyy-MM-dd')
        : format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const newTask: Task = {
      id: `task-${Date.now()}`,
      blockId: selectedBlockId,
      date: dateStr,
      title: taskTitle.trim(),
      done: false,
    };

    onAddTask(newTask);
    onClose();
  };

  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom + 12, 24);

  return (
    <View style={[styles.sheetContainer, { backgroundColor: theme.surface, paddingBottom: bottomPadding }]}>
      <View style={[styles.grabHandle, { backgroundColor: theme.border }]} />

      {/* Segmented Mode Switch */}
      <View style={[styles.modeTabs, { backgroundColor: theme.surfaceSubtle }]}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'task' && [styles.modeTabActive, { backgroundColor: theme.surface }]]}
          onPress={() => setMode('task')}
        >
          <Ionicons
            name="checkbox-outline"
            size={16}
            color={mode === 'task' ? theme.text : theme.gray}
          />
          <Text
            style={[
              styles.modeTabText,
              { color: theme.gray },
              mode === 'task' && [styles.modeTabTextActive, { color: theme.text }],
            ]}
          >
            New Task
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === 'block' && [styles.modeTabActive, { backgroundColor: theme.surface }]]}
          onPress={() => setMode('block')}
        >
          <Ionicons
            name="pie-chart-outline"
            size={16}
            color={mode === 'block' ? theme.text : theme.gray}
          />
          <Text
            style={[
              styles.modeTabText,
              { color: theme.gray },
              mode === 'block' && [styles.modeTabTextActive, { color: theme.text }],
            ]}
          >
            New Block
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {mode === 'task' ? (
          /* NEW TASK FORM */
          <View style={styles.formContainer}>
            {taskError ? (
              <View style={[styles.errorBox, { backgroundColor: theme.dangerLight }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.danger} />
                <Text style={[styles.errorText, { color: theme.danger }]}>{taskError}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: theme.textSecondary }]}>Task Title</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.surfaceSubtle, color: theme.text },
              ]}
              placeholder="e.g. Prepare presentation"
              placeholderTextColor={theme.gray}
              value={taskTitle}
              onChangeText={setTaskTitle}
              onSubmitEditing={handleCreateTask}
              returnKeyType="done"
              autoFocus
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Day</Text>
            <View style={styles.daysRow}>
              <TouchableOpacity
                style={[
                  styles.dayChoice,
                  { backgroundColor: theme.surfaceSubtle },
                  taskDay === 'today' && [
                    styles.dayChoiceActive,
                    { borderColor: theme.accent, backgroundColor: theme.accentLight },
                  ],
                ]}
                onPress={() => setTaskDay('today')}
              >
                <Text
                  style={[
                    styles.dayChoiceText,
                    { color: theme.textSecondary },
                    taskDay === 'today' && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dayChoice,
                  { backgroundColor: theme.surfaceSubtle },
                  taskDay === 'tomorrow' && [
                    styles.dayChoiceActive,
                    { borderColor: theme.accent, backgroundColor: theme.accentLight },
                  ],
                ]}
                onPress={() => setTaskDay('tomorrow')}
              >
                <Text
                  style={[
                    styles.dayChoiceText,
                    { color: theme.textSecondary },
                    taskDay === 'tomorrow' && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  Tomorrow
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Assign to Block</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blocksScroll}>
              {blocks.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.blockChip,
                    { borderColor: b.color, backgroundColor: theme.surface },
                    selectedBlockId === b.id && {
                      backgroundColor: b.color,
                      borderColor: theme.text,
                    },
                  ]}
                  onPress={() => setSelectedBlockId(b.id)}
                >
                  <Ionicons
                    name={b.icon as keyof typeof Ionicons.glyphMap}
                    size={15}
                    color={theme.text}
                  />
                  <Text style={[styles.blockChipText, { color: theme.text }]}>{b.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.accent }]}
              onPress={handleCreateTask}
            >
              <Text style={styles.submitBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* NEW BLOCK FORM */
          <View style={styles.formContainer}>
            {blockError ? (
              <View style={[styles.errorBox, { backgroundColor: theme.dangerLight }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.danger} />
                <Text style={[styles.errorText, { color: theme.danger }]}>{blockError}</Text>
              </View>
            ) : null}

            <Text style={[styles.label, { color: theme.textSecondary }]}>Block Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceSubtle, color: theme.text }]}
              placeholder="e.g. Focus Session"
              placeholderTextColor={theme.gray}
              value={blockTitle}
              onChangeText={setBlockTitle}
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Time (start – end)
            </Text>
            <View style={styles.timeRow}>
              <View style={[styles.timeBox, { backgroundColor: theme.surfaceSubtle }]}>
                <TextInput
                  style={[styles.timeInput, { color: theme.text }]}
                  value={startHour}
                  onChangeText={setStartHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={[styles.timeColon, { color: theme.gray }]}>:</Text>
                <TextInput
                  style={[styles.timeInput, { color: theme.text }]}
                  value={startMinute}
                  onChangeText={setStartMinute}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <Text style={[styles.timeDash, { color: theme.gray }]}>—</Text>
              <View style={[styles.timeBox, { backgroundColor: theme.surfaceSubtle }]}>
                <TextInput
                  style={[styles.timeInput, { color: theme.text }]}
                  value={endHour}
                  onChangeText={setEndHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={[styles.timeColon, { color: theme.gray }]}>:</Text>
                <TextInput
                  style={[styles.timeInput, { color: theme.text }]}
                  value={endMinute}
                  onChangeText={setEndMinute}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Color</Text>
            <View style={styles.paletteRow}>
              {theme.palette.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setBlockColor(c)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    blockColor === c && [styles.colorCircleSelected, { borderColor: theme.text }],
                  ]}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconsRow}>
              {AVAILABLE_ICONS.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  onPress={() => setBlockIcon(iconName)}
                  style={[
                    styles.iconChip,
                    { backgroundColor: theme.surfaceSubtle },
                    blockIcon === iconName && [
                      styles.iconChipSelected,
                      { borderColor: theme.accent, backgroundColor: theme.accentLight },
                    ],
                  ]}
                >
                  <Ionicons
                    name={iconName as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={blockIcon === iconName ? theme.accent : theme.text}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: theme.textSecondary }]}>Repeat</Text>
            <View style={styles.repeatRow}>
              <TouchableOpacity
                style={[
                  styles.repeatBtn,
                  { backgroundColor: theme.surfaceSubtle },
                  repeat === 'daily' && [
                    styles.repeatBtnActive,
                    { borderColor: theme.accent, backgroundColor: theme.accentLight },
                  ],
                ]}
                onPress={() => setRepeat('daily')}
              >
                <Text
                  style={[
                    styles.repeatBtnText,
                    { color: theme.textSecondary },
                    repeat === 'daily' && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.repeatBtn,
                  { backgroundColor: theme.surfaceSubtle },
                  repeat === 'weekdays' && [
                    styles.repeatBtnActive,
                    { borderColor: theme.accent, backgroundColor: theme.accentLight },
                  ],
                ]}
                onPress={() => setRepeat('weekdays')}
              >
                <Text
                  style={[
                    styles.repeatBtnText,
                    { color: theme.textSecondary },
                    repeat === 'weekdays' && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  Weekdays
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.accent }]}
              onPress={handleCreateBlock}
            >
              <Text style={styles.submitBtnText}>Create Block</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export const AddModal: React.FC<AddModalProps> = (props) => {
  const { visible, onClose, initialMode = 'task' } = props;

  // Handle Esc key on Web/Mac
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
          accessibilityLabel="Close"
        />

        <AddModalContent key={initialMode} {...props} initialMode={initialMode} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  grabHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  modeTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modeTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modeTabTextActive: {
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  formContainer: {
    paddingVertical: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12.5,
    flex: 1,
    fontWeight: '500',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dayChoice: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  dayChoiceActive: {
    borderWidth: 1.5,
  },
  dayChoiceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  blocksScroll: {
    marginVertical: 4,
  },
  blockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    marginRight: 8,
    gap: 6,
  },
  blockChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  timeInput: {
    fontSize: 16,
    fontWeight: '600',
    width: 28,
    textAlign: 'center',
  },
  timeColon: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 2,
  },
  timeDash: {
    fontSize: 16,
    fontWeight: '700',
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    transform: [{ scale: 1.1 }],
  },
  iconsRow: {
    marginVertical: 4,
  },
  iconChip: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconChipSelected: {
    borderWidth: 1.5,
  },
  repeatRow: {
    flexDirection: 'row',
    gap: 10,
  },
  repeatBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  repeatBtnActive: {
    borderWidth: 1.5,
  },
  repeatBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
