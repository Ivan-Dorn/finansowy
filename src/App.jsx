import { useEffect, useState } from "react";

import AuthGate from "./components/AuthGate";
import { FinanceProvider } from "./context/FinanceContext";

import { supabase } from "./lib/supabase";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");

  const [backgroundImage, setBackgroundImage] =
    useState(() => {
      return (
        localStorage.getItem(
          "finansowy_background"
        ) || "/background.jpg"
      );
    });

  useEffect(() => {
    if (backgroundImage) {
      localStorage.setItem(
        "finansowy_background",
        backgroundImage
      );
    }
  }, [backgroundImage]);

  function handleBackgroundChange(file) {
    if (
      !file ||
      !file.type.startsWith("image/")
    ) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setBackgroundImage(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function removeBackground() {
    setBackgroundImage("/background.jpg");
  }

  const appStyle = backgroundImage
    ? {
        "--app-background-image": `url("${backgroundImage}")`,
      }
    : {};

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthGate>
      <FinanceProvider>
        <div
          className="app has-background"
          style={appStyle}
        >
          <div className="background-image" />
          <div className="background-overlay" />

          <Sidebar
            page={page}
            setPage={setPage}
          />

          <main className="main">
            <Header page={page} />

            {page === "dashboard" && (
              <Dashboard setPage={setPage} />
            )}

            {page === "sales" && <Sales />}

            {page === "expenses" && (
              <Expenses />
            )}

            {page === "reports" && (
              <Reports />
            )}

            {page === "settings" && (
              <Settings
                backgroundImage={backgroundImage}
                onBackgroundChange={
                  handleBackgroundChange
                }
                onRemoveBackground={
                  removeBackground
                }
                onLogout={handleLogout}
              />
            )}
          </main>
        </div>
      </FinanceProvider>
    </AuthGate>
  );
}

export default App;