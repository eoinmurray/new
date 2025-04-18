"use client"
import React, { useState, useEffect, useRef } from 'react';
import SimulationControls from './components/simulation-controls';
import { TinySNN } from './components/tiny-snn';
import PlotAccuracyAndLoss, { type DataPoint } from './components/plot-accuracy-and-loss';
import NetworkVisualization, { NetworkState } from './components/network-visualization';
import RealtimeSpikingPlot from './components/realtime-spiking-plot';
import ActivityLog, { LogEntry } from './components/activity-log';

export default function SpikingNeuralNetworkPage() {
  const [simulationParameters, setSimulationParameters] = useState({
    hiddenSize: 8,
    learningRate: 0.05,
    timesteps: 100,
    frameRate: 30,
    isPaused: false,
  });

  const XOR_DATA = [
    { inputs: [0, 0], target: 0 },
    { inputs: [0, 1], target: 1 },
    { inputs: [1, 0], target: 1 },
    { inputs: [1, 1], target: 0 }
  ];

  const network = new TinySNN({
    hiddenSize: simulationParameters.hiddenSize,
    learningRate: simulationParameters.learningRate,
    timesteps: simulationParameters.timesteps,
  });

  // Create state for network visualization
  const [networkStateHistory, setNetworkStateHistory] = useState<NetworkState[]>([network.networkState]);

  useEffect(() => {
    let correct = 0;
    let total = 0;
    let iteration = 0;
    
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;

    function runNetwork() {
      if (simulationParameters.isPaused) {
        animationFrameId = requestAnimationFrame(runNetwork);
        return;
      }
      
      const example = XOR_DATA[Math.floor(Math.random() * XOR_DATA.length)];
      const [input1, input2] = example.inputs;
      const target = example.target;
      
      const { networkState } = network.train(input1, input2, target);

      iteration += 1;
      const isCorrect = networkState.prediction === target;
      correct += isCorrect ? 1 : 0;
      total += 1;
      const accuracy = correct / total;

      setNetworkStateHistory(prevNetworkStateHistory => {
        const newHistory = [...prevNetworkStateHistory, networkState];
        return newHistory.slice(-1000);
      });

      timeoutId = setTimeout(() => {
        animationFrameId = requestAnimationFrame(runNetwork);  
      }, 1000 / simulationParameters.frameRate);
    }

    animationFrameId = requestAnimationFrame(runNetwork);
    
    // Cleanup function to cancel animation frame when component unmounts or parameters change
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [simulationParameters])

  return (
    <div className="flex flex-col gap-2 p-3 max-w-7xl h-screen">
      <header className="w-full mb-0">
        <h1 className="text-2xl font-bold text-gray-800">Spiking Neural Network Simulator</h1>
        <p className="text-sm text-gray-600">Tiny SNN: Educational implementation of a spiking neural network solving XOR</p>
      </header>

      <div className="grid grid-cols-12 gap-3 flex-grow min-h-0">
        <SimulationControls onChange={setSimulationParameters} />
        
        {/* Main content area */}
        <div className="col-span-9">
          <PlotAccuracyAndLoss networkStateHistory={networkStateHistory} />
          {/* 
          <ActivityLog entries={logEntries} maxEntries={4} />
          <NetworkVisualization networkState={networkState} />
          <RealtimeSpikingPlot 
            networkState={networkState} 
            timeWindow={10000}
            height={200} 
          />   */}
        </div>
      </div>
    </div>
  );
}