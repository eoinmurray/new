"use client";
import React, { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';

export interface HistogramPlotProps {
  /** Array of numeric data to plot */
  data: number[];
  /** Number of bins (optional, default: 10) */
  bins?: number;
  /** Chart width in pixels (optional, default: 640) */
  width?: number;
  /** Chart height in pixels (optional, default: 400) */
  height?: number;
}

/**
 * React component that manually bins data and renders a histogram using Plot.rect.
 */
const HistogramPlot: React.FC<HistogramPlotProps> = ({
  data,
  bins = 10,
  width = 640,
  height = 400,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    // Compute bin extents
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;

    // Initialize counts
    const counts = new Array(bins).fill(0);
    data.forEach(d => {
      let idx = Math.floor((d - min) / binWidth);
      if (idx === bins) idx = bins - 1; // include max in last bin
      counts[idx]++;
    });

    // Build binned data
    const binData = counts.map((count, i) => {
      const x0 = min + i * binWidth;
      const x1 = x0 + binWidth;
      return { x0, x1, count };
    });

    // Create the plot using rect marks
    const chart = Plot.plot({
      marks: [
        Plot.rect(binData, {
          x: d => d.x0,
          x1: d => d.x1,
          y: d => d.count,
          fill: 'steelblue',
          stroke: 'black',
        }),
      ],
      width,
      height,
      margin: 20,
    });

    containerRef.current.append(chart);

    return () => chart.remove();
  }, [data, bins, width, height]);

  return <div ref={containerRef} />;
};

export default HistogramPlot;

// Usage Example:
// import HistogramPlot from './HistogramPlot';
// function App() {
//   const sampleData = Array.from({ length: 1000 }, () => Math.random() * 100);
//   return (
//     <div>
//       <h1>Data Histogram</h1>
//       <HistogramPlot data={sampleData} bins={20} width={800} height={450} />
//     </div>
//   );
// }
