"use client";
import { useEffect, useRef, useState } from "react";
import * as Plot from '@observablehq/plot';

export default function StackedLinePlot({ 
  data1, 
  data2,
  title,
  width = 400,
  height = 200,
}: { 
  data1: number[]; 
  data2: number[]; 
  title: string;
  width?: number;
  height?: number; 
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const chart = Plot.plot({
      title: title,
      marks: [
        Plot.lineY(data1),
        Plot.lineY(data2),
      ],
      width: width,
      height: height,
    });
    
    containerRef.current.append(chart);
  }, [data1, data2, title, width, height]);

  return (
    <div ref={containerRef} />
  )

}