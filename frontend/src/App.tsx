import { useEffect, useState } from "react";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { getCurrentUser } from "./services/api";
import { User } from "./types";

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    if (window.location.pathname !== "/login") {
      window.history.replaceState({}, "", "/login");
    }
    return <Login />;
  }

  if (window.location.pathname !== "/dashboard") {
    window.history.replaceState({}, "", "/dashboard");
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
};

export default App;
