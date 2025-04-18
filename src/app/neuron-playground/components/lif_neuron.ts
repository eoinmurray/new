interface SimulationResult {
    V: number[];
    S: number[];
}

export function simulateLIF(
    I: number[],  // input current over time
    dt: number,
    tau: number,
    threshold: number,
    V0: number = 0.0
): SimulationResult {
    const T = I.length;
    const V: number[] = new Array(T).fill(0);
    const S: number[] = new Array(T).fill(0);

    V[0] = V0;
    const dtTau = dt / tau;

    for (let t = 1; t < T; t++) {
        // Update membrane potential
        V[t] = V[t - 1] + dtTau * (-V[t - 1] + I[t]);

        // Spike check
        if (V[t] >= threshold) {
            S[t] = 1;
            V[t] = 0;  // reset after spike
        }
    }

    return { V, S };
}
