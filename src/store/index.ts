import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays } from 'date-fns';
import { Block, Task } from './types';
import { lightTheme } from '../theme/colors';

export const getInitialBlocks = (): Block[] => [
  {
    id: 'block-sen',
    title: 'Sen',
    start: 22 * 60, // 22:00 (1320)
    end: 6 * 60, // 06:00 (360)
    color: lightTheme.blocks.sen,
    icon: 'moon-outline',
    repeat: 'daily',
  },
  {
    id: 'block-poranek',
    title: 'Poranek',
    start: 6 * 60, // 06:00 (360)
    end: 8 * 60 + 30, // 08:30 (510)
    color: lightTheme.blocks.poranek,
    icon: 'sunny-outline',
    repeat: 'daily',
  },
  {
    id: 'block-szkola',
    title: 'Szkoła',
    start: 8 * 60 + 30, // 08:30 (510)
    end: 16 * 60, // 16:00 (960)
    color: lightTheme.blocks.szkola,
    icon: 'book-outline',
    repeat: 'weekdays',
  },
  {
    id: 'block-trening',
    title: 'Trening',
    start: 16 * 60, // 16:00 (960)
    end: 17 * 60, // 17:00 (1020)
    color: lightTheme.blocks.trening,
    icon: 'barbell-outline',
    repeat: 'weekdays',
  },
  {
    id: 'block-kolacja',
    title: 'Kolacja',
    start: 17 * 60, // 17:00 (1020)
    end: 18 * 60, // 18:00 (1080)
    color: lightTheme.blocks.kolacja,
    icon: 'restaurant-outline',
    repeat: 'daily',
  },
  {
    id: 'block-cfg',
    title: 'CFG',
    start: 19 * 60 + 30, // 19:30 (1170)
    end: 21 * 60, // 21:00 (1260)
    color: lightTheme.blocks.cfg,
    icon: 'laptop-outline',
    repeat: 'weekdays',
  },
  {
    id: 'block-wyciszenie',
    title: 'Wyciszenie',
    start: 21 * 60, // 21:00 (1260)
    end: 22 * 60, // 22:00 (1320)
    color: lightTheme.blocks.wyciszenie,
    icon: 'leaf-outline',
    repeat: 'daily',
  },
];

export const getInitialTasks = (): Task[] => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  return [
    // Zadania Dziś
    {
      id: 'task-today-1',
      blockId: 'block-szkola',
      date: today,
      title: '8:30–12:00 Szkoła (SAS)',
      done: false,
    },
    {
      id: 'task-today-2',
      blockId: 'block-szkola',
      date: today,
      title: '14:00–16:00 CHF',
      done: false,
    },
    {
      id: 'task-today-3',
      blockId: 'block-trening',
      date: today,
      title: '16:00–17:00 Trening nóg',
      done: false,
    },
    {
      id: 'task-today-4',
      blockId: 'block-cfg',
      date: today,
      title: '19:30–21:00 Projekt React',
      done: false,
    },
    // Zadania Jutro
    {
      id: 'task-tomorrow-1',
      blockId: 'block-szkola',
      date: tomorrow,
      title: '8:00–12:00 SAS',
      done: false,
    },
    {
      id: 'task-tomorrow-2',
      blockId: 'block-szkola',
      date: tomorrow,
      title: '14:00–16:00 CHF',
      done: false,
    },
  ];
};

interface AppState {
  blocks: Block[];
  tasks: Task[];
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;
  resetToDefaults: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      blocks: getInitialBlocks(),
      tasks: getInitialTasks(),
      themeMode: 'light',

      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light',
        })),

      addBlock: (block) =>
        set((state) => ({ blocks: [...state.blocks, block] })),

      updateBlock: (id, updates) =>
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      removeBlock: (id) =>
        set((state) => ({
          blocks: state.blocks.filter((b) => b.id !== id),
          tasks: state.tasks.filter((t) => t.blockId !== id),
        })),

      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      toggleTaskDone: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),

      resetToDefaults: () =>
        set(() => ({
          blocks: getInitialBlocks(),
          tasks: getInitialTasks(),
        })),
    }),
    {
      name: 'time-blocking-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
