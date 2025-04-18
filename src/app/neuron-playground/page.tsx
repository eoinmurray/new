"use client"
import React, { useState, useEffect, useRef } from 'react';
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
    dt: number,
    sweepStart: number,
    sweepEnd: number,
    sweepSteps: number,
}

function linspace(start: number, stop: number, num: number) {
  const result = [];
  const step = (stop - start) / (num - 1);
  for (let i = 0; i < num; i++) {
    result.push(start + step * i);
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

export default function SpikingNeuralNetworkPage() {
  const inputs = [
    {
      type: "select",
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
      type: "select",
      id: 'inputSignalType',
      label: "Input Signal Type",
      defaultValue: "pulse",
      options: [
        { label: "pulse", value: "pulse" },
        { label: "oscillating", value: "oscillating" },
      ]
    },
    {
      type: "slider",
      id: "timeSteps",
      label: "Time Steps",
      defaultValue: 200,
      min: 0,
      max: 1000,
      step: 1,
    },
    {
      type: "slider",
      id: "timeBetweenPulses",
      label: "Time between pulses (ms)",
      defaultValue: 20,
      min: 0,
      max: 200,
      step: 1,
    },
    {
      type: "slider",
      id: "amplitude",
      label: "Amplitude (μA/cm²)",
      defaultValue: 2,
      min: -50,
      max: 50,
      step: 0.1,
    },
    {
      type: "slider",
      id: "duration",
      label: "Pulse Duration (ms)",
      defaultValue: 10,
      min: 0,
      max: 200,
      step: 0.1,
    },
    {
      type: "slider",
      id: "frequency",
      label: "Frequency",
      defaultValue: 10,
      min: 0,
      max: 50,
      step: 0.1,
    },
    {
      type: "select",
      id: 'dt',
      label: "dt",
      defaultValue: 0.01,
      options: [
        { label: 0.001, value: 0.001 },
        { label: 0.01, value: 0.01 },
        { label: 0.1, value: 0.1 },
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
  ]

  const defaultSimulationParameters = {
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
  }

  const [simulationParameters, setSimulationParameters] = useState<SimulationParameters>(defaultSimulationParameters);

  const { current, time } = generateSignal(
    simulationParameters.inputSignalType,
    {
      time: simulationParameters.timeSteps,
      amplitude: simulationParameters.amplitude,
      distance_between: simulationParameters.timeBetweenPulses,
      duration: simulationParameters.duration,
      frequency: simulationParameters.frequency,
      dt: simulationParameters.dt
    }
  );
  
  const voltage = simulate({
    model: simulationParameters.neuronModel,
    current,
    dt: simulationParameters.dt
  })
  
  const voltageCurrentPlotData = time.map((t, i) => ({
    time: t,
    voltage: voltage[i],
    current: current[i],
  }));

  const sweepArray = linspace(simulationParameters.sweepStart, simulationParameters.sweepEnd, simulationParameters.sweepSteps);
  const numSpikes: number[] = []
  for (const sweepValue of sweepArray) {
    const { current: newCurrent, time: newTime } = generateSignal(
      simulationParameters.inputSignalType,
      {
        time: simulationParameters.timeSteps,
        amplitude: sweepValue,
        distance_between: simulationParameters.timeBetweenPulses,
        duration: simulationParameters.duration,
        frequency: simulationParameters.frequency,
        dt: simulationParameters.dt
      }
    );

    const voltage = simulate({
      model: simulationParameters.neuronModel,
      current: newCurrent,
      dt: simulationParameters.dt
    })

    numSpikes.push(countSpikes(voltage))
  }

  const sweepData = sweepArray.map((sweepValue, i) => ({
    amplitude: sweepValue,
    spikes: numSpikes[i],
  }));

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-[#333333]">Neuron Playground</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-8">
        <div className="md:col-span-1">
          <SimulationControls
            inputs={inputs}
            onChange={(values) => {
              setSimulationParameters(values)
            }}
          />
        </div>
        <div className="md:col-span-3 space-y-6">
          <VoltagePlot height={200} data={voltageCurrentPlotData} />
          <CurrentPlot height={200} data={voltageCurrentPlotData} />
          <SweepPlot height={200} data={sweepData} />
        </div>
    </div>
    </div>
  );
}