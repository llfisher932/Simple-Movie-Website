import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MoviesPage from "./pages/MoviesPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      const res = await fetch("http://localhost:5000/me", {
        credentials: "include",
      });

      const data = await res.json();
      setIsLoggedIn(data.loggedIn);
      setLoading(false);
    }

    checkLogin();
  }, []);

  if (isLoggedIn) return <MoviesPage onLogout={() => setIsLoggedIn(false)} />;

  return (
    <>
      {showRegister ? (
        <RegisterPage onRegister={() => setIsLoggedIn(true)} />
      ) : (
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      )}

      <div className="w-full text-center text-white bottom-2 fixed flex justify-center items-center bg-gray-900">
        {showRegister ? (
          <button
            className="text-white cursor-pointer"
            onClick={() => setShowRegister(false)}
          >
            Already have an account? Login
          </button>
        ) : (
          <button
            className="text-white cursor-pointer"
            onClick={() => setShowRegister(true)}
          >
            Need an account? Register
          </button>
        )}
      </div>
    </>
  );
}
