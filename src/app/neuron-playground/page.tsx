"use client"
import React, { useState, useMemo, useCallback } from 'react';
import SimulationControls from '@/components/simulation-controls';
import { generateSignal } from './components/signal-generator';
import { simulate } from './components/neuron';
import VoltagePlot from './components/voltage-plot'
import CurrentPlot from './components/current-plot';
import SweepPlot from './components/sweep-plot';

type SimulationParameters = {
    neuronModel: string,
    inputSignalType: "pulse" | "oscillating",
    timeSteps: number,
    timeBetweenPulses: number,
    amplitude: number,
    duration: number,
    frequency: number,
    dt: number | string,
    sweepStart: number,
    sweepEnd: number,
    sweepSteps: number,
}

function linspace(start: number, stop: number, num: number) {
  const result = new Array(num);
  const step = (stop - start) / (num - 1);
  for (let i = 0; i < num; i++) {
    result[i] = start + step * i;
  }
  return result;
}

function countSpikes(V: number[], threshold = 30) {
  let spikeCount = 0;
  for (let i = 1; i < V.length - 1; i++) {
    if (V[i - 1] < V[i] && V[i] > V[i + 1] && V[i] > threshold) {
      spikeCount++;
    }
  }
  return spikeCount;
}

const inputs = [
  {
    type: "select" as const,
    id: 'neuronModel',
    label: "Neuron Model",
    defaultValue: "HH",
    options: [
      { label: "HH", value: "HH" },
      { label: "LIF", value: "LIF" },
      { label: "IZHIKEVICH", value: "IZHIKEVICH" },
    ]
  },
  {
    type: "select" as const,
    id: 'inputSignalType',
    label: "Input Signal Type",
    defaultValue: "pulse",
    options: [
      { label: "pulse", value: "pulse" },
      { label: "oscillating", value: "oscillating" },
    ]
  },
  {
    type: "slider" as const,
    id: "timeSteps",
    label: "Time Steps",
    defaultValue: 200,
    min: 0,
    max: 1000,
    step: 1,
  },
  {
    type: "slider" as const,
    id: "timeBetweenPulses",
    label: "Time between pulses (ms)",
    defaultValue: 20,
    min: 0,
    max: 200,
    step: 1,
  },
  {
    type: "slider" as const,
    id: "amplitude",
    label: "Amplitude (μA/cm²)",
    defaultValue: 2,
    min: -50,
    max: 50,
    step: 0.1,
  },
  {
    type: "slider" as const,
    id: "duration",
    label: "Pulse Duration (ms)",
    defaultValue: 10,
    min: 0,
    max: 200,
    step: 0.1,
  },
  {
    type: "slider" as const,
    id: "frequency",
    label: "Frequency",
    defaultValue: 10,
    min: 0,
    max: 50,
    step: 0.1,
  },
  {
    type: "select" as const,
    id: 'dt',
    label: "dt",
    defaultValue: "0.01",
    options: [
      { label: "0.001", value: "0.001" },
      { label: "0.01", value: "0.01" },
      { label: "0.1", value: "0.1" },
    ]
  },
  {
    type: "slider" as const,
    id: "sweepStart",
    label: "Sweep Start",
    defaultValue: 0.1,
    min: -50,
    max: 50,
    step: 0.1,
  },
  {
    type: "slider" as const,
    id: "sweepEnd",
    label: "Sweep End",
    defaultValue: 5,
    min: -50,
    max: 50,
    step: 0.1,
  },
  {
    type: "slider" as const,
    id: "sweepSteps",
    label: "Sweep Steps",
    defaultValue: 20,
    min: 0,
    max: 20,
    step: 1,
  },
];

const defaultSimulationParameters: SimulationParameters = {
  neuronModel: "HH",
  inputSignalType: "pulse",
  timeSteps: 200,
  timeBetweenPulses: 20,
  amplitude: 2,
  duration: 10,
  frequency: 10,
  dt: 0.01,
  sweepStart: 0.1,
  sweepEnd: 5,
  sweepSteps: 20,
};

export default function SpikingNeuralNetworkPage() {
  const [simulationParameters, setSimulationParameters] = useState<SimulationParameters>(defaultSimulationParameters);
  
  // Memoize expensive calculations to prevent recalculating on every render
  const { current, time, voltage, voltageCurrentPlotData } = useMemo(() => {
    // Convert dt to number if it's a string
    const dt = typeof simulationParameters.dt === 'string' 
      ? parseFloat(simulationParameters.dt) 
      : simulationParameters.dt;
    
    const { current, time } = generateSignal(
      simulationParameters.inputSignalType,
      {
        time: simulationParameters.timeSteps,
        amplitude: simulationParameters.amplitude,
        distance_between: simulationParameters.timeBetweenPulses,
        duration: simulationParameters.duration,
        frequency: simulationParameters.frequency,
        dt
      }
    );
    
    const voltage = simulate({
      model: simulationParameters.neuronModel,
      current,
      dt
    });
    
    // Pre-compute plot data
    const plotData = new Array(time.length);
    for (let i = 0; i < time.length; i++) {
      plotData[i] = {
        time: time[i],
        voltage: voltage[i],
        current: current[i],
      };
    }
    
    return { current, time, voltage, voltageCurrentPlotData: plotData };
  }, [
    simulationParameters.inputSignalType,
    simulationParameters.timeSteps,
    simulationParameters.amplitude,
    simulationParameters.timeBetweenPulses,
    simulationParameters.duration,
    simulationParameters.frequency,
    simulationParameters.dt,
    simulationParameters.neuronModel
  ]);

  // Memoize sweep calculations 
  const sweepData = useMemo(() => {
    const sweepArray = linspace(
      simulationParameters.sweepStart, 
      simulationParameters.sweepEnd, 
      simulationParameters.sweepSteps
    );
    
    const result = new Array(sweepArray.length);
    
    // Convert dt to number if it's a string
    const dt = typeof simulationParameters.dt === 'string' 
      ? parseFloat(simulationParameters.dt) 
      : simulationParameters.dt;
      
    for (let i = 0; i < sweepArray.length; i++) {
      const sweepValue = sweepArray[i];
      const { current: newCurrent } = generateSignal(
        simulationParameters.inputSignalType,
        {
          time: simulationParameters.timeSteps,
          amplitude: sweepValue,
          distance_between: simulationParameters.timeBetweenPulses,
          duration: simulationParameters.duration,
          frequency: simulationParameters.frequency,
          dt
        }
      );

      const voltage = simulate({
        model: simulationParameters.neuronModel,
        current: newCurrent,
        dt
      });

      result[i] = {
        amplitude: sweepValue,
        spikes: countSpikes(voltage)
      };
    }
    
    return result;
  }, [
    simulationParameters.sweepStart,
    simulationParameters.sweepEnd,
    simulationParameters.sweepSteps,
    simulationParameters.inputSignalType,
    simulationParameters.timeSteps,
    simulationParameters.timeBetweenPulses,
    simulationParameters.duration,
    simulationParameters.frequency,
    simulationParameters.dt,
    simulationParameters.neuronModel
  ]);

  // Memoize parameter update handler
  const handleParameterChange = useCallback((values: Record<string, string | number | boolean>) => {
    // Convert dt from string to number if needed
    const dt = typeof values.dt === 'string' ? parseFloat(values.dt) : values.dt;
    
    setSimulationParameters(values as unknown as SimulationParameters);
  }, []);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-[#333333]">Neuron Playground</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8">
        <div className="md:col-span-1">
          <SimulationControls
            inputs={inputs}
            onChange={handleParameterChange}
          />
        </div>
        <div className="md:col-span-3 space-y-2">
          <VoltagePlot height={200} data={voltageCurrentPlotData} />
          <CurrentPlot height={200} data={voltageCurrentPlotData} />
          <SweepPlot height={200} data={sweepData} />
        </div>
      </div>
    </div>
  );
}