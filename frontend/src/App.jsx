import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import AppLayout from "./layouts/AppLayout";
import StartPage from "./pages/StartPage";
import UserLogin from "./pages/UserLogin";
import UserRegistration from "./pages/UserRegistration";
import HomePage from "./pages/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage";

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
        {/* Pages without navbar */}
        <Route path="/" element={<Navigate to="/start-page" />} />
        <Route path="/start-page" element={<StartPage />} />
        <Route path="/userlogin" element={<UserLogin />} />
        <Route
          path="/userregistration"
          element={<UserRegistration />}
        />

        {/* Pages with navbar */}
        <Route element={<AppLayout />}>
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/search" element={<PlaceholderPage title="Search" />} />
          <Route path="/library" element={<PlaceholderPage title="Library" />} />
          <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
          <Route path="/genres" element={<PlaceholderPage title="Genres" />} />
          <Route path="/movies/:movieId" element={<MovieDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;