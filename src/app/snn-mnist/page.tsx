import data from './reports/training_results.json';
import Histogram from './components/histogram';

export default function Page() {
  return (
    <div>
      SNN MNIST

      <pre>
        {JSON.stringify(data.weights_input_to_hidden_start.flat, null, 2)}
      </pre>

      <Histogram data={data.weights_input_to_hidden_start.flat()} />
    </div>
  )
}