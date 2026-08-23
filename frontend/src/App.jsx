import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Library from "./pages/Library";
import { checkServerStatus } from "./api";
import "./App.css";

function App() {
  const [page, setPage] = useState("landing");
  const [serverOnline, setServerOnline] = useState(false);

  useEffect(() => {
    const pingServer = async () => {
      try {
        await checkServerStatus();
        setServerOnline(true);
      } catch {
        setServerOnline(false);
      }
    };
    pingServer();
    const interval = setInterval(pingServer, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar page={page} onNavigate={setPage} serverOnline={serverOnline} />
      <main className="container">
        {page === "landing" ? (
          <LandingPage onNavigateToLibrary={() => setPage("library")} />
        ) : (
          <Library onNavigateToLanding={() => setPage("landing")} />
        )}
      </main>
    </>
  );
}

export default App;

