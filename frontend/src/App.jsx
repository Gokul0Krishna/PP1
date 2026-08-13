import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Library from "./pages/Library";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      <Navbar page={page} onNavigate={setPage} />
      <main className="container">
        {page === "home" ? <Home /> : <Library />}
      </main>
    </>
  );
}

export default App;
