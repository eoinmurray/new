export function simulateHH(
    I: number[],   // input current in mA/nF
    dt: number,    // time step in ms, e.g., 0.001
    V0: number = 0 // initial voltage in mV
): number[] {
    const T = I.length;
    const V: number[] = new Array(T).fill(0);
    const m: number[] = new Array(T).fill(0);
    const h: number[] = new Array(T).fill(0);
    const n: number[] = new Array(T).fill(0);

    // Updated HH parameters from assignment
    const gNa = 120, gK = 36, gL = 0.3;
    const eNa = 115, eK = -12, eL = 10.6;
    const Cm = 1.0; // nF

    // Rate functions (assignment definitions)
    const alphaM = (V: number) => {
        const denom = Math.exp(2.5 - 0.1 * V) - 1;
        return Math.abs(denom) < 1e-6 ? 1.0 : (2.5 - 0.1 * V) / denom;
    };
    const betaM = (V: number) => 4 * Math.exp(-V / 18);
    const alphaH = (V: number) => 0.07 * Math.exp(-V / 20);
    const betaH = (V: number) => 1 / (Math.exp(3 - 0.1 * V) + 1);
    const alphaN = (V: number) => {
        const denom = Math.exp(1 - 0.1 * V) - 1;
        return Math.abs(denom) < 1e-6 ? 0.1 : (0.1 - 0.01 * V) / denom;
    };
    const betaN = (V: number) => 0.125 * Math.exp(-V / 80);

    // Initial conditions
    V[0] = V0;
    m[0] = alphaM(V0) / (alphaM(V0) + betaM(V0));
    h[0] = alphaH(V0) / (alphaH(V0) + betaH(V0));
    n[0] = alphaN(V0) / (alphaN(V0) + betaN(V0));

    // Euler integration
    for (let t = 1; t < T; t++) {
        const Vm = V[t - 1];

        const am = alphaM(Vm), bm = betaM(Vm);
        const ah = alphaH(Vm), bh = betaH(Vm);
        const an = alphaN(Vm), bn = betaN(Vm);

        m[t] = m[t - 1] + dt * (am * (1 - m[t - 1]) - bm * m[t - 1]);
        h[t] = h[t - 1] + dt * (ah * (1 - h[t - 1]) - bh * h[t - 1]);
        n[t] = n[t - 1] + dt * (an * (1 - n[t - 1]) - bn * n[t - 1]);

        const INa = gNa * m[t] ** 3 * h[t] * (Vm - eNa);
        const IK  = gK * n[t] ** 4 * (Vm - eK);
        const IL  = gL * (Vm - eL);

        V[t] = Vm + dt * (1 / Cm) * (I[t] - INa - IK - IL);
    }

    return V;
}
