import { describe, test, expect, beforeEach, beforeAll, afterAll } from "bun:test";
import { XORNetwork } from "../components/tiny-snn";
import { createXORTrainer, XOR_DATA } from "../components/training/xor-trainer";

// Mock Date.now for tests
const originalDateNow = Date.now;

beforeAll(() => {
  Date.now = () => 12345;
});

afterAll(() => {
  Date.now = originalDateNow;
});

describe("XOR_DATA", () => {
  test("should contain the correct XOR truth table", () => {
    expect(XOR_DATA).toEqual([
      { inputs: [0, 0], target: 0 },
      { inputs: [0, 1], target: 1 },
      { inputs: [1, 0], target: 1 },
      { inputs: [1, 1], target: 0 }
    ]);
  });
});

describe("createXORTrainer", () => {
  let network: XORNetwork;
  let trainer: AsyncGenerator<any, void, unknown>;
  
  beforeEach(() => {
    network = new XORNetwork({
      hiddenSize: 3,
      learningRate: 0.1,
      timesteps: 10
    });
    
    // Create trainer with no frame delay for faster tests
    trainer = createXORTrainer(network, 0);
  });
  
  test("should create a valid async generator", () => {
    expect(typeof trainer.next).toBe("function");
    expect(trainer[Symbol.asyncIterator]).toBeDefined();
  });
  
  test("generator should yield valid training data", async () => {
    const { value, done } = await trainer.next();
    
    expect(done).toBe(false);
    
    // Check for required properties
    expect(value).toHaveProperty("step", 0);
    expect(value).toHaveProperty("result");
    expect(value).toHaveProperty("network", network);
    expect(value).toHaveProperty("accuracy");
    expect(value).toHaveProperty("history");
    expect(value).toHaveProperty("connections");
    expect(value).toHaveProperty("neuronStates");
    expect(value).toHaveProperty("allSpikeHistory");
    expect(value).toHaveProperty("weightHistory");
    
    // Check result properties
    expect(value.result).toHaveProperty("prediction");
    expect(value.result).toHaveProperty("spikes");
    expect(value.result).toHaveProperty("hiddenActivations");
    expect(value.result).toHaveProperty("spikeHistory");
    expect(value.result).toHaveProperty("input1");
    expect(value.result).toHaveProperty("input2");
    expect(value.result).toHaveProperty("target");
    
    // Check that neuronStates has the correct structure
    expect(value.neuronStates).toHaveProperty("input");
    expect(value.neuronStates).toHaveProperty("hidden");
    expect(value.neuronStates).toHaveProperty("output");
    expect(Array.isArray(value.neuronStates.input)).toBe(true);
    expect(Array.isArray(value.neuronStates.hidden)).toBe(true);
    expect(Array.isArray(value.neuronStates.output)).toBe(true);
    
    // Check connections structure
    const expectedConnectionCount = (2 * network.hiddenSize) + network.hiddenSize; // (input-to-hidden) + (hidden-to-output)
    expect(value.connections.length).toBe(expectedConnectionCount);
    expect(value.connections[0]).toHaveProperty("source");
    expect(value.connections[0]).toHaveProperty("target");
    expect(value.connections[0]).toHaveProperty("weight");
  });
  
  test("network should have pattern tracking properties after training", async () => {
    // Run a single training step
    const { value } = await trainer.next();
    
    // Network should have pattern tracking properties added by the trainer
    expect(network).toHaveProperty("lastOutputResults");
    expect(Array.isArray(network.lastOutputResults)).toBe(true);
    
    expect(network).toHaveProperty("patternActivity");
    expect(Object.keys(network.patternActivity).length).toBe(4); // Four XOR patterns
    
    // expect(network).toHaveProperty("recentPatterns");
    // expect(Array.isArray(network.recentPatterns)).toBe(true);
  });
});