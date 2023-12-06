import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CoursePage, LandingPage } from "./pages";
import { RecoilRoot } from "recoil";

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/course" element={<CoursePage />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
