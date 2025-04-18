# Tiny SNN (Spiking Neural Network)

A small, educational implementation of a spiking neural network in TypeScript.

## Overview

This project implements a basic spiking neural network (SNN) for educational purposes. It includes:

- Different neuron models:
  - Leaky Integrate-and-Fire (LIF) neurons
  - Izhikevich neurons
  - Hodgkin-Huxley neurons
- An XOR network implementation for demonstrating basic learning
- Training utilities for the XOR problem
- Visualization tools for network activity, weights, and performance

## Installation

```bash
# Install dependencies
bun install
```

## Usage

This project is designed to be run in an Observable-like environment, as shown in the `index.md` file. You can:

1. View the interactive demo in an Observable notebook
2. Import the modules in your own TypeScript projects

## Testing

```bash
# Run all tests
bun test

# Run specific tests
bun test tests/basic.test.ts
```

## Understanding the Code

### Core Components

- `src/tiny-snn.ts`: Contains the LIFNeuron and XORNetwork implementations
- `src/neurons/`: Contains different neuron model implementations
- `src/training/`: Contains training utilities
- `src/visualizations/`: Contains visualization tools

### Known Issues

The D3.js visualization components in `draw-network.ts` require a DOM environment to function properly and will throw errors if run in a non-browser environment. In the `index.md` notebook, this is handled by the notebook environment.

## License

MIT