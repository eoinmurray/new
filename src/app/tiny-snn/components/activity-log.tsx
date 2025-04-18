"use client"
import React from 'react';
import { NetworkState } from './tiny-snn';

export interface LogEntry {
  iteration: number;
  input: [number, number];
  target: number;
  prediction: number;
  loss: number;
  accuracy: number;
  timestamp: number;
}

interface ActivityLogProps {
  entries: LogEntry[];
  maxEntries?: number;
}

export default function ActivityLog ({ data, width, height }: {
  data: NetworkState[],
  width?: number;
  height?: number;
}) {
  return (
    <table className={`w-[${width}px] h-[${height}px]`}>
      <thead>
        <tr className="bg-[#EEEEEE] border-b border-border">
          <th className="px-4 py-2 text-left text-sm font-medium text-[#333333]">Iter.</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-[#333333]">Input</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-[#333333]">Target</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-[#333333]">Prediction</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr 
            key={`tableentry-${index}`}
            className={index % 2 === 0 ? "bg-[#FAFAFA]" : "bg-[#F5F5F5]"}
          >
            <td className="px-4 py-2 text-left font-mono text-sm text-[#555555]">{entry.iteration}</td>
            <td className="px-4 py-2 text-left font-mono text-sm text-[#555555]">[{entry.input[0]}, {entry.input[1]}]</td>
            <td className="px-4 py-2 text-left font-mono text-sm text-[#555555]">{entry.target}</td>
            <td className="px-4 py-2 text-left font-mono text-sm text-[#555555]">
              {entry.prediction}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
