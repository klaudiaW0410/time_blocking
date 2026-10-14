import { formatTime, blockContains, blocksOverlap } from '../time';

describe('time utilities', () => {
  describe('formatTime', () => {
    it('formats correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(9 * 60 + 5)).toBe('09:05');
      expect(formatTime(23 * 60 + 59)).toBe('23:59');
      expect(formatTime(24 * 60)).toBe('00:00');
    });
  });

  describe('blockContains', () => {
    it('handles normal blocks', () => {
      const b = { start: 9 * 60, end: 17 * 60 };
      expect(blockContains(b, 8 * 60)).toBe(false);
      expect(blockContains(b, 9 * 60)).toBe(true);
      expect(blockContains(b, 10 * 60)).toBe(true);
      expect(blockContains(b, 17 * 60)).toBe(false); // end is exclusive
    });

    it('handles blocks crossing midnight', () => {
      const b = { start: 22 * 60, end: 6 * 60 };
      expect(blockContains(b, 21 * 60)).toBe(false);
      expect(blockContains(b, 22 * 60)).toBe(true);
      expect(blockContains(b, 2 * 60)).toBe(true);
      expect(blockContains(b, 6 * 60)).toBe(false);
      expect(blockContains(b, 7 * 60)).toBe(false);
    });
  });

  describe('blocksOverlap', () => {
    it('handles normal overlap', () => {
      const a = { start: 9 * 60, end: 10 * 60 };
      const b = { start: 9 * 60 + 30, end: 11 * 60 };
      expect(blocksOverlap(a, b)).toBe(true);
      expect(blocksOverlap(b, a)).toBe(true);
    });

    it('handles no overlap', () => {
      const a = { start: 9 * 60, end: 10 * 60 };
      const b = { start: 10 * 60, end: 11 * 60 };
      expect(blocksOverlap(a, b)).toBe(false);
    });

    it('handles overlap crossing midnight', () => {
      const a = { start: 23 * 60, end: 2 * 60 };
      const b = { start: 1 * 60, end: 3 * 60 };
      expect(blocksOverlap(a, b)).toBe(true);
    });

    it('handles one block inside another', () => {
      const a = { start: 9 * 60, end: 12 * 60 };
      const b = { start: 10 * 60, end: 11 * 60 };
      expect(blocksOverlap(a, b)).toBe(true);
    });
  });
});
