import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import AppLayout from "./layouts/AppLayout";
import StartPage from "./pages/StartPage";
import UserLogin from "./pages/UserLogin";
import UserRegistration from "./pages/UserRegistration";
import GenreSelection from "./pages/GenreSelection";
import UserProfile from "./pages/UserProfile";
import HomePage from "./pages/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import MovieSearchPage from "./pages/MovieSearchPage";
import UserLibraryPage from "./pages/UserLibraryPage";
import MovieGraphPage from "./pages/MovieGraphPage";

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
        <Route path="/userregistration" element={<UserRegistration />} />
        <Route path="/genreselection" element={<GenreSelection />} />

        {/* Pages with navbar */}
        <Route element={<AppLayout />}>
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/search" element={<MovieSearchPage />} />
          <Route path="/graph" element={<MovieGraphPage />} />
          <Route path="/library" element={<UserLibraryPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/movies/:movieId" element={<MovieDetailPage />} />
          <Route path="/movies/:movieId/graph" element={<MovieGraphPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;