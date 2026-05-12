import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import StartPage from "./pages/StartPage";

function PlaceholderPage({ title }) {
  return (
    <main className="placeholder-page">
      <h1>{title}</h1>
      <p>This page will be built later.</p>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/start-page" />} />
        <Route path="/start-page" element={<StartPage />} />

        <Route path="/userlogin" element={<PlaceholderPage title="Login" />} />
        <Route path="/userregistration" element={<PlaceholderPage title="Sign Up" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;