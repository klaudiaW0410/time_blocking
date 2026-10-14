export interface Block {
  id: string;
  title: string;
  start: number; // 0..1439
  end: number;   // 0..1439
  color: string;
  icon: string;
  repeat: "daily" | "weekdays" | number[];
}

export interface Task {
  id: string;
  blockId: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  done: boolean;
}
