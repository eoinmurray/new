
import { simulateHH } from './hh_neuron';
import { simulateLIF } from './lif_neuron';
import { simulateIzhikevich } from './izhikevich_neuron';

export function simulate({
  model,
  current,
  dt
}: {
  model: string;
  current: number[] | number;
  dt: number;
}) {
  // Handle both array and single value
  const currentArray = Array.isArray(current) ? current : Array(1000).fill(current);
  
  if (model === "HH") {
    return simulateHH(currentArray, dt)
  } else if (model === "LIF") {
    return simulateLIF(currentArray, dt, 10.0, 1.0).V
  } else {
    // Check Izhikevich implementation for what it expects
    return simulateIzhikevich(currentArray, dt).V
  }
}