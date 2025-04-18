import React, { FC, memo, useMemo } from 'react';
import { NetworkState } from './tiny-snn';

// Color palette - grayscale with minimal color
const COLORS = {
  active: '#777777',      // Medium gray for active
  inactive: '#E0E0E0',    // Light gray for inactive
  positive: '#5B8C5A',    // Dark gray for positive weights
  negative: '#F08080',    // Light-medium gray for negative weights
  stroke: '#333333',      // Dark gray for outlines
  text: '#333333',        // Dark gray for text
};

interface Neuron {
  voltage: number;
  spike: boolean;
  trace: number;
}

interface NeuronCircleProps {
  x: number;
  y: number;
  active: boolean;
  label?: string;
}

const NeuronCircle: FC<NeuronCircleProps> = memo(({ x, y, active, label }) => (
  <g transform={`translate(${x}, ${y})`} filter="url(#shadow)" style={{ transition: 'all 0.3s ease' }}>
    <circle
      r={14}
      fill={active ? COLORS.active : COLORS.inactive}
      stroke={COLORS.stroke}
      strokeWidth={1.5}
    />
    {label && (
      <text x={35} y={23} fontSize={12} textAnchor="middle" fill={COLORS.text}>
        {label}
      </text>
    )}
  </g>
));

interface NetworkVisualizationProps {
  data: NetworkState;
  width?: number;
  height?: number;
}

const NetworkVisualization: FC<NetworkVisualizationProps> = memo(({ data, width = 700, height = 500 }) => {
  const margin = useMemo(() => ({ top: 40, right: 40, bottom: 40, left: 40 }), []);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const inputCount = data.input.length;
  const hiddenCount = data.hiddenLayer.length;

  const inputYStep = innerHeight / (inputCount + 1);
  const hiddenYStep = innerHeight / (hiddenCount + 1);
  const inputX = margin.left;
  const hiddenX = margin.left + innerWidth / 2;
  const outputX = margin.left + innerWidth;
  const outputY = margin.top + innerHeight / 2;

  return (
    <svg 
      width={width} 
      height={height} 
      style={{ fontFamily: 'var(--font-mono)', borderRadius: '8px' }}
    >
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Connections: input → hidden */}
      {data.input.map((_, i) =>
        data.hiddenLayer.map((_, j) => {
          const weight =
            data.weights_input_to_hidden[i]?.[j] ??
            data.weights_input_to_hidden[j]?.[i] ??
            0;
          const x1 = inputX;
          const y1 = margin.top + inputYStep * (i + 1);
          const x2 = hiddenX;
          const y2 = margin.top + hiddenYStep * (j + 1);
          const color = weight > 0 ? COLORS.positive : COLORS.negative;
          const opacity = Math.min(Math.abs(weight), 1);
          return (
            <line
              key={`line-in-hid-${i}-${j}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={opacity}
            />
          );
        })
      )}

      {/* Connections: hidden → output */}
      {data.weights_hidden_to_output.map((row, i) => {
        const x1 = hiddenX;
        const y1 = margin.top + hiddenYStep * (i + 1);
        const x2 = outputX;
        const y2 = outputY;
        const weight = row[0];
        const color = weight > 0 ? COLORS.positive : COLORS.negative;
        const opacity = Math.min(Math.abs(weight), 1);
        return (
          <line
            key={`line-hid-out-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      })}

      {/* Input neurons */}
      {data.input.map((val, i) => {
        const y = margin.top + inputYStep * (i + 1);
        return (
          <NeuronCircle
            key={`input-${i}`}
            x={inputX}
            y={y}
            active={val > 0.5}
            label={`Input ${i + 1}`}
          />
        );
      })}


      {/* Hidden neurons */}
      {data.hiddenLayer.map((neuron, i) => {
        const y = margin.top + hiddenYStep * (i + 1);
        return (
          <NeuronCircle
            key={`hidden-${i}`}
            x={hiddenX}
            y={y}
            active={neuron.spike}
            label={`Hidden ${i + 1}`}
          />
        );
      })}

      {/* Output neuron */}
      <NeuronCircle x={outputX} y={outputY} active={data.output.spike} label="Output" />
    </svg>
  );
});

export default NetworkVisualization;
