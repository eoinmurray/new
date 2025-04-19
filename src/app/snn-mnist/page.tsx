"use client";
import binned_data from "./reports/binned_data.json";
import training_results from "./reports/training_results.json";
import spike_encoding_data from "./reports/spike_encoding_data.json";
import Histogram from "./components/histogram";
import LinePlot from "./components/line-plot";
import StackedLinePlot from "./components/stacked-line-plot";
import SpikeEncodingPlots from "./components/spike-encoding-plots";
import Slides from "./components/slides";

export default function Page() {
  return (
    <div>
      <Slides>
        <div>      
          <SpikeEncodingPlots 
            data={spike_encoding_data[2]}
            title="Spike Encoding"
            width={600}
            height={600}
          />
        </div>

          <StackedLinePlot
            data1={training_results.grad_norms.input}
            data2={training_results.grad_norms.output}
            title="Gradient Norms"
            width={800}
            height={600}
          />

          <LinePlot
            data={training_results.accuracies}
            title="Accuracy"
            width={800}
            height={600}
            xLabel="Time"
            yLabel="Accuracy"
          />

          <LinePlot
            data={training_results.losses}
            title="Loss"
            width={800}
            height={600}
            xLabel="Time"
            yLabel="Losses"
          />

          <div className="grid grid-cols-2 gap-4">
            <Histogram
              counts={binned_data.weights_input_to_hidden_start.counts}
              bins={binned_data.weights_input_to_hidden_start.bin_edges}
              title="Weights Input to Hidden Start"
              width={600}
              height={600}
              xLabel="Value"
              yLabel="Counts"
            />
            <Histogram
              counts={binned_data.weights_input_to_hidden_end.counts}
              bins={binned_data.weights_input_to_hidden_end.bin_edges}
              title="Weights Input to Hidden End"
              width={600}
              height={600}
              xLabel="Value"
              yLabel="Counts"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Histogram
              counts={binned_data.weights_hidden_to_output_start.counts}
              bins={binned_data.weights_hidden_to_output_start.bin_edges}
              title="Weights Hidden to Output Start"
              width={600}
              height={600}
              xLabel="Value"
              yLabel="Counts"
            />
            <Histogram
              counts={binned_data.weights_hidden_to_output_end.counts}
              bins={binned_data.weights_hidden_to_output_end.bin_edges}
              title="Weights Hidden to Output End"
              width={600}
              height={600}
              xLabel="Value"
              yLabel="Counts"
            />
          </div>

      </Slides>
    </div>
  )
}