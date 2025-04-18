import os
import numpy as np
from src.evaluate_model import evaluate_model
from src.lif_step import lif_step
from src.poisson_encode import poisson_encode_speed
from src.load_data import load_mnist_data
import argparse
import json
from src.config import (
    num_time_steps, 
    num_input_neurons,
    num_hidden_neurons, 
    num_output_neurons,
    membrane_decay, 
    learning_rate, 
    batch_size, 
    num_epochs
)

def main():
    parser = argparse.ArgumentParser(description="Train a spiking neural network on MNIST.")
    parser.add_argument("--fast", action="store_true", help="Enable fast mode for training.")
    args = parser.parse_args()

    # if args.fast:
    #     print("Fast mode enabled")
    #     num_epochs = 1
    #     batch_size = 64

    save_path = "reports"
    os.makedirs(save_path, exist_ok=True)

    train_loader, test_loader = load_mnist_data(batch_size)

    # if args.fast:
    #     print("Fast mode: Using only 1 samples for training and testing.")
    #     train_loader = [(image_batch[:1], label_batch[:1]) for image_batch, label_batch in train_loader]
    #     test_loader = [(image_batch[:1], label_batch[:1]) for image_batch, label_batch in test_loader]

    weights_input_to_hidden = np.random.normal(0, 0.1, size=(num_input_neurons, num_hidden_neurons))
    weights_hidden_to_output = np.random.normal(0, 0.1, size=(num_hidden_neurons, num_output_neurons))

    weights_input_to_hidden_start = weights_input_to_hidden.copy()
    weights_hidden_to_output_start = weights_hidden_to_output.copy()

    losses = []
    accuracies = []

    for epoch in range(num_epochs):
        print("Epoch:", epoch + 1)
        epoch_loss = 0
        num_batches = 0

        for batch_index, (image_batch, label_batch) in enumerate(train_loader):
            is_first_epoch_and_batch = (epoch == 0 and batch_index == 0)
            is_last_epoch_and_batch = (epoch == num_epochs - 1 and batch_index == len(train_loader) - 1)
            
            if is_first_epoch_and_batch:
                print("First batch of the first epoch")

            if is_last_epoch_and_batch:
                print("Last batch of the last epoch")

            image_batch = image_batch.squeeze(1)
            encoded_spikes = poisson_encode_speed(image_batch, num_time_steps).astype(float)
            
            membrane_potential_hidden = np.zeros((image_batch.shape[0], num_hidden_neurons))
            membrane_potential_output = np.zeros((image_batch.shape[0], num_output_neurons))
            output_spike_accumulator = np.zeros((image_batch.shape[0], num_output_neurons))
            grad_weights_input = np.zeros_like(weights_input_to_hidden)
            grad_weights_output = np.zeros_like(weights_hidden_to_output)
            spike_history_hidden = []
            input_current_history_hidden = []            

            for t in range(num_time_steps):
                current_input_hidden = encoded_spikes[:, t, :] @ weights_input_to_hidden
                spikes_hidden, membrane_potential_hidden, grad_hidden = lif_step(current_input_hidden, membrane_potential_hidden, membrane_decay)
                spike_history_hidden.append(spikes_hidden)
                input_current_history_hidden.append(current_input_hidden)

                current_input_output = spikes_hidden @ weights_hidden_to_output
                spikes_output, membrane_potential_output, grad_output = lif_step(current_input_output, membrane_potential_output, membrane_decay)
                
                output_spike_accumulator += spikes_output

            softmax_numerators = np.exp(output_spike_accumulator - np.max(output_spike_accumulator, axis=1, keepdims=True))
            probabilities = softmax_numerators / softmax_numerators.sum(axis=1, keepdims=True)

            one_hot_targets = np.zeros_like(probabilities)
            one_hot_targets[np.arange(len(label_batch)), label_batch.numpy()] = 1

            loss = -np.mean(np.sum(one_hot_targets * np.log(probabilities + 1e-9), axis=1))
            grad_logits = (probabilities - one_hot_targets) / batch_size

            for t in reversed(range(num_time_steps)):
                spikes_hidden = spike_history_hidden[t]
                input_current_hidden = input_current_history_hidden[t]
                current_input_output = spikes_hidden @ weights_hidden_to_output
                
                _, _, grad_output = lif_step(current_input_output, np.zeros_like(membrane_potential_output), membrane_decay)
                grad_output_current = grad_logits * grad_output
                grad_weights_output += spikes_hidden.T @ grad_output_current
                grad_spikes_hidden = grad_output_current @ weights_hidden_to_output.T

                _, _, grad_hidden = lif_step(input_current_hidden, np.zeros_like(membrane_potential_hidden), membrane_decay)
                grad_input_hidden = grad_spikes_hidden * grad_hidden
                grad_weights_input += encoded_spikes[:, t, :].T @ grad_input_hidden
            
            weights_input_to_hidden -= learning_rate * grad_weights_input
            weights_hidden_to_output -= learning_rate * grad_weights_output

            epoch_loss += loss
            num_batches += 1            

        avg_loss = epoch_loss / num_batches
        losses.append(avg_loss)

        accuracy = evaluate_model(test_loader, weights_input_to_hidden, weights_hidden_to_output)
        accuracies.append(accuracy)

        print(f"Epoch {epoch+1}, Loss: {avg_loss:.4f}, Accuracy: {accuracy:.2f}%")
    
    accuracy = evaluate_model(test_loader, weights_input_to_hidden, weights_hidden_to_output)    
    weights_hidden_to_output_end = weights_hidden_to_output.copy()
    weights_input_to_hidden_end = weights_input_to_hidden.copy()

    save_object = {
        "weights_input_to_hidden_start": weights_input_to_hidden_start.tolist(),
        "weights_hidden_to_output_start": weights_hidden_to_output_start.tolist(),
        "weights_input_to_hidden_end": weights_input_to_hidden_end.tolist(),
        "weights_hidden_to_output_end": weights_hidden_to_output_end.tolist(),
        "losses": losses,
        "accuracies": accuracies
    }

    with open(os.path.join(save_path, "training_results.json"), "w") as f:
        json.dump(save_object, f)

    print(f"Final Test Accuracy: {accuracy:.2f}%")

if __name__ == "__main__":
    main()
