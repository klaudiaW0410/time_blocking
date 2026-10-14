import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { Block } from '../store/types';
import { lightTheme, darkTheme } from '../theme/colors';
import { DayWheel } from '../components/DayWheel';
import { TaskRow } from '../components/TaskRow';
import { BlockSheet } from '../components/BlockSheet';
import { AddModal } from '../components/AddModal';
import { TabBar, TabKey } from '../components/TabBar';
import { WidgetsView } from '../components/WidgetsView';

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const {
    blocks,
    tasks,
    themeMode,
    toggleTheme,
    addBlock,
    updateBlock,
    removeBlock,
    addTask,
    updateTask,
    removeTask,
    toggleTaskDone,
  } = useStore();

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Desktop Mac frame detection (active on wide Mac/desktop screens)
  const isDesktop = windowWidth >= 500 && windowHeight >= 860;

  const [activeTab, setActiveTab] = useState<TabKey>('plan');
  const [currentView, setCurrentView] = useState<'plan' | 'widgets'>('plan');
  const [activeBlockDetail, setActiveBlockDetail] = useState<Block | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Dynamic top padding ensuring no collision with Dynamic Island, Notch, or browser toolbars
  const topPadding = isDesktop
    ? 44
    : insets.top > 0
    ? insets.top + 8
    : Platform.OS === 'web'
    ? 16
    : 44;

  // Current minute counter refreshed every 30 seconds
  const [currentMinute, setCurrentMinute] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinute(now.getHours() * 60 + now.getMinutes());
    };
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Today & Tomorrow date keys (YYYY-MM-DD)
  const todayKey = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const tomorrowKey = useMemo(() => format(addDays(new Date(), 1), 'yyyy-MM-dd'), []);

  // English header date string (e.g. "Wednesday, September 10")
  const headerDateString = useMemo(() => {
    return format(new Date(), 'EEEE, MMMM d');
  }, []);

  // Filter tasks for Today and Tomorrow groups
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.date === todayKey);
  }, [tasks, todayKey]);

  const tomorrowTasks = useMemo(() => {
    return tasks.filter((t) => t.date === tomorrowKey);
  }, [tasks, tomorrowKey]);

  // Map block IDs for quick access
  const blockMap = useMemo(() => {
    const map = new Map<string, Block>();
    for (const b of blocks) map.set(b.id, b);
    return map;
  }, [blocks]);

  const handleOpenBlockById = (blockId: string) => {
    const target = blockMap.get(blockId);
    if (target) {
      setActiveBlockDetail(target);
    }
  };

  return (
    <View
      style={[
        styles.outerDesktopWrapper,
        {
          backgroundColor: isDesktop ? (themeMode === 'dark' ? '#0A0C0E' : '#E8EBEF') : theme.background,
          height: isDesktop ? '100%' : windowHeight,
          maxHeight: isDesktop ? undefined : windowHeight,
        },
      ]}
    >
      {/* Phone Frame (390x844 px on Desktop, 100% responsive on Mobile) */}
      <View
        style={[
          styles.phoneFrame,
          {
            backgroundColor: theme.background,
            borderColor: isDesktop ? theme.phoneFrameBorder : 'transparent',
            borderWidth: isDesktop ? 8 : 0,
            borderRadius: isDesktop ? 44 : 0,
            height: isDesktop ? 844 : '100%',
            width: isDesktop ? 390 : '100%',
            maxWidth: isDesktop ? 420 : undefined,
            flex: isDesktop ? undefined : 1,
            shadowOpacity: isDesktop ? 0.22 : 0,
            elevation: isDesktop ? 12 : 0,
          },
        ]}
      >
        {/* Dynamic Island on Desktop frame */}
        {isDesktop && (
          <View style={styles.dynamicIslandContainer}>
            <View style={styles.dynamicIsland} />
          </View>
        )}

        {/* Top Header Bar */}
        <View style={[styles.topBar, { borderBottomColor: theme.border, paddingTop: topPadding }]}>
          <View style={styles.headerTitleGroup}>
            <Text style={[styles.headerDate, { color: theme.text }]}>
              {headerDateString}
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Daily Plan
            </Text>
          </View>

          {/* Right Header Controls: Plan / Widgets switcher & Theme toggle */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.viewSwitchButton,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
                currentView === 'widgets' && { backgroundColor: theme.accentLight, borderColor: theme.accent },
              ]}
              onPress={() =>
                setCurrentView((prev) => (prev === 'plan' ? 'widgets' : 'plan'))
              }
              accessibilityRole="button"
              accessibilityLabel="Toggle widgets view"
            >
              <Ionicons
                name={currentView === 'plan' ? 'apps-outline' : 'pie-chart-outline'}
                size={16}
                color={currentView === 'widgets' ? theme.accent : theme.text}
              />
              <Text
                style={[
                  styles.viewSwitchText,
                  { color: currentView === 'widgets' ? theme.accent : theme.text },
                ]}
              >
                {currentView === 'plan' ? 'Widgets' : 'Plan'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeToggleButton, { backgroundColor: theme.surfaceSubtle }]}
              onPress={toggleTheme}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} theme`}
            >
              <Ionicons
                name={themeMode === 'light' ? 'moon-outline' : 'sunny-outline'}
                size={17}
                color={themeMode === 'light' ? theme.text : theme.sunIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {currentView === 'widgets' ? (
            /* WIDGETS VIEW */
            <WidgetsView
              blocks={blocks}
              tasks={tasks}
              theme={theme}
              currentMinute={currentMinute}
              selectedDate={todayKey}
            />
          ) : activeTab === 'plan' ? (
            /* PLAN SCREEN */
            <ScrollView
              style={styles.planScrollView}
              contentContainerStyle={styles.planScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 24h Day Wheel SVG */}
              <DayWheel
                blocks={blocks}
                tasks={tasks}
                theme={theme}
                selectedDate={todayKey}
                currentMinute={currentMinute}
                onSelectBlock={(b) => setActiveBlockDetail(b)}
              />

              {/* Group 1: "Today" */}
              <View style={styles.taskGroupSection}>
                <View style={styles.groupHeaderRow}>
                  <Text style={[styles.groupTitle, { color: theme.text }]}>Today</Text>
                  <Text style={[styles.groupCount, { color: theme.gray }]}>
                    {todayTasks.filter((t) => t.done).length}/{todayTasks.length}
                  </Text>
                </View>

                {todayTasks.length === 0 ? (
                  <Text style={[styles.emptyGroupText, { color: theme.gray }]}>
                    No tasks scheduled for today.
                  </Text>
                ) : (
                  todayTasks.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      block={blockMap.get(t.blockId)}
                      theme={theme}
                      onToggleDone={toggleTaskDone}
                      onOpenBlock={handleOpenBlockById}
                    />
                  ))
                )}
              </View>

              {/* Group 2: "Tomorrow" */}
              <View style={[styles.taskGroupSection, { marginTop: 14 }]}>
                <View style={styles.groupHeaderRow}>
                  <Text style={[styles.groupTitle, { color: theme.text }]}>Tomorrow</Text>
                  <Text style={[styles.groupCount, { color: theme.gray }]}>
                    {tomorrowTasks.filter((t) => t.done).length}/{tomorrowTasks.length}
                  </Text>
                </View>

                {tomorrowTasks.length === 0 ? (
                  <Text style={[styles.emptyGroupText, { color: theme.gray }]}>
                    No tasks scheduled for tomorrow.
                  </Text>
                ) : (
                  tomorrowTasks.map((t) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      block={blockMap.get(t.blockId)}
                      theme={theme}
                      onToggleDone={toggleTaskDone}
                      onOpenBlock={handleOpenBlockById}
                    />
                  ))
                )}
              </View>
            </ScrollView>
          ) : (
            /* Placeholder Tabs (Notes, Study, Fitness, Me) */
            <View style={styles.placeholderContainer}>
              <View
                style={[
                  styles.placeholderCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Ionicons
                  name={
                    activeTab === 'notes'
                      ? 'document-text-outline'
                      : activeTab === 'study'
                      ? 'school-outline'
                      : activeTab === 'movement'
                      ? 'fitness-outline'
                      : 'person-outline'
                  }
                  size={36}
                  color={theme.accent}
                />
                <Text style={[styles.placeholderTitle, { color: theme.text }]}>
                  {activeTab === 'notes'
                    ? 'Notes'
                    : activeTab === 'study'
                    ? 'Study'
                    : activeTab === 'movement'
                    ? 'Fitness'
                    : 'Me'}
                </Text>
                <Text style={[styles.placeholderSubtitle, { color: theme.textSecondary }]}>
                  A calm space for your notes and goals. Coming soon.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Tab Bar with Floating Action Button "+" */}
        <TabBar
          activeTab={activeTab}
          theme={theme}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentView('plan');
          }}
          onPressAdd={() => setIsAddModalOpen(true)}
        />
      </View>

      {/* Block Details Bottom Sheet */}
      <BlockSheet
        visible={Boolean(activeBlockDetail)}
        block={activeBlockDetail}
        tasks={tasks}
        allBlocks={blocks}
        theme={theme}
        selectedDate={todayKey}
        onClose={() => setActiveBlockDetail(null)}
        onToggleTask={toggleTaskDone}
        onAddTask={(blockId, title, date) => {
          addTask({
            id: `task-${Date.now()}`,
            blockId,
            title,
            date,
            done: false,
          });
        }}
        onUpdateTask={(taskId, title) => updateTask(taskId, { title })}
        onRemoveTask={removeTask}
        onUpdateBlock={(id, updates) => {
          updateBlock(id, updates);
          setActiveBlockDetail((prev) => (prev ? { ...prev, ...updates } : null));
        }}
        onRemoveBlock={removeBlock}
      />

      {/* Add New Block / Task Modal */}
      <AddModal
        visible={isAddModalOpen}
        blocks={blocks}
        theme={theme}
        onClose={() => setIsAddModalOpen(false)}
        onAddBlock={addBlock}
        onAddTask={addTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerDesktopWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  phoneFrame: {
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 12,
  },
  dynamicIslandContainer: {
    position: 'absolute',
    top: 9,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  dynamicIsland: {
    width: 105,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerDate: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewSwitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 9,
    borderWidth: 1,
  },
  viewSwitchText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeToggleButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    flex: 1,
  },
  planScrollView: {
    flex: 1,
  },
  planScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 72,
  },
  taskGroupSection: {
    marginTop: 10,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  groupTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  groupCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyGroupText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  placeholderTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginTop: 10,
  },
  placeholderSubtitle: {
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
