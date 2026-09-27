import { HelloWorldScreen } from "../features/hello-world/ui/HelloWorldScreen";

// composes feature screens. gains a router here once there's a second one.
export function App() {
  return <HelloWorldScreen />;
}
