import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      credentials: "include", // ccookies/sessions
      headers: {
        "Content-Type": "application/json", //tell backend this is json data
      },
      body: JSON.stringify({ email, password }), //send email + password to the backend to check for login
    });

    //did login work?
    const data = await res.json();

    //if login worked:
    if (res.ok) {
      onLogin(); // notify App.jsx that user is logged in
      localStorage.setItem("userID", data.userID); //store the user logged in id
      //if login didnt work:
    } else {
      setError(data.error || "Login failed");
    }
  }

  return (
    <div className="flex items-center justify-center bg-gray-900 text-white">
      <div className="p-4 w-80 bg-gray-800 text-white rounded-lg">
        <h2 className="text-xl mb-4">Login</h2>

        {error && <p className="text-red-400 mb-2">{error}</p>}

        {/* email form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded text-white bg-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* password form */}
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded text-white bg-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="p-2 mt-2 bg-amber-700 rounded text-white cursor-pointer">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
