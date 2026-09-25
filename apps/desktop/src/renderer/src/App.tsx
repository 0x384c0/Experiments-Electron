import { useCounterStore } from "./store";

function App() {
  const { count, increment } = useCounterStore();

  return (
    <div>
      <h1>Hello World from Electron Desktop</h1>
      <p>platform: {window.api.platform}</p>
      <button onClick={increment}>count is {count}</button>
    </div>
  );
}

export default App;
