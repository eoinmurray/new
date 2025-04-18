/**
 * Generates a current stimulus with pulses based on specified parameters.
 * 
 * @param time - The total simulation time in ms
 * @param amplitude - The amplitude of the current pulses
 * @param distance_between - The distance between pulses in ms
 * @param duration - The duration of each pulse in ms
 * @param dt - The time step size in ms (default: 0.1)
 * @returns An object containing the current values and time array
 */
export function generatePulse(
  time: number,
  amplitude: number,
  distance_between: number,
  duration: number,
  dt: number = 0.1
): { current: number[], time: number[] } {
  const steps = Math.floor(time / dt);
  const current: number[] = new Array(steps).fill(0);
  const timeArray: number[] = new Array(steps);

  // Generate time array
  for (let i = 0; i < steps; i++) {
    timeArray[i] = i * dt;
  }

  // Calculate how many time steps correspond to pulse duration and distance
  const pulseSteps = Math.floor(duration / dt);
  const distanceSteps = Math.floor(distance_between / dt);

  // Start after a small delay (10% of simulation time)
  let currentStep = Math.floor(steps * 0.1);

  // Generate pulses until we reach the end of the simulation
  while (currentStep + pulseSteps < steps) {
    for (let i = 0; i < pulseSteps && currentStep + i < steps; i++) {
      current[currentStep + i] = amplitude;
    }
    currentStep += pulseSteps + distanceSteps;
  }

  return { current, time: timeArray };
}

/**
 * Generates a current stimulus with oscillating pulses based on specified parameters.
 * 
 * @param time - The total simulation time in ms
 * @param amplitude - The amplitude of the oscillating current
 * @param frequency - The frequency of the oscillation in Hz
 * @param dt - The time step size in ms (default: 0.1)
 * @returns An object containing the current values and time array
 */
export function generateOscillating(
  time: number,
  amplitude: number,
  frequency: number,
  dt: number = 0.1
): { current: number[], time: number[] } {
  const steps = Math.floor(time / dt);
  const current: number[] = new Array(steps);
  const timeArray: number[] = new Array(steps);

  // Generate time array and oscillating current
  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    timeArray[i] = t;
    current[i] = amplitude * Math.sin(2 * Math.PI * frequency * t / 1000); // Convert ms to seconds
  }

  return { current, time: timeArray };
}

/**
 * Generates a current stimulus based on the specified input signal type and parameters.
 * 
 * @param inputSignalType - The type of input signal ('pulse' or 'oscillating')
 * @param params - The parameters required for the selected signal type
 * @returns An object containing the current values and time array
 */
export function generateSignal(
  inputSignalType: 'pulse' | 'oscillating',
  params: {
    time: number;
    amplitude: number;
    distance_between?: number;
    duration?: number;
    frequency?: number;
    dt?: number;
  }
): { current: number[], time: number[] } {
  if (inputSignalType === 'pulse') {
    if (params.distance_between === undefined || params.duration === undefined) {
      throw new Error("Missing parameters for 'pulse' signal type: 'distance_between' and 'duration' are required.");
    }
    return generatePulse(
      params.time,
      params.amplitude,
      params.distance_between,
      params.duration,
      params.dt ?? 0.1
    );
  } else if (inputSignalType === 'oscillating') {
    if (params.frequency === undefined) {
      throw new Error("Missing parameter for 'oscillating' signal type: 'frequency' is required.");
    }
    return generateOscillating(
      params.time,
      params.amplitude,
      params.frequency,
      params.dt ?? 0.1
    );
  } else {
    throw new Error("Invalid input signal type. Supported types are 'pulse' and 'oscillating'.");
  }
}