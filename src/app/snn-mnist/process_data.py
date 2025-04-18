import os
import matplotlib.pyplot as plt
import json
import numpy as np

def main():
    save_path = "reports"
    with open(f"{save_path}/training_results.json", "r") as f:
        data = json.load(f)
        
    weights_input_to_hidden_start = np.array(data["weights_input_to_hidden_start"])
    weights_hidden_to_output_start = np.array(data["weights_hidden_to_output_start"])
    weights_input_to_hidden_end = np.array(data["weights_input_to_hidden_end"])
    weights_hidden_to_output_end = np.array(data["weights_hidden_to_output_end"])

    weights_input_to_hidden_start_counts, weights_input_to_hidden_start_bin_edges = np.histogram(weights_input_to_hidden_start, bins=100)
    weights_hidden_to_output_start_counts, weights_hidden_to_output_start_bin_edges = np.histogram(weights_hidden_to_output_start, bins=100)
    weights_input_to_hidden_end_counts, weights_input_to_hidden_end_bin_edges = np.histogram(weights_input_to_hidden_end, bins=100)
    weights_hidden_to_output_end_counts, weights_hidden_to_output_end_bin_edges = np.histogram(weights_hidden_to_output_end, bins=100)

    binned_data = {
        "weights_input_to_hidden_start": {
            "counts": weights_input_to_hidden_start_counts.tolist(),
            "bin_edges": weights_input_to_hidden_start_bin_edges.tolist()
        },
        "weights_hidden_to_output_start": {
            "counts": weights_hidden_to_output_start_counts.tolist(),
            "bin_edges": weights_hidden_to_output_start_bin_edges.tolist()
        },
        "weights_input_to_hidden_end": {
            "counts": weights_input_to_hidden_end_counts.tolist(),
            "bin_edges": weights_input_to_hidden_end_bin_edges.tolist()
        },
        "weights_hidden_to_output_end": {
            "counts": weights_hidden_to_output_end_counts.tolist(),
            "bin_edges": weights_hidden_to_output_end_bin_edges.tolist()
        }
    }

    with open(os.path.join(save_path, "binned_data.json"), "w") as f:
        json.dump(binned_data, f)

if __name__ == "__main__":
  main()