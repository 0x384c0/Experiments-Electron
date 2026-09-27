import { Navigate, Route, Routes } from "react-router-dom";
import { HomeLayout, type HomeTab } from "../features/home/ui/HomeLayout";
import { WeatherScreen } from "../features/weather/ui/WeatherScreen";
import { ForecastDetailsScreen } from "../features/weather/ui/ForecastDetailsScreen";
import { QuestionsScreen } from "../features/questions/ui/QuestionsScreen";
import { QuestionDetailsScreen } from "../features/questions/ui/QuestionDetailsScreen";

const tabs: HomeTab[] = [
  { label: "Weather", path: "/weather" },
  { label: "Questions", path: "/questions" },
];

// the Router itself (Hash for desktop, Browser for web) is wired per shell in main.tsx
export function App() {
  return (
    <Routes>
      <Route element={<HomeLayout tabs={tabs} />}>
        <Route index element={<Navigate to="/weather" replace />} />
        <Route path="weather" element={<WeatherScreen />} />
        <Route path="weather/:dateEpoch" element={<ForecastDetailsScreen />} />
        <Route path="questions" element={<QuestionsScreen />} />
        <Route path="questions/:id" element={<QuestionDetailsScreen />} />
      </Route>
    </Routes>
  );
}
