import LIFNeuron from "./lif-neuron";

export interface NetworkState {
  iteration: number;
  input: number[];
  hiddenLayer: {
    voltage: number;
    spike: boolean;
    trace: number;
  }[];
  output: {
    voltage: number;
    spike: boolean;
    trace: number;
  };
  weights_input_to_hidden: number[][];
  weights_hidden_to_output: number[][];
  target: number;
  prediction: number;
  loss: number;
  accuracy: number;
}

export class TinySNN {
  hiddenSize: number;
  learningRate: number;
  timesteps: number;
  hiddenLayer: LIFNeuron[];
  output: LIFNeuron;
  weights_input_to_hidden: number[][];
  weights_hidden_to_output: number[][];
  networkState: NetworkState;

  constructor({ hiddenSize, learningRate, timesteps } = {
    hiddenSize: 4,
    learningRate: 0.01,
    timesteps: 20,
  }) {
    this.hiddenSize = hiddenSize;
    this.learningRate = learningRate;
    this.timesteps = timesteps;

    this.hiddenLayer = Array.from({ length: this.hiddenSize }, () => new LIFNeuron())
    this.output = new LIFNeuron();
    
    // TODO: why this array shape, come back to this
    this.weights_input_to_hidden = Array(this.hiddenSize).fill(0).map(() => [
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ]);

    this.weights_hidden_to_output = Array(this.hiddenSize).fill(0).map(() => [
      (Math.random() - 0.5) * 2,
    ]);
    
    // Initialize network state
    this.networkState = {
      iteration: 0,
      input: [0, 0],
      hiddenLayer: Array(this.hiddenSize).fill(0).map(() => ({
        voltage: 0,
        spike: false,
        trace: 0
      })),
      output: {
        voltage: 0,
        spike: false,
        trace: 0
      },
      weights_input_to_hidden: this.weights_input_to_hidden,
      weights_hidden_to_output: this.weights_hidden_to_output,
      target: 0,
      prediction: 0,
      loss: 0,
      accuracy: 0,
    };
  }

  forward(input1: number, input2: number) {
    this.hiddenLayer.forEach((neuron, i) => {
      neuron.voltage = 0;
      neuron.refractoryTime = 0;
      neuron.trace = 0;
    })

    this.output.voltage = 0;
    this.output.refractoryTime = 0;
    this.output.trace = 0;
    let outputSpikes = 0;

    for (let t=0; t < this.timesteps; t++) {
      const hiddenSpikes = this.hiddenLayer.map((neuron, i) => {
        const netInput = 
          input1 * this.weights_input_to_hidden[i][0] +
          input2 * this.weights_input_to_hidden[i][1];

        const spike = neuron.forward(netInput);
        
        return spike;
      });

      const netOutput = hiddenSpikes.reduce((acc, spike, i) => {
        return acc + (spike ? this.weights_hidden_to_output[i][0] : 0);
      }, 0);

      const outputSpike = this.output.forward(netOutput);

      if (outputSpike) {
        outputSpikes++;
      }
    }
    
    return outputSpikes >= this.timesteps * 0.2 ? 1 : 0;
  }

  train(input1: number, input2: number, target: number, iteration: number, total: number = 0, correct: number = 0) {
    const prediction = this.forward(input1, input2);
    const error = target - prediction;

    for (let i = 0; i < this.hiddenSize; i++) {
      if (this.hiddenLayer[i].trace > 0.1) {
        this.weights_hidden_to_output[i][0] += this.learningRate * error * this.hiddenLayer[i].trace;
      }
    }

    for (let i = 0; i < this.hiddenSize; i++) {
      if (this.hiddenLayer[i].trace > 0.1 && this.output.trace > 0.1) {
        this.weights_input_to_hidden[i][0] += this.learningRate * error * input1 * this.hiddenLayer[i].trace * this.output.trace;
        this.weights_input_to_hidden[i][1] += this.learningRate * error * input2 * this.hiddenLayer[i].trace * this.output.trace;
      }
    }

    this.networkState.iteration = iteration;
    this.networkState.input = [input1, input2];
    this.networkState.target = target;
    this.networkState.prediction = prediction;
    this.networkState.weights_input_to_hidden = this.weights_input_to_hidden;
    this.networkState.weights_hidden_to_output = this.weights_hidden_to_output;

    this.networkState.hiddenLayer = this.hiddenLayer.map((neuron, i) => ({
      voltage: neuron.voltage,
      spike: neuron.spike,
      trace: neuron.trace
    }));

    this.networkState.output = {
      voltage: this.output.voltage,
      spike: this.output.spike,
      trace: this.output.trace
    };

    this.networkState.loss = (target - prediction)**2;
    this.networkState.accuracy = total === 0 ? 0 : correct / total;

    return { networkState: this.networkState };
  }
}