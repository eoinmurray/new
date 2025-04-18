import numpy as np

def poisson_encode_speed(images, num_time_steps):
    """
    Optimised Poisson encoder for performance.
    """
    images = images.numpy()
    images = images.reshape(images.shape[0], -1)
    spike_probabilities = np.repeat(images[:, None, :], num_time_steps, axis=1)
    return np.random.rand(*spike_probabilities.shape) < spike_probabilities

def poisson_encode_loops(images, num_time_steps):
    """
    Loop‑based Poisson encoder for clarity, not performance.
    """
    arr = images.numpy()
    batch_size, h, w = arr.shape
    arr = arr.reshape(batch_size, -1)  # (B, P)
    num_pixels = arr.shape[1]

    spikes = np.zeros((batch_size, num_time_steps, num_pixels), dtype=bool)

    for b in range(batch_size):
        for t in range(num_time_steps):
            for p in range(num_pixels):
                prob = arr[b, p]
                if np.random.rand() < prob:
                    spikes[b, t, p] = True

    return spikes
