import os

# Model hyperparameters
num_time_steps = 100
num_input_neurons = 784
num_hidden_neurons = 100
num_output_neurons = 10
membrane_decay = 0.95
learning_rate = 1e-2
batch_size = 128
num_epochs = 5
surrogate_grad_steepness = 5.0
