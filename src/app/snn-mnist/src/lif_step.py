import numpy as np

def lif_step(input_current, membrane_potential, membrane_decay, surrogate_grad_steepness):
    membrane_potential = membrane_decay * membrane_potential + input_current
    spikes = membrane_potential > 1.0    
    delta = membrane_potential - 1.0
    exp_term = np.exp(-surrogate_grad_steepness * delta)
    grad_surrogate = surrogate_grad_steepness * exp_term / (1.0 + exp_term) ** 2
    
    membrane_potential[spikes] = 0.0
    return spikes.astype(float), membrane_potential, grad_surrogate

