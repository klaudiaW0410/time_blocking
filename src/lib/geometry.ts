export function angleForMinute(minute: number): number {
  return (minute / 1440) * 360;
}

export function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

export function slicePath(
  x: number,
  y: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  let diff = endAngle - startAngle;
  if (diff < 0) diff += 360;

  if (diff >= 359.9) {
    return `
      M ${x} ${y - outerRadius}
      A ${outerRadius} ${outerRadius} 0 1 1 ${x} ${y + outerRadius}
      A ${outerRadius} ${outerRadius} 0 1 1 ${x} ${y - outerRadius}
      Z
      M ${x} ${y - innerRadius}
      A ${innerRadius} ${innerRadius} 0 1 0 ${x} ${y + innerRadius}
      A ${innerRadius} ${innerRadius} 0 1 0 ${x} ${y - innerRadius}
      Z
    `.trim().replace(/\s+/g, ' ');
  }

  const p1 = polarToCartesian(x, y, outerRadius, startAngle);
  const p2 = polarToCartesian(x, y, outerRadius, endAngle);
  const p3 = polarToCartesian(x, y, innerRadius, endAngle);
  const p4 = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = diff <= 180 ? '0' : '1';

  return [
    'M', p1.x, p1.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 1, p2.x, p2.y,
    'L', p3.x, p3.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 0, p4.x, p4.y,
    'Z'
  ].join(' ');
}
