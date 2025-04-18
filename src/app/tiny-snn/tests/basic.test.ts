import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { LIFNeuron, XORNetwork } from "../components/tiny-snn";
import { createXORTrainer, XOR_DATA } from "../components/training/xor-trainer";

// Skip the d3-related tests for now
// import { drawNetwork } from "../src/draw-network";

describe("Basic tests", () => {
  // Mock Date.now to ensure deterministic tests
  const originalDateNow = Date.now;
  
  beforeAll(() => {
    Date.now = () => 12345;
  });
  
  // Cleanup
  afterAll(() => {
    Date.now = originalDateNow;
  });
  
  test("XOR_DATA should contain the correct truth table", () => {
    expect(XOR_DATA).toEqual([
      { inputs: [0, 0], target: 0 },
      { inputs: [0, 1], target: 1 },
      { inputs: [1, 0], target: 1 },
      { inputs: [1, 1], target: 0 }
    ]);
  });
  
  test("LIFNeuron should initialize with correct properties", () => {
    const neuron = new LIFNeuron();
    expect(neuron.v).toBe(0);
    expect(neuron.spike).toBe(false);
    expect(typeof neuron.step).toBe("function");
  });
  
  test("XORNetwork should initialize with correct properties", () => {
    const network = new XORNetwork();
    expect(network.hidden.length).toBeGreaterThan(0);
    expect(network.output).toBeInstanceOf(LIFNeuron);
    expect(typeof network.forward).toBe("function");
    expect(typeof network.train).toBe("function");
  });
  
  test("createXORTrainer should return an AsyncGenerator", () => {
    const network = new XORNetwork();
    const trainer = createXORTrainer(network);
    expect(typeof trainer.next).toBe("function");
    expect(trainer[Symbol.asyncIterator]).toBeDefined();
  });
  
  // Skip the d3-related test as it requires a DOM environment
  /* 
  test("drawNetwork should handle null/empty input gracefully", () => {
    // Test with minimal valid input
    const result = drawNetwork({
      connections: [],
      neuronStates: {
        input: [],
        hidden: [],
        output: []
      }
    });
    
    // Just verify it returns something that looks like a d3 selection
    expect(result).toBeDefined();
    expect(typeof result.node).toBe("function");
  });
  */
});