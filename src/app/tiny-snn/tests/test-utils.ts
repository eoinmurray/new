/**
 * Utility functions for testing the SNN code
 */

// Mock for d3 in Node environment
export function setupD3Mock() {
  // Mock for SVG elements in d3
  const mockSvgElement = {
    setAttribute: () => {},
    appendChild: () => mockSvgElement,
    getAttribute: () => "",
    getBBox: () => ({ x: 0, y: 0, width: 100, height: 100 }),
    style: { baseVal: { value: "" } }
  };
  
  // Mock document for D3 operations
  const mockDocument = {
    createElementNS: () => mockSvgElement,
    createElement: () => ({
      getContext: () => ({
        measureText: () => ({ width: 10 }),
        fillText: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        fill: () => {}
      })
    })
  };
  
  // Add mock document to global scope if needed
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = mockDocument as any;
  }
  
  // Add window.requestAnimationFrame if needed
  if (typeof globalThis.requestAnimationFrame === 'undefined') {
    globalThis.requestAnimationFrame = (callback) => {
      return setTimeout(callback, 0);
    };
  }
  
  // Add window.cancelAnimationFrame if needed
  if (typeof globalThis.cancelAnimationFrame === 'undefined') {
    globalThis.cancelAnimationFrame = (id) => {
      clearTimeout(id);
    };
  }
  
  return mockDocument;
}

// Helper to create a mock XORNetwork
export function createMockXORNetwork() {
  return {
    hiddenSize: 3,
    learningRate: 0.1,
    timesteps: 10,
    hidden: Array(3).fill(0).map(() => ({
      v: 0,
      tau: 10,
      threshold: 1.0,
      reset: 0,
      spike: false,
      refractoryTime: 0,
      trace: 0,
      lastSpikeTime: -1,
      isiHistory: [],
      step: () => false
    })),
    output: {
      v: 0,
      tau: 10,
      threshold: 1.0,
      reset: 0,
      spike: false,
      refractoryTime: 0,
      trace: 0,
      lastSpikeTime: -1,
      isiHistory: [],
      step: () => false
    },
    w_ih: Array(3).fill(0).map(() => [0.1, -0.2, 0.3]),
    w_ho: [0.4, -0.5, 0.6],
    spikeHistory: [],
    currentTime: 0,
    globalTime: 0,
    correct: 0,
    total: 0,
    inputStats: {
      "0,0": { correct: 0, total: 0 },
      "0,1": { correct: 0, total: 0 },
      "1,0": { correct: 0, total: 0 },
      "1,1": { correct: 0, total: 0 }
    },
    forward: () => ({
      prediction: 0,
      spikes: 0,
      hiddenActivations: [0, 0, 0],
      spikeHistory: []
    }),
    train: () => ({
      prediction: 0,
      spikes: 0,
      hiddenActivations: [0, 0, 0],
      spikeHistory: []
    }),
    getAccuracy: () => 0,
    resetStats: () => {},
    printStats: () => {}
  };
}

// Helper function to create a mock training data object
export function createMockTrainerData() {
  return {
    step: 0,
    accuracy: 0.5,
    history: Array(10).fill(0).map((_, i) => ({ 
      step: i, 
      accuracy: 0.5 + (i / 20), 
      loss: 0.5 - (i / 20)
    })),
    connections: [
      { source: "input-0", target: "hidden-0", weight: 0.5 },
      { source: "input-1", target: "hidden-0", weight: -0.3 },
      { source: "hidden-0", target: "output-0", weight: 0.8 }
    ],
    neuronStates: {
      input: [
        { id: "input-0", spike: true },
        { id: "input-1", spike: false }
      ],
      hidden: [
        { id: "hidden-0", spike: true }
      ],
      output: [
        { id: "output-0", spike: false, prediction: 0 }
      ]
    },
    allSpikeHistory: Array(20).fill(0).map((_, i) => ({
      globalTime: i,
      neuronId: ["input-0", "input-1", "hidden-0", "output-0"][i % 4],
      layer: ["input", "input", "hidden", "output"][i % 4],
      pattern: "[0,1]",
      target: 1
    })),
    weightHistory: {
      input_hidden: Array(10).fill(0).map((_, i) => ({
        step: i,
        i: i % 3,
        j: i % 3,
        weight: 0.1 + (i / 100),
        change: 0.01,
        globalTime: i
      })),
      hidden_output: Array(10).fill(0).map((_, i) => ({
        step: i,
        i: i % 3,
        weight: 0.2 + (i / 100),
        change: 0.02,
        globalTime: i
      }))
    },
    result: {
      prediction: 1,
      spikes: 2,
      hiddenActivations: [1, 0, 1],
      spikeHistory: [],
      input1: 0,
      input2: 1,
      target: 1
    }
  };
}