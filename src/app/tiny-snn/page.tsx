"use client"
import React, { useState, useEffect } from 'react';
import SimulationControls from '@/components/simulation-controls';
import { TinySNN, NetworkState } from './components/tiny-snn';
import PlotAccuracyAndLoss from './components/plot-accuracy-and-loss';
import NetworkVisualization from './components/network-visualization';
import RealtimeSpikingPlot from './components/realtime-spiking-plot';
import WeightsHistogram from './components/weights-histogram';

type SimulationParams = {
  hiddenSize: number;
  learningRate: number;
  timesteps: number;
  frameRate: number;
  isPaused: boolean;
};

export default function SpikingNeuralNetworkPage() {
  const [simulationParameters, setSimulationParameters] = useState<SimulationParams>({
    hiddenSize: 4,
    learningRate: 0.05,
    timesteps: 100,
    frameRate: 10,
    isPaused: false,
  });

  const inputs = [
    {
      type: "slider" as const,
      id: "hiddenSize",
      label: "Hidden layer size",
      defaultValue: 8,
      min: 2,
      max: 20,
      step: 1,
    },
    {
      type: "slider" as const,
      id: "learningRate",
      label: "Learning rate",
      defaultValue: 0.05,
      min: 0.01,
      max: 0.5,
      step: 0.01,
    },
    {
      type: "slider" as const,
      id: "timesteps",
      label: "Encoding timesteps",
      defaultValue: 100,
      min: 25,
      max: 200,
      step: 25,
    },
    {
      type: "slider" as const,
      id: "frameRate",
      label: "Frame rate (FPS)",
      defaultValue: 30,
      min: 1,
      max: 240,
      step: 1,
    },
    {
      type: "switch" as const,
      id: "isPaused",
      label: "Pause simulation",
      defaultValue: false,
    },
  ]

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

  const [networkStateHistory, setNetworkStateHistory] = useState<NetworkState[]>([network.networkState]);

  useEffect(() => {
    let correct = 0;
    let total = 0;
    let iteration = 0;
    
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;

    function runNetwork(timestamp: number) {
      if (simulationParameters.isPaused) {
        animationFrameId = requestAnimationFrame(runNetwork);
        return;
      }
      
      const sample = XOR_DATA[Math.floor(Math.random() * XOR_DATA.length)];
      const { networkState } = network.train(sample.inputs[0], sample.inputs[1], sample.target, iteration, total, correct);

      iteration += 1;
      const isCorrect = networkState.prediction === sample.target;
      correct += isCorrect ? 1 : 0;
      total += 1;

      setNetworkStateHistory(prevNetworkStateHistory => {
        const newHistory = [...prevNetworkStateHistory, {...networkState}];
        return newHistory.slice(-1000);
      });

      timeoutId = setTimeout(() => {
        animationFrameId = requestAnimationFrame(runNetwork);  
      }, 1000 / simulationParameters.frameRate);
    }

    animationFrameId = requestAnimationFrame(runNetwork);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [simulationParameters])

  const accuracyAndLossData = networkStateHistory.map((state, index) => ({
    iteration: index,
    accuracy: state.accuracy,
    loss: state.loss,
  })).slice(-100);

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <h1 className="text-2xl font-medium text-[#333333]">Spiking Neural Network Simulation</h1>
          <p className="text-sm text-[#666666] mb-4">This is a simple spiking neural network simulation that learns the XOR function.</p>
          <SimulationControls
            inputs={inputs}
            onChange={(values) => {
              setSimulationParameters(values as unknown as SimulationParams)
            }}
          />
        </div>
        <div className="md:col-span-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded p-2">
              <h2 className="text-lg font-medium text-[#333333]">Network Structure</h2>
              {networkStateHistory.length > 0 && <NetworkVisualization 
                data={networkStateHistory[networkStateHistory.length - 1]} 
                width={450}
                height={300}
              />}
            </div>          
            <div className="border rounded p-2">
              <h2 className="text-lg font-medium text-[#333333] mb-2">Spiking Activity</h2>
              <RealtimeSpikingPlot 
                data={networkStateHistory}
                width={450}
                height={300}
              /> 
            </div>
            <div className="border rounded p-2">
              <h2 className="text-lg font-medium text-[#333333] mb-2">Accuracy and Loss</h2>
              <PlotAccuracyAndLoss 
                data={accuracyAndLossData} 
                width={450}
                height={300}
              />
            </div>

            <div className="border rounded p-2">
              <h2 className="text-lg font-medium text-[#333333] mb-2">Weights</h2>
              <WeightsHistogram
                data1={networkStateHistory[networkStateHistory.length - 1].weights_input_to_hidden.flat()}
                data2={networkStateHistory[networkStateHistory.length - 1].weights_hidden_to_output.flat()}
                width={450}
                height={300}
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}