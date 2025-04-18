"use client"
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface NeuronVisualization {
  voltage: number;
  spike: boolean;
  trace: number;
}

export interface NetworkState {
  input: number[];
  hiddenLayer: NeuronVisualization[];
  output: NeuronVisualization;
  weights_input_to_hidden: number[][];
  weights_hidden_to_output: number[][];
}

interface NetworkVisualizationProps {
  networkState: NetworkState;
  width?: number;
  height?: number;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ 
  networkState, 
  width = 400, 
  height = 300 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stateKey = JSON.stringify(networkState);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Constants for layout
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const neuronRadius = 12;
    const pulseRadius = neuronRadius * 1.8;
    const weightScale = 3;

    // Color palette
    const colors = {
      neuronDefault: '#f0f0f0',
      spike: '#ff6f61',
      spikeStroke: '#d64545',
      excitatory: '#4caf50',
      inhibitory: '#f44336',
      text: '#333',
    };

    // Groups
    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Positions
    const xInput = 0;
    const xHidden = innerWidth / 2;
    const xOutput = innerWidth;

    const inputs = networkState.input;
    const inputCount = inputs.length;
    const hiddenCount = networkState.hiddenLayer.length;

    const yInputScale = d3.scalePoint<number>()
      .domain(d3.range(inputCount))
      .range([0, innerHeight])
      .padding(0.5);
    const yHiddenScale = d3.scalePoint<number>()
      .domain(d3.range(hiddenCount))
      .range([0, innerHeight])
      .padding(0.5);
    const yOutput = innerHeight / 2;

    // Draw connections input->hidden
    networkState.weights_input_to_hidden.forEach((weights, j) => {
      weights.forEach((w, i) => {
        g.append('line')
          .attr('x1', xInput)
          .attr('y1', yInputScale(i))
          .attr('x2', xHidden)
          .attr('y2', yHiddenScale(j))
          .attr('stroke', w > 0 ? colors.excitatory : colors.inhibitory)
          .attr('stroke-width', Math.max(0.5, Math.abs(w) * weightScale))
          .attr('stroke-opacity', 0.7);
      });
    });

    // Draw connections hidden->output
    networkState.weights_hidden_to_output.forEach((weights, i) => {
      const w = weights[0];
      g.append('line')
        .attr('x1', xHidden)
        .attr('y1', yHiddenScale(i))
        .attr('x2', xOutput)
        .attr('y2', yOutput)
        .attr('stroke', w > 0 ? colors.excitatory : colors.inhibitory)
        .attr('stroke-width', Math.max(0.5, Math.abs(w) * weightScale))
        .attr('stroke-opacity', 0.7);
    });

    // Helper to draw neuron
    function drawNeuron(x: number, y: number, voltage: number, spike: boolean, label: string) {
      // Node fill
      const fillColor = spike
        ? colors.spike
        : d3.interpolateBlues(Math.min(1, Math.abs(voltage)));

      // Circle
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', neuronRadius)
        .attr('fill', fillColor)
        .attr('stroke', spike ? colors.spikeStroke : colors.text)
        .attr('stroke-width', spike ? 2 : 1);

      // Spike pulse
      if (spike) {
        const pulse = g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', neuronRadius)
          .attr('fill', 'none')
          .attr('stroke', colors.spike)
          .attr('stroke-width', 2)
          .attr('opacity', 0.8);
        pulse.append('animate')
          .attr('attributeName', 'r')
          .attr('from', neuronRadius)
          .attr('to', pulseRadius)
          .attr('dur', '0.6s')
          .attr('fill', 'freeze');
        pulse.append('animate')
          .attr('attributeName', 'opacity')
          .attr('from', 0.8)
          .attr('to', 0)
          .attr('dur', '0.6s')
          .attr('fill', 'freeze');
      }

      // Label
      g.append('text')
        .attr('x', x)
        .attr('y', y + neuronRadius + 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', colors.text)
        .text(label);
    }

    // Draw input neurons
    inputs.forEach((val, i) => {
      drawNeuron(
        xInput,
        yInputScale(i),
        val,
        val > 0,
        `In ${i + 1}`
      );
    });

    // Draw hidden neurons
    networkState.hiddenLayer.forEach((n, i) => {
      drawNeuron(
        xHidden,
        yHiddenScale(i),
        n.voltage,
        n.spike,
        `H${i + 1}: ${n.voltage.toFixed(2)}`
      );
    });

    // Draw output neuron
    drawNeuron(
      xOutput,
      yOutput,
      networkState.output.voltage,
      networkState.output.spike,
      `Out: ${networkState.output.voltage.toFixed(2)}`
    );

    // Legend at bottom-right
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 140}, ${innerHeight - 100})`);
    const legendItems = [
      { label: 'Spiking', color: colors.spike, stroke: colors.spikeStroke },
      { label: 'Resting', color: d3.interpolateBlues(0.5), stroke: colors.text },
      { label: 'Excitatory', color: null, stroke: colors.excitatory },
      { label: 'Inhibitory', color: null, stroke: colors.inhibitory },
    ];
    legendItems.forEach((item, idx) => {
      const yOff = idx * 20;
      if (item.color) {
        legend.append('circle')
          .attr('cx', 0)
          .attr('cy', yOff)
          .attr('r', 6)
          .attr('fill', item.color)
          .attr('stroke', item.stroke)
          .attr('stroke-width', 1);
      } else {
        legend.append('line')
          .attr('x1', -6)
          .attr('y1', yOff)
          .attr('x2', 6)
          .attr('y2', yOff)
          .attr('stroke', item.stroke)
          .attr('stroke-width', 2);
      }
      legend.append('text')
        .attr('x', 12)
        .attr('y', yOff + 4)
        .attr('font-size', '11px')
        .attr('fill', colors.text)
        .text(item.label);
    });

  }, [stateKey, width, height]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default NetworkVisualization;
