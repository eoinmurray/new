import { describe, test, expect, beforeEach, beforeAll, afterAll } from "bun:test";
import { LIFNeuron, XORNetwork } from "../components/tiny-snn";

// Mock Date.now for tests
const originalDateNow = Date.now;

beforeAll(() => {
  Date.now = () => 12345;
});

// Cleanup after tests
afterAll(() => {
  Date.now = originalDateNow;
});

describe("LIFNeuron", () => {
  let neuron: LIFNeuron;
  
  beforeEach(() => {
    neuron = new LIFNeuron(10, 1.0, 0);
  });
  
  test("should initialize with default values", () => {
    expect(neuron.v).toBe(0);
    expect(neuron.tau).toBe(10);
    expect(neuron.threshold).toBe(1.0);
    expect(neuron.reset).toBe(0);
    expect(neuron.spike).toBe(false);
    expect(neuron.refractoryTime).toBe(0);
    expect(neuron.trace).toBe(0);
    expect(neuron.lastSpikeTime).toBe(-1);
    expect(neuron.isiHistory).toEqual([]);
  });
  
  test("should not spike when input is below threshold", () => {
    const result = neuron.step(0.5);
    expect(result).toBe(false);
    expect(neuron.spike).toBe(false);
    expect(neuron.v).toBeGreaterThan(0);
    // Due to the v = v * (1 - 1/tau) + input formula, v will be exactly 0.5 when tau=10 and input=0.5
    expect(neuron.v).toBeLessThanOrEqual(0.5);
  });
  
  test("should spike when input exceeds threshold", () => {
    const result = neuron.step(1.5);
    expect(result).toBe(true);
    expect(neuron.spike).toBe(true);
    expect(neuron.v).toBe(0); // Reset to 0
    expect(neuron.refractoryTime).toBe(3);
    expect(neuron.trace).toBe(1.0);
  });
});

describe("XORNetwork", () => {
  let network: XORNetwork;
  
  beforeEach(() => {
    network = new XORNetwork({
      hiddenSize: 4,
      learningRate: 0.1,
      timesteps: 10
    });
  });
  
  test("should initialize correctly", () => {
    expect(network.hiddenSize).toBe(4);
    expect(network.learningRate).toBe(0.1);
    expect(network.timesteps).toBe(10);
    expect(network.hidden.length).toBe(4);
    expect(network.output).toBeInstanceOf(LIFNeuron);
    expect(network.w_ih.length).toBe(4);
    expect(network.w_ho.length).toBe(4);
    expect(network.correct).toBe(0);
    expect(network.total).toBe(0);
  });
  
  test("forward should process inputs and return a prediction", () => {
    const result = network.forward(0, 0);
    
    expect(result).toHaveProperty("prediction");
    expect(typeof result.prediction).toBe("number");
    expect(result.prediction === 0 || result.prediction === 1).toBe(true);
    expect(result).toHaveProperty("spikes");
    expect(typeof result.spikes).toBe("number");
    expect(result).toHaveProperty("hiddenActivations");
    expect(Array.isArray(result.hiddenActivations)).toBe(true);
    expect(result).toHaveProperty("spikeHistory");
    expect(Array.isArray(result.spikeHistory)).toBe(true);
  });
  
  test("train should update weights and track statistics", () => {
    // Train on XOR pattern: 1,0 -> 1
    network.train(1, 0, 1);
    
    // Check that training updates statistics
    expect(network.total).toBe(1);
  });
  
  test("getAccuracy should calculate correct ratio", () => {
    // Train on a few examples
    network.train(0, 0, 0);
    network.train(0, 1, 1);
    
    const accuracy = network.getAccuracy();
    expect(accuracy).toBeGreaterThanOrEqual(0);
    expect(accuracy).toBeLessThanOrEqual(1);
    expect(accuracy).toBe(network.correct / network.total);
  });
  
  test("resetStats should clear statistics", () => {
    // Train on a few examples to accumulate stats
    network.train(0, 0, 0);
    network.train(0, 1, 1);
    
    expect(network.total).toBe(2);
    expect(network.inputStats["0,0"].total).toBeGreaterThan(0);
    
    // Reset stats
    network.resetStats();
    
    expect(network.correct).toBe(0);
    expect(network.total).toBe(0);
    expect(network.inputStats["0,0"].correct).toBe(0);
    expect(network.inputStats["0,0"].total).toBe(0);
    expect(network.inputStats["0,1"].correct).toBe(0);
    expect(network.inputStats["0,1"].total).toBe(0);
    expect(network.inputStats["1,0"].correct).toBe(0);
    expect(network.inputStats["1,0"].total).toBe(0);
    expect(network.inputStats["1,1"].correct).toBe(0);
    expect(network.inputStats["1,1"].total).toBe(0);
  });
});