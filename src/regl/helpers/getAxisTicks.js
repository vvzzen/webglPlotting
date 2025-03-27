export function getAxisTicks(min, max, numTicks = 5) {
  const step = (max - min) / (numTicks - 1);
  return Array.from({ length: numTicks }, (_, i) => min + i * step);
}