
export function histogram(data: any[], binCount: number, minValue?: number, maxValue?: number) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const min = typeof minValue === 'number' 
    ? minValue 
    : Math.min(...data);
  const max = typeof maxValue === 'number' 
    ? maxValue 
    : Math.max(...data);

  const range = max - min;
  if (range === 0) {
    return [{ binStart: min, binEnd: max, count: data.length }];
  }

  const binSize = range / binCount;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    binStart: min + i * binSize,
    binEnd:   min + (i + 1) * binSize,
    count:    0
  }));

  data.forEach(val => {
    if (val < min || val > max || isNaN(val)) return;
    let idx = Math.floor((val - min) / binSize);
    if (idx === binCount) idx = binCount - 1;
    bins[idx].count += 1;
  });

  return bins;
}
