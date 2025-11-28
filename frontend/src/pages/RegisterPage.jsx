import { useState } from "react";

export default function RegisterPage({ onRegister }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    onRegister(); // logs them in after register
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg w-80 space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>

        {error && <p className="text-red-500">{error}</p>}

        <input
          className="w-full p-2 rounded bg-gray-700"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full p-2 rounded bg-gray-700"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 rounded bg-gray-700"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-amber-700 p-2 rounded">Create Account</button>
      </form>
    </div>
  );
}
