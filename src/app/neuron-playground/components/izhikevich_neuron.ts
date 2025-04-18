// Izhikevich neuron model
// Parameters:
// a: time scale of recovery variable u
// b: sensitivity of recovery variable to membrane potential
// c: after-spike reset value of membrane potential
// d: after-spike increment of recovery variable

export interface SimulationResult {
    V: number[];
    S: number[];
}

export function simulateIzhikevich(
    I: number[],  // input current over time
    dt: number,   // time step
    a: number = 0.02,
    b: number = 0.2,
    c: number = -65,
    d: number = 8,
    V0: number = -65
): SimulationResult {
    const n = I.length;
    const V = new Array(n).fill(0);
    const S = new Array(n).fill(0);
    
    V[0] = V0;
    let u = b * V0;
    
    for (let i = 1; i < n; i++) {
        // Update membrane potential
        let dv = (0.04 * V[i-1] * V[i-1] + 5 * V[i-1] + 140 - u + I[i-1]) * dt;
        let du = a * (b * V[i-1] - u) * dt;
        
        V[i] = V[i-1] + dv;
        u = u + du;
        
        // Check for spike
        if (V[i] >= 30) {
            V[i] = c;
            u += d;
            S[i] = 1;
        }
    }
    
    return { V, S };
}