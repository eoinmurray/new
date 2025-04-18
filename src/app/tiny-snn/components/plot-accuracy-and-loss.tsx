import React from "react";
import * as Plot from "@observablehq/plot";
import { NetworkState } from "./network-visualization";

export default function PlotAccuracyAndLoss ({ networkStateHistory }: {
  networkStateHistory: NetworkState[]
}) {
  // const plotRef = React.useRef<HTMLDivElement>(null);

  // const updatePlot = React.useCallback(() => {
  //   if (plotRef.current) {
  //     const plot = Plot.plot({
  //       // width: 500,
  //       height: 200,
  //       marks: [
  //         Plot.line(networkStateHistory, { x: "iteration", y: "accuracy", stroke: "#4F46E5" }),
  //         Plot.line(networkStateHistory, { x: "iteration", y: "loss", stroke: "#EF4444" }),
  //       ],
  //       x: { 
  //         label: "Iteration",
  //         tickFormat: (d) => d.toString()
  //       },
  //       y: { 
  //         label: "Value",
  //         grid: true 
  //       },
  //       style: {
  //         fontSize: 12,
  //         background: "transparent"
  //       },
  //       color: { 
  //         legend: true,
  //         domain: ["accuracy", "loss"],
  //         range: ["#4F46E5", "#EF4444"] 
  //       },
  //     });

  //     plotRef.current.innerHTML = "";
  //     plotRef.current.appendChild(plot);
  //   }
  // }, [networkStateHistory]);

  // React.useEffect(() => {
  //   updatePlot();
  // }, [networkStateHistory, updatePlot]);

  return (
    // <div 
    //   ref={plotRef}
    // />
    <pre>
      {JSON.stringify(networkStateHistory, null, 2)}
    </pre>
  );
};
