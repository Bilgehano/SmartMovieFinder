import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";

function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;