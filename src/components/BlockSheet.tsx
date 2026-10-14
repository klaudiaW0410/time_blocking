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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Block, Task } from '../store/types';
import { ColorTheme } from '../theme/colors';
import { formatTime, blocksOverlap } from '../lib/time';

interface BlockSheetProps {
  visible: boolean;
  block: Block | null;
  tasks: Task[];
  allBlocks: Block[];
  theme: ColorTheme;
  selectedDate: string;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (blockId: string, title: string, date: string) => void;
  onUpdateTask: (taskId: string, title: string) => void;
  onRemoveTask: (taskId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onRemoveBlock: (blockId: string) => void;
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

interface InnerContentProps {
  block: Block;
  tasks: Task[];
  allBlocks: Block[];
  theme: ColorTheme;
  selectedDate: string;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (blockId: string, title: string, date: string) => void;
  onUpdateTask: (taskId: string, title: string) => void;
  onRemoveTask: (taskId: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onRemoveBlock: (blockId: string) => void;
}

const BlockSheetContent: React.FC<InnerContentProps> = ({
  block,
  tasks,
  allBlocks,
  theme,
  selectedDate,
  onClose,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onRemoveTask,
  onUpdateBlock,
  onRemoveBlock,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');

  // Edit block form state initialized directly from props
  const [editTitle, setEditTitle] = useState(block.title);
  const [editColor, setEditColor] = useState(block.color);
  const [editIcon, setEditIcon] = useState(block.icon);
  const [editStartHour, setEditStartHour] = useState(
    Math.floor(block.start / 60).toString()
  );
  const [editStartMinute, setEditStartMinute] = useState(
    (block.start % 60).toString().padStart(2, '0')
  );
  const [editEndHour, setEditEndHour] = useState(
    Math.floor(block.end / 60).toString()
  );
  const [editEndMinute, setEditEndMinute] = useState(
    (block.end % 60).toString().padStart(2, '0')
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter tasks belonging to this block on selectedDate
  const blockTasks = tasks.filter(
    (t) => t.blockId === block.id && t.date === selectedDate
  );
  const doneTasks = blockTasks.filter((t) => t.done).length;
  const totalTasks = blockTasks.length;
  const progressRatio = totalTasks > 0 ? doneTasks / totalTasks : 0;

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(block.id, newTaskTitle.trim(), selectedDate);
    setNewTaskTitle('');
  };

  const handleSaveEditedTask = (taskId: string) => {
    if (editingTaskTitle.trim()) {
      onUpdateTask(taskId, editingTaskTitle.trim());
    }
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };

  const handleSaveBlockEdit = () => {
    setValidationError(null);
    const startH = parseInt(editStartHour, 10);
    const startM = parseInt(editStartMinute, 10);
    const endH = parseInt(editEndHour, 10);
    const endM = parseInt(editEndMinute, 10);

    if (
      isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM) ||
      startH < 0 || startH > 23 || startM < 0 || startM > 59 ||
      endH < 0 || endH > 23 || endM < 0 || endM > 59
    ) {
      setValidationError('Please enter valid hours (0–23) and minutes (0–59).');
      return;
    }

    const newStart = startH * 60 + startM;
    const newEnd = endH * 60 + endM;

    if (newStart === newEnd) {
      setValidationError('Start and end times cannot be the same.');
      return;
    }

    // Overlap validation with other blocks
    const otherBlocks = allBlocks.filter((b) => b.id !== block.id);
    const overlapping = otherBlocks.find((b) =>
      blocksOverlap({ start: newStart, end: newEnd }, b)
    );

    if (overlapping) {
      setValidationError(
        `This time overlaps with "${overlapping.title}" (${formatTime(overlapping.start)} – ${formatTime(overlapping.end)}).`
      );
      return;
    }

    onUpdateBlock(block.id, {
      title: editTitle.trim() || block.title,
      color: editColor,
      icon: editIcon,
      start: newStart,
      end: newEnd,
    });
    setIsEditingBlock(false);
  };

  const handleDeleteBlock = () => {
    const doDelete = () => {
      onRemoveBlock(block.id);
      onClose();
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${block.title}" and its associated tasks?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Block',
        `Are you sure you want to delete "${block.title}" and its associated tasks?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom + 12, 24);

  return (
    <View style={[styles.sheetContainer, { backgroundColor: theme.surface, paddingBottom: bottomPadding }]}>
      {/* Grab handle indicator */}
      <View style={[styles.grabHandle, { backgroundColor: theme.border }]} />

      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with color dot, block title, hours and 'Today' */}
        <View style={styles.headerRow}>
          <View style={[styles.colorDot, { backgroundColor: block.color }]} />

          <View style={styles.headerInfo}>
            <Text style={[styles.blockTitle, { color: theme.text }]}>{block.title}</Text>
            <Text style={[styles.blockHours, { color: theme.textSecondary }]}>
              {formatTime(block.start)} – {formatTime(block.end)} • Today
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={20} color={theme.gray} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressSection, { backgroundColor: theme.surfaceSubtle }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: theme.text }]}>Task Progress</Text>
            <Text style={[styles.progressValue, { color: theme.textSecondary }]}>
              {totalTasks > 0 ? `${doneTasks}/${totalTasks} completed` : 'No tasks'}
            </Text>
          </View>
          <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressRatio * 100}%`,
                  backgroundColor:
                    progressRatio === 1 && totalTasks > 0 ? theme.successTick : theme.accent,
                },
              ]}
            />
          </View>
        </View>

        {/* Edit Block Form or Regular Tasks view */}
        {isEditingBlock ? (
          <View style={styles.editSection}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>Edit Block</Text>

            {validationError ? (
              <View style={[styles.errorBanner, { backgroundColor: theme.dangerLight }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.danger} />
                <Text style={[styles.errorBannerText, { color: theme.danger }]}>
                  {validationError}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Block Name</Text>
            <TextInput
              style={[
                styles.inputField,
                { backgroundColor: theme.surfaceSubtle, color: theme.text, borderColor: theme.border },
              ]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="e.g. Deep Work"
              placeholderTextColor={theme.gray}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Time (start – end)
            </Text>
            <View style={styles.timeInputsRow}>
              <View style={[styles.timeInputBox, { backgroundColor: theme.surfaceSubtle }]}>
                <TextInput
                  style={[styles.timeDigitInput, { color: theme.text }]}
                  value={editStartHour}
                  onChangeText={setEditStartHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={[styles.timeColon, { color: theme.gray }]}>:</Text>
                <TextInput
                  style={[styles.timeDigitInput, { color: theme.text }]}
                  value={editStartMinute}
                  onChangeText={setEditStartMinute}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <Text style={[styles.timeDash, { color: theme.gray }]}>—</Text>

              <View style={[styles.timeInputBox, { backgroundColor: theme.surfaceSubtle }]}>
                <TextInput
                  style={[styles.timeDigitInput, { color: theme.text }]}
                  value={editEndHour}
                  onChangeText={setEditEndHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={[styles.timeColon, { color: theme.gray }]}>:</Text>
                <TextInput
                  style={[styles.timeDigitInput, { color: theme.text }]}
                  value={editEndMinute}
                  onChangeText={setEditEndMinute}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            {/* Color Selector */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Color</Text>
            <View style={styles.colorPaletteRow}>
              {theme.palette.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setEditColor(c)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    editColor === c && [styles.colorSwatchSelected, { borderColor: theme.text }],
                  ]}
                />
              ))}
            </View>

            {/* Icon Selector */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {AVAILABLE_ICONS.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  onPress={() => setEditIcon(iconName)}
                  style={[
                    styles.iconOption,
                    { backgroundColor: theme.surfaceSubtle },
                    editIcon === iconName && [
                      styles.iconOptionSelected,
                      { borderColor: theme.accent, backgroundColor: theme.accentLight },
                    ],
                  ]}
                >
                  <Ionicons
                    name={iconName as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={editIcon === iconName ? theme.accent : theme.text}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Save / Cancel buttons */}
            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => {
                  setIsEditingBlock(false);
                  setValidationError(null);
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.accent }]}
                onPress={handleSaveBlockEdit}
              >
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Tasks List for Selected Day */}
            <View style={styles.tasksSection}>
              <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>
                Tasks in this block
              </Text>

              {blockTasks.length === 0 ? (
                <Text style={[styles.emptyTasksText, { color: theme.gray }]}>
                  No tasks in this block. Add a new task below.
                </Text>
              ) : (
                blockTasks.map((t) => (
                  <View key={t.id} style={[styles.taskItemRow, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity
                      style={styles.taskCheckboxTouch}
                      onPress={() => onToggleTask(t.id)}
                      accessibilityLabel={`Toggle ${t.title}`}
                    >
                      <View
                        style={[
                          styles.taskCheckbox,
                          { borderColor: theme.gray, backgroundColor: theme.surface },
                          t.done && {
                            backgroundColor: theme.successTick,
                            borderColor: theme.successTick,
                          },
                        ]}
                      >
                        {t.done && <Ionicons name="checkmark" size={14} color="#FFF" />}
                      </View>
                    </TouchableOpacity>

                    {editingTaskId === t.id ? (
                      <View style={styles.inlineEditContainer}>
                        <TextInput
                          style={[
                            styles.inlineEditInput,
                            {
                              borderColor: theme.accent,
                              color: theme.text,
                              backgroundColor: theme.surface,
                            },
                          ]}
                          value={editingTaskTitle}
                          onChangeText={setEditingTaskTitle}
                          onSubmitEditing={() => handleSaveEditedTask(t.id)}
                          autoFocus
                        />
                        <TouchableOpacity
                          onPress={() => handleSaveEditedTask(t.id)}
                          style={styles.inlineSaveBtn}
                        >
                          <Ionicons name="checkmark" size={16} color={theme.accent} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.taskTitlePress}
                        onLongPress={() => {
                          setEditingTaskId(t.id);
                          setEditingTaskTitle(t.title);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.taskTitleText,
                            { color: theme.text },
                            t.done && [styles.taskTitleDoneText, { color: theme.gray }],
                          ]}
                        >
                          {t.title}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Edit and Delete Actions */}
                    <TouchableOpacity
                      style={styles.taskActionBtn}
                      onPress={() => {
                        setEditingTaskId(t.id);
                        setEditingTaskTitle(t.title);
                      }}
                      accessibilityLabel="Edit task"
                    >
                      <Ionicons name="pencil-outline" size={16} color={theme.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.taskActionBtn}
                      onPress={() => onRemoveTask(t.id)}
                      accessibilityLabel="Delete task"
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add New Task Input */}
              <View style={styles.newTaskInputRow}>
                <TextInput
                  style={[
                    styles.newTaskTextInput,
                    { backgroundColor: theme.surfaceSubtle, color: theme.text },
                  ]}
                  placeholder="New task in this block..."
                  placeholderTextColor={theme.gray}
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  onSubmitEditing={handleCreateTask}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[
                    styles.addTaskBtn,
                    { backgroundColor: theme.accent },
                    !newTaskTitle.trim() && styles.addTaskBtnDisabled,
                  ]}
                  onPress={handleCreateTask}
                  disabled={!newTaskTitle.trim()}
                >
                  <Text style={styles.addTaskBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Block Controls: Edit & Delete */}
            <View style={[styles.blockControlsRow, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.editBlockBtn, { backgroundColor: theme.surfaceSubtle }]}
                onPress={() => setIsEditingBlock(true)}
              >
                <Ionicons name="create-outline" size={16} color={theme.text} />
                <Text style={[styles.editBlockBtnText, { color: theme.text }]}>Edit block</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteBlockBtn, { backgroundColor: theme.dangerLight }]}
                onPress={handleDeleteBlock}
              >
                <Ionicons name="trash-outline" size={16} color={theme.danger} />
                <Text style={[styles.deleteBlockBtnText, { color: theme.danger }]}>Delete block</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export const BlockSheet: React.FC<BlockSheetProps> = (props) => {
  const { visible, block, onClose } = props;

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

  if (!block) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
          accessibilityLabel="Close sheet"
        />

        <BlockSheetContent key={block.id} {...props} block={block} />
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
    maxHeight: '85%',
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
  contentScroll: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  blockHours: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tasksSection: {
    marginTop: 10,
  },
  sectionHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyTasksText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginVertical: 10,
  },
  taskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  taskCheckboxTouch: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitlePress: {
    flex: 1,
    paddingHorizontal: 8,
  },
  taskTitleText: {
    fontSize: 14.5,
    fontWeight: '500',
  },
  taskTitleDoneText: {
    textDecorationLine: 'line-through',
  },
  taskActionBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineEditContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  inlineEditInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
  },
  inlineSaveBtn: {
    marginLeft: 6,
    padding: 6,
  },
  newTaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  newTaskTextInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addTaskBtn: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTaskBtnDisabled: {
    opacity: 0.5,
  },
  addTaskBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13.5,
  },
  blockControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  editBlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  editBlockBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  deleteBlockBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editSection: {
    marginTop: 10,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  errorBannerText: {
    fontSize: 12.5,
    flex: 1,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  inputField: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  timeDigitInput: {
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
  colorPaletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    transform: [{ scale: 1.1 }],
  },
  iconScroll: {
    marginVertical: 6,
  },
  iconOption: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  iconOptionSelected: {
    borderWidth: 1.5,
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#FFF',
  },
});
