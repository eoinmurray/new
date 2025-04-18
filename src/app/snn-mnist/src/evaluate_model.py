import numpy as np
from src.lif_step import lif_step
from src.poisson_encode import poisson_encode_speed
from src.load_data import load_mnist_data

def evaluate_model(data_loader, weights_input_to_hidden, weights_hidden_to_output, 
                  num_time_steps, num_hidden_neurons, num_output_neurons,
                  membrane_decay, surrogate_grad_steepness):
    correct_predictions = 0
    total_samples = 0
    all_predictions = []
    all_labels = []
    all_spike_rates = []

    for images, labels in data_loader:
        images = images.squeeze(1)
        encoded_spikes = poisson_encode_speed(images, num_time_steps).astype(float)

        membrane_potential_hidden = np.zeros((images.shape[0], num_hidden_neurons))
        membrane_potential_output = np.zeros((images.shape[0], num_output_neurons))
        output_spike_accumulator = np.zeros((images.shape[0], num_output_neurons))

        for t in range(num_time_steps):
            current_input_hidden = encoded_spikes[:, t, :] @ weights_input_to_hidden
            spikes_hidden, membrane_potential_hidden, _ = lif_step(current_input_hidden, membrane_potential_hidden, membrane_decay, surrogate_grad_steepness)

            current_input_output = spikes_hidden @ weights_hidden_to_output
            spikes_output, membrane_potential_output, _ = lif_step(current_input_output, membrane_potential_output, membrane_decay, surrogate_grad_steepness)

            output_spike_accumulator += spikes_output

        predictions = np.argmax(output_spike_accumulator, axis=1)
        correct_predictions += (predictions == labels.numpy()).sum()
        total_samples += len(labels)
        
        all_predictions.extend(predictions)
        all_labels.extend(labels.numpy())
        all_spike_rates.append(output_spike_accumulator / num_time_steps)

    accuracy = 100 * correct_predictions / total_samples
    print(f"Test Accuracy: {accuracy:.2f}%")
    
    return accuracy, all_predictions, all_labels, np.vstack(all_spike_rates)