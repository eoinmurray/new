
import { simulateHH } from './hh_neuron';
import { simulateLIF } from './lif_neuron';
import { simulateIzhikevich } from './izhikevich_neuron';

export function simulate({
  model,
  current,
  dt
}) {
  if (model === "HH") {
    return simulateHH(current, dt)
  } else if (model === "LIF") {
    return simulateLIF(current, dt, 10.0, 1.0).V
  } else {
    return simulateIzhikevich(current, dt).V
  }
}