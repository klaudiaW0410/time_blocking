import { angleForMinute, polarToCartesian, slicePath } from '../geometry';

describe('geometry utilities', () => {
  it('angleForMinute returns 0 for 0', () => {
    expect(angleForMinute(0)).toBe(0);
  });

  it('angleForMinute returns 360 for 1440', () => {
    expect(angleForMinute(1440)).toBe(360);
  });

  it('angleForMinute returns 90 for 360 (6 hours)', () => {
    expect(angleForMinute(6 * 60)).toBe(90);
  });

  it('polarToCartesian computes correctly for top (0 degrees)', () => {
    const point = polarToCartesian(100, 100, 50, 0);
    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(50); // 100 - 50 since top is -90 in math
  });

  it('slicePath generates a path string', () => {
    const path = slicePath(100, 100, 50, 100, 0, 90);
    expect(typeof path).toBe('string');
    expect(path.startsWith('M')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
  });

  it('slicePath handles full circle', () => {
    const path = slicePath(100, 100, 50, 100, 0, 360);
    expect(path.includes('A 100 100 0 1 1')).toBe(true);
  });
});
