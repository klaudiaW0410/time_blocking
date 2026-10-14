import { Block } from '../store/types';

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function blockContains(block: Pick<Block, 'start' | 'end'>, minute: number): boolean {
  if (block.start <= block.end) {
    return minute >= block.start && minute < block.end;
  } else {
    // Crosses midnight
    return minute >= block.start || minute < block.end;
  }
}

export function blocksOverlap(a: Pick<Block, 'start' | 'end'>, b: Pick<Block, 'start' | 'end'>): boolean {
  const getIntervals = (block: Pick<Block, 'start' | 'end'>) => {
    if (block.start <= block.end) {
      return [[block.start, block.end]];
    }
    return [[block.start, 1440], [0, block.end]];
  };

  const intA = getIntervals(a);
  const intB = getIntervals(b);

  for (const [startA, endA] of intA) {
    for (const [startB, endB] of intB) {
      if (startA < endB && startB < endA) {
        return true;
      }
    }
  }
  return false;
}
