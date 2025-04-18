
export default class LIFNeuron {
  voltage: number;
  tau: number;
  threshold: number;
  reset: number;
  spike: boolean;
  refracting: number;
  refractoryTime: number;
  traceDecay: number;
  trace: number;

  constructor(tau = 10, threshold = 1.0, reset = 0.0, refractoryTime = 0, traceDecay = 0.9) {
    this.voltage = 0.0;
    this.tau = tau;
    this.threshold = threshold;
    this.reset = reset;
    this.spike = false;
    this.refracting = 0;
    this.refractoryTime = refractoryTime;
    this.trace = 0;
    this.traceDecay = traceDecay;
  }

  forward(inputCurrent: number) {
    if (this.refracting > 0) {
      this.refracting--;
      return false;
    }

    this.voltage = this.voltage * ( 1 - 1/this.tau ) + inputCurrent 
    this.spike = this.voltage > this.threshold;

    if (this.spike) {
      this.voltage = this.reset;
      this.refracting = this.refractoryTime;
      this.trace = 1.0;
    } else {
      this.trace = this.trace * this.traceDecay;
    }

    return this.spike;
  }
}