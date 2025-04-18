import React, { useRef, useEffect, useMemo } from "react";
import * as Plot from "@observablehq/plot";
import { NetworkState } from "./tiny-snn";

type SpikeEvent = {
  iteration: number;
  neuron: string;
};

function flattenSpikes(data: NetworkState[]): SpikeEvent[] {
  const events: SpikeEvent[] = [];
  data.forEach((state) => {
    // input layer spikes
    state.input.forEach((_, i) => {
      if (state.input[i] === 1) {
        events.push({ iteration: state.iteration, neuron: `input ${i}` });
      }
    });
    // hidden layer spikes
    state.hiddenLayer.forEach((h, i) => {
      if (h.spike) {
        events.push({ iteration: state.iteration, neuron: `hidden ${i}` });
      }
    });
    // output spike
    if (state.output.spike) {
      events.push({ iteration: state.iteration, neuron: "output" });
    }
  });
  return events;
}

export default function RealtimeSpikingPlot({
  data,
  width = 700,
  height = 500,
}: {
  data: NetworkState[];
  width?: number;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // derive static neuron labels from the first state so y-axis stays fixed
  const neuronLabels = useMemo(() => {
    if (data.length === 0) return [];
    const { input, hiddenLayer } = data[0];
    const labels: string[] = [];
    input.forEach((_, i) => labels.push(`input ${i}`));
    hiddenLayer.forEach((_, i) => labels.push(`hidden ${i}`));
    labels.push("output");
    return labels;
  }, [data]);

  useEffect(() => {
    if (!containerRef.current) return;

    // sliding window: last 100 states
    const windowData = data.slice(-100);
    if (windowData.length === 0) {
      containerRef.current.innerHTML = "";
      return;
    }

    const spikes = flattenSpikes(windowData);
    const iterations = windowData.map((s) => s.iteration);
    const xDomain: [number, number] = [
      Math.min(...iterations),
      Math.max(...iterations),
    ];

    const plot = Plot.plot({
      width,
      height,
      marginLeft: 80,
      marginBottom: 40,
      marginRight: 20,
      marginTop: 20,
      x: {
        label: "Iteration",
        domain: xDomain,
        labelOffset: 8,
      },
      y: {
        label: "Neuron",
        domain: neuronLabels,
        tickSize: 0,
        padding: 0.5,
        labelOffset: 8,
      },
      style: {
        // backgroundColor: "#FAFAFA",
        color: "#333333",
        fontFamily: "var(--font-mono)",
      },
      marks: [
        Plot.tickX(spikes, {
          x: "iteration",
          y: "neuron",
          stroke: "#555555",
          strokeWidth: 2,
        }),
      ],
    });

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(plot);
  }, [data, neuronLabels]);

  return <div ref={containerRef} />;
}
