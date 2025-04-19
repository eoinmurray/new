"use client";
import { useEffect, useRef } from "react";
import * as Plot from '@observablehq/plot';
import { histogram } from "./histogram-data";

export default function WeightsHistogram({ 
  data1, 
  data2, 
  width = 400,
  height = 200,
}: { 
  data1: number[]; 
  data2: number[];
  width?: number;
  height?: number; 
}) {
  const binned1 = histogram(data1, 10, undefined, undefined);
  const binned2 = histogram(data2, 10, undefined, undefined);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const chart = Plot.plot({
      marks: [
        Plot.rectY(binned1, { x: "binStart", y: "count" }),
        Plot.rectY(binned2, { x: "binStart", y: "count" }),
      ],
      width: width,
      height: height,
      marginBottom: 50,
      x: {
        tickRotate: -30,
      },
    });
    
    containerRef.current.append(chart);
  }, [binned1, binned2, width, height]);

  return (
    <div ref={containerRef} />
  )

}