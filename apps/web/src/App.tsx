import { useCounterStore } from "./store";

function App() {
  const { count, increment } = useCounterStore();

  return (
    <div>
      <h1>Hello World from Web</h1>
      <button onClick={increment}>count is {count}</button>
    </div>
  );
}

export default App;
