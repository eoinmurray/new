"use client"
import { useEffect, useState } from 'react';

const Slider = ({ min, max, step, value, onValueChange, id }) => {
  const percentage = ((value[0] - min) / (max - min)) * 100;
  
  return (
    <div className="relative">
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value[0]} 
        onChange={(e) => onValueChange([parseFloat(e.target.value)])}
        id={id}
        className="w-full h-1 bg-gray-200 rounded appearance-none cursor-pointer focus:outline-none"
        style={{
          background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

const Label = ({ htmlFor, children }) => {
  return (
    <label 
      htmlFor={htmlFor} 
      className="flex justify-between text-xs font-medium text-gray-700 mb-1"
    >
      {children}
    </label>
  );
};

const Switch = ({ id, checked, onCheckedChange }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
    </label>
  );
};

export default function SimulationControls({ onChange }) {
  const [hiddenSize, setHiddenSize] = useState(8);
  const [learningRate, setLearningRate] = useState(0.05);
  const [timesteps, setTimesteps] = useState(100);
  const [frameRate, setFrameRate] = useState(30);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    onChange?.({
      hiddenSize,
      learningRate,
      timesteps,
      frameRate,
      isPaused,
    });
  }, [hiddenSize, learningRate, timesteps, frameRate, isPaused, onChange]);

  return (
    <div className="space-y-4">
      <div className="control-group p-2 rounded hover:border-indigo-200 transition">
        <Label htmlFor="hidden-size">
          <span>Hidden layer size</span>
          <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono text-xs">{hiddenSize}</span>
        </Label>
        <Slider
          id="hidden-size"
          min={2}
          max={20}
          step={1}
          value={[hiddenSize]}
          onValueChange={([val]) => setHiddenSize(val)}
        />
      </div>

      <div className="control-group p-2 rounded hover:border-indigo-200 transition">
        <Label htmlFor="learning-rate">
          <span>Learning rate</span>
          <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono text-xs">{learningRate.toFixed(2)}</span>
        </Label>
        <Slider
          id="learning-rate"
          min={0.01}
          max={0.5}
          step={0.01}
          value={[learningRate]}
          onValueChange={([val]) => setLearningRate(val)}
        />
      </div>

      <div className="control-group p-2 rounded hover:border-indigo-200 transition">
        <Label htmlFor="timesteps">
          <span>Encoding timesteps</span>
          <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono text-xs">{timesteps}</span>
        </Label>
        <Slider
          id="timesteps"
          min={25}
          max={200}
          step={25}
          value={[timesteps]}
          onValueChange={([val]) => setTimesteps(val)}
        />
      </div>

      <div className="control-group p-2 rounded hover:border-indigo-200 transition">
        <Label htmlFor="frame-rate">
          <span>Frame rate (FPS)</span>
          <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-mono text-xs">{frameRate}</span>
        </Label>
        <Slider
          id="frame-rate"
          min={1}
          max={240}
          step={1}
          value={[frameRate]}
          onValueChange={([val]) => setFrameRate(val)}
        />
      </div>

      <div className="flex items-center justify-between p-2 rounded hover:border-indigo-200 transition">
        <div>
          <span className="block text-xs font-medium text-gray-700">Simulation state</span>
          <span className={`text-xs ${isPaused ? 'text-amber-600' : 'text-green-600'}`}>
            {isPaused ? 'Paused' : 'Running'}
          </span>
        </div>
        <Switch
          id="pause-switch"
          checked={isPaused}
          onCheckedChange={setIsPaused}
        />
      </div>
      
      <button 
        onClick={() => {
          setHiddenSize(8);
          setLearningRate(0.05);
          setTimesteps(100);
          setFrameRate(30);
          setIsPaused(false);
        }}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-2 rounded transition text-xs"
      >
        Reset Parameters
      </button>
    </div>
  );
}
