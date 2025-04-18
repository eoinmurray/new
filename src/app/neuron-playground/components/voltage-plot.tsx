import React from "react";
import * as Plot from "@observablehq/plot";

export default function VoltagePlot ({ data, width = 700, height = 500 }: {
  data: {
    time: number,
    voltage: number,
    current: number
  }[],
  width?: number;
  height?: number;
}) {
  const plotRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (plotRef.current) {
      const plot = Plot.plot({
        marks: [
          Plot.line(data, { x: "time", y: "voltage", stroke: '#555555', strokeWidth: 2 }),
          // Plot.line(data, { x: "time", y: "current", stroke: '#999999', strokeWidth: 2, strokeDasharray: "4,2" }),
        ],
        x: { 
          label: "Iteration",
          tickFormat: (d) => d.toString(),
          labelOffset: 8,
        },
        y: { 
          labelOffset: 8,
        },
        style: {

          color: "#333333",
          fontFamily: "var(--font-mono)",
        },
        grid: true,
        marginBottom: 40,
        marginLeft: 40,
        marginRight: 20,
        marginTop: 20,
        width,
        height,
      });

      plotRef.current.innerHTML = "";
      plotRef.current.appendChild(plot);
    }
  }, [data]);

  return (
    <div 
      ref={plotRef}
    />
  );
};
