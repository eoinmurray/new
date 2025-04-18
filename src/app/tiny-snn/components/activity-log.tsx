"use client"
import React from 'react';

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

const ActivityLog: React.FC<ActivityLogProps> = ({ 
  entries, 
  maxEntries = 10 
}) => {
  const recentEntries = entries.slice(-maxEntries).reverse();

  return (
    <table className="text-xs text-left text-gray-700 table-auto">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          <th scope="col" className="px-2 py-1 font-semibold">Iter.</th>
          <th scope="col" className="px-2 py-1 font-semibold">Input</th>
          <th scope="col" className="px-2 py-1 font-semibold">Target</th>
          <th scope="col" className="px-2 py-1 font-semibold">Prediction</th>
          {/* <th scope="col" className="px-2 py-1 font-semibold">Loss</th> */}
          {/* <th scope="col" className="px-2 py-1 font-semibold">Accuracy</th> */}
          {/* <th scope="col" className="px-2 py-1 font-semibold">Time</th> */}
        </tr>
      </thead>
      <tbody>
        {recentEntries.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-2 py-2 text-center text-gray-500">
              No activity data yet. Start the simulation to see results.
            </td>
          </tr>
        ) : (
          recentEntries.map((entry) => (
            <tr 
              key={entry.iteration} 
              className={`border-b ${
                entry.prediction === entry.target 
                  ? "bg-green-50 hover:bg-green-100" 
                  : "bg-red-50 hover:bg-red-100"
              } transition-colors`}
            >
            <td className="px-2 py-1 text-center font-mono">{entry.iteration}</td>
              <td className="px-2 py-1 text-center font-mono">[{entry.input[0]}, {entry.input[1]}]</td>
              <td className="px-2 py-1 text-center font-mono">{entry.target}</td>
              <td className="px-2 py-1 text-center font-mono">
                <span className={`px-1 py-0.5 rounded-full ${
                  entry.prediction === entry.target
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {entry.prediction}
                </span>
              </td>
              {/* <td className="px-2 py-1 text-center font-mono">{entry.loss.toFixed(4)}</td> */}
              {/* <td className="px-2 py-1 text-center font-mono">
                <div className="flex items-center">
                  <div className="w-12 bg-gray-200 rounded-full h-1 mr-1">
                    <div
                      className="bg-indigo-600 h-1 rounded-full"
                      style={{ width: `${Math.min(100, entry.accuracy * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs">{(entry.accuracy * 100).toFixed(1)}%</span>
                </div>
              </td> */}
              {/* <td className="px-2 py-1 text-center text-gray-500 text-xs">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </td> */}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ActivityLog;