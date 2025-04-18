"use client"
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { NetworkState } from './network-visualization';

interface SpikeRecord {
  time: number;
  neuronId: string;
  layer: 'input' | 'hidden' | 'output';
}

interface RealtimeSpikingPlotProps {
  networkState: NetworkState;
  width?: number;
  height?: number;
  timeWindow?: number; // Time window in milliseconds
}

const RealtimeSpikingPlot: React.FC<RealtimeSpikingPlotProps> = ({
  networkState,
  width = 600,
  height = 300,
  timeWindow = 5000,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [spikes, setSpikes] = useState<SpikeRecord[]>([]);
  const prevStateRef = useRef<NetworkState | null>(null);
  const lastSpikeTimeRef = useRef<Record<string, number>>({});
  const inputSpikeCounterRef = useRef<number>(0);

  useEffect(() => {
    if (!networkState) return;

    const currentTime = Date.now();
    const newSpikes: SpikeRecord[] = [];
    
    // Simulate input spikes every 10 frames
    inputSpikeCounterRef.current = (inputSpikeCounterRef.current + 1) % 10;

    if (inputSpikeCounterRef.current === 0) {
      // Add simulated input spikes
      newSpikes.push({
        time: currentTime,
        neuronId: 'input-0',
        layer: 'input',
      });
      
      // Stagger the second input slightly
      setTimeout(() => {
        setSpikes(prev => [...prev, {
          time: Date.now(),
          neuronId: 'input-1',
          layer: 'input',
        }]);
      }, 50);
    }

    // Process hidden layer spikes
    networkState.hiddenLayer.forEach((neuron, index) => {
      const neuronId = `hidden-${index}`;
      
      // Check if this is a new spike
      if (neuron.spike) {
        // Only record a new spike if it's been at least 100ms since the last one for this neuron
        // This helps prevent duplicate spikes from being recorded
        const lastSpikeTime = lastSpikeTimeRef.current[neuronId] || 0;
        if (currentTime - lastSpikeTime > 100) {
          newSpikes.push({
            time: currentTime,
            neuronId,
            layer: 'hidden',
          });
          lastSpikeTimeRef.current[neuronId] = currentTime;
        }
      }
    });

    // Process output neuron spike
    if (networkState.output.spike) {
      const neuronId = 'output-0';
      const lastSpikeTime = lastSpikeTimeRef.current[neuronId] || 0;
      
      if (currentTime - lastSpikeTime > 100) {
        newSpikes.push({
          time: currentTime,
          neuronId,
          layer: 'output',
        });
        lastSpikeTimeRef.current[neuronId] = currentTime;
      }
    }

    // Update previous state
    prevStateRef.current = JSON.parse(JSON.stringify(networkState));

    // Add new spikes and remove old ones outside the time window
    if (newSpikes.length > 0) {
      setSpikes(prevSpikes => {
        const cutoffTime = currentTime - timeWindow;
        // Filter spikes by time window
        const filteredSpikes = prevSpikes.filter(spike => spike.time > cutoffTime);
        // Add new spikes and limit to a maximum of 1000 entries
        const updatedSpikes = [...filteredSpikes, ...newSpikes];
        return updatedSpikes.slice(-1000);
      });
    } else {
      // Still filter old spikes periodically even if no new spikes
      setSpikes(prevSpikes => {
        const cutoffTime = currentTime - timeWindow;
        const filteredSpikes = prevSpikes.filter(spike => spike.time > cutoffTime);
        // Ensure the array doesn't grow beyond 1000 entries
        return filteredSpikes.slice(-1000);
      });
    }
  }, [networkState, timeWindow]);

  // Draw raster plot
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Get all unique neuron IDs
    const neuronIds = Array.from(new Set(spikes.map(spike => spike.neuronId)));
    
    // Sort neurons by layer (hidden first, then output) and by index
    neuronIds.sort((a, b) => {
      const aIsOutput = a.startsWith('output');
      const bIsOutput = b.startsWith('output');
      
      if (aIsOutput && !bIsOutput) return 1;
      if (!aIsOutput && bIsOutput) return -1;
      
      const aIndex = parseInt(a.split('-')[1]);
      const bIndex = parseInt(b.split('-')[1]);
      return aIndex - bIndex;
    });

    // Always ensure all neurons are represented in the plot
    // Clear the existing neuronIds array and rebuild it from the network structure
    neuronIds.length = 0;
    
    // Add all hidden layer neurons
    if (networkState && networkState.hiddenLayer) {
      for (let i = 0; i < networkState.hiddenLayer.length; i++) {
        neuronIds.push(`hidden-${i}`);
      }
    }
    
    // Add input neurons (for XOR network, always 2 inputs)
    neuronIds.push('input-0');
    neuronIds.push('input-1');
    
    // Add output neuron
    neuronIds.push('output-0');
    
    // Sort neurons by layer and index
    neuronIds.sort((a, b) => {
      // Order by layer: input first, then hidden, then output
      const layerOrder = { 'input': 0, 'hidden': 1, 'output': 2 };
      const aLayer = a.split('-')[0] as keyof typeof layerOrder;
      const bLayer = b.split('-')[0] as keyof typeof layerOrder;
      
      if (layerOrder[aLayer] !== layerOrder[bLayer]) {
        return layerOrder[aLayer] - layerOrder[bLayer];
      }
      
      // If same layer, order by index
      const aIndex = parseInt(a.split('-')[1]);
      const bIndex = parseInt(b.split('-')[1]);
      return aIndex - bIndex;
    });

    // Define scales
    const xScale = d3.scaleLinear()
      .domain([Date.now() - timeWindow, Date.now()])
      .range([0, plotWidth]);

    const yScale = d3.scaleBand()
      .domain(neuronIds)
      .range([0, plotHeight])
      .padding(0.1);

    // Create chart group
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add X axis - time
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${((Number(d) - Date.now()) / 1000).toFixed(1)}s`);
    
    chartGroup.append('g')
      .attr('transform', `translate(0, ${plotHeight})`)
      .attr('class', 'x-axis')
      .call(xAxis);
    
    // Add X axis label
    chartGroup.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', plotHeight + 35)
      .attr('text-anchor', 'middle')
      .text('Time (seconds)');

    // Add Y axis - neuron IDs
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => {
        const [layer, index] = d.toString().split('-');
        if (layer === 'input') return `Input ${index}`;
        if (layer === 'hidden') return `Hidden ${index}`;
        if (layer === 'output') return `Output`;
        return d.toString();
      });
    
    chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);
    
    // Add Y axis label
    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -plotHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .text('Neuron');

    // Plot spike markers
    chartGroup.selectAll('.spike-marker')
      .data(spikes)
      .enter()
      .append('line')
      .attr('class', 'spike-marker')
      .attr('x1', d => xScale(d.time))
      .attr('x2', d => xScale(d.time))
      .attr('y1', d => yScale(d.neuronId)!)
      .attr('y2', d => yScale(d.neuronId)! + yScale.bandwidth())
      .attr('stroke', d => {
        // Color spikes by layer
        if (d.layer === 'input') return '#67B7D1';  // Blue for inputs
        if (d.layer === 'hidden') return '#4285F4'; // Darker blue for hidden
        if (d.layer === 'output') return '#FF5733'; // Orange for output
        return '#999'; // Default gray
      })
      .attr('stroke-width', 2)
      .attr('opacity', d => {
        // Fade out older spikes
        const age = Date.now() - d.time;
        return Math.max(0.3, 1 - age / timeWindow);
      });
    
    // Add a grid to make it easier to read
    chartGroup.selectAll('.grid-line')
      .data(neuronIds)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', plotWidth)
      .attr('y1', d => yScale(d)! + yScale.bandwidth())
      .attr('y2', d => yScale(d)! + yScale.bandwidth())
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Spike Raster Plot');
      
  }, [spikes, width, height, timeWindow, networkState]);

  // Update x-axis continuously
  useEffect(() => {
    const updateInterval = 100; // Update every 100ms
    
    const intervalId = setInterval(() => {
      if (!svgRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const margin = { top: 20, right: 30, bottom: 40, left: 60 };
      const plotWidth = width - margin.left - margin.right;
      
      const xScale = d3.scaleLinear()
        .domain([Date.now() - timeWindow, Date.now()])
        .range([0, plotWidth]);
      
      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `${((Number(d) - Date.now()) / 1000).toFixed(1)}s`);
      
      svg.select('.x-axis').call(xAxis);
      
      // Update spike positions based on new time
      svg.selectAll('.spike-marker')
        .attr('x1', d => xScale(d.time))
        .attr('x2', d => xScale(d.time))
        .attr('opacity', d => {
          // Fade out older spikes
          const age = Date.now() - d.time;
          return Math.max(0.3, 1 - age / timeWindow);
        });
      
    }, updateInterval);
    
    return () => clearInterval(intervalId);
  }, [width, timeWindow]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default RealtimeSpikingPlot;