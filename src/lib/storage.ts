import AsyncStorage from '@react-native-async-storage/async-storage';
import { Block, Task } from '../store/types';

export interface IAppStorage {
  getBlocks(): Promise<Block[]>;
  saveBlocks(blocks: Block[]): Promise<void>;
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
}

const STORAGE_KEYS = {
  BLOCKS: 'timeblocking_blocks',
  TASKS: 'timeblocking_tasks',
};

/**
 * Local storage adapter using AsyncStorage.
 * Can be swapped with SupabaseStorageAdapter without changing UI components.
 */
export class AsyncStorageAdapter implements IAppStorage {
  async getBlocks(): Promise<Block[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveBlocks(blocks: Block[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  }

  async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }
}

export const defaultStorage = new AsyncStorageAdapter();
