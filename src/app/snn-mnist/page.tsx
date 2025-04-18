"use client";
import binned_data from "./reports/binned_data.json";
import training_results from "./reports/training_results.json";
import spike_encoding_data from "./reports/spike_encoding_data.json";
import Histogram from "./components/histogram";
import LinePlot from "./components/line-plot";
import StackedLinePlot from "./components/stacked-line-plot";
import SpikeEncodingPlots from "./components/spike-encoding-plots";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">SNN MNIST</h1>
      <h2 className="text-xl font-semibold mb-2">Binned Data</h2>
      <p className="mb-4">This page displays the binned data from the SNN MNIST experiment.</p>

      <SpikeEncodingPlots 
        data={spike_encoding_data[2]}
        title="Spike Encoding"
        width={400}
        height={200}
      />      

      <StackedLinePlot
        data1={training_results.grad_norms.input}
        data2={training_results.grad_norms.output}
        title="Gradient Norms"
        width={400}
        height={200}
      />

      <div className="grid grid-cols-2 gap-4">
        <LinePlot 
          data={training_results.accuracies}
          title="Accuracy"
          width={400}
          height={200}
        />

        <LinePlot 
          data={training_results.losses}
          title="Loss"
          width={400}
          height={200}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Histogram 
          counts={binned_data.weights_input_to_hidden_start.counts}
          bins={binned_data.weights_input_to_hidden_start.bin_edges}
          title="Weights Input to Hidden Start"
        />
        <Histogram 
          counts={binned_data.weights_input_to_hidden_end.counts}
          bins={binned_data.weights_input_to_hidden_end.bin_edges}
          title="Weights Input to Hidden End"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Histogram 
          counts={binned_data.weights_hidden_to_output_start.counts}
          bins={binned_data.weights_hidden_to_output_start.bin_edges}
          title="Weights Hidden to Output Start"
        />
        <Histogram 
          counts={binned_data.weights_hidden_to_output_end.counts}
          bins={binned_data.weights_hidden_to_output_end.bin_edges}
          title="Weights Hidden to Output End"
        />
      </div>
    </div>
  )
}