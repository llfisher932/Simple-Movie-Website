import express from "express"; //a minimal, flexible Node.js web framework for building HTTP servers and APIs. It provides routing, middleware support, request/response helpers, etc.
import cors from "cors"; //adds Cross-Origin Resource Sharing headers so browsers will allow requests from other origins (e.g., your React app at http://localhost:3000 calling http://localhost:5000).
import { pool } from "./db.js"; //an instance of pg.Pool (Postgres connection pool) created using the pg package, used to run database queries.
import bcrypt from "bcrypt"; //for registering users (hashing passwords) and for verifying passwords at login (comparing hashes).
import jwt from "jsonwebtoken"; //when a user logs in, you generate a signed token jwt.sign(payload, secret, options) and send it to the client; client includes it in future requests (Authorization: Bearer <token>).
import dotenv from "dotenv"; //.env variables loaded
import session from "express-session";

dotenv.config();

const app = express(); //creates express app instance and assigns it to app.

app.use(cors({ origin: "http://localhost:5173", credentials: true })); //need to lock down before upload, fine for now.
app.use(express.json());

// Enable sessions (keeps users logged in)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true only if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

//checks if already logged in on the login page.
app.get("/me", (req, res) => {
  if (!req.session.userId) {
    //session cookie
    return res.status(401).json({ loggedIn: false });
  }

  return res.json({ loggedIn: true });
});

//login logic
app.post("/login", async (req, res) => {
  const { email, password } = req.body; //received from frontend

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

  const user = result.rows[0]; //first result in users, which since email is unique there will only be 1 results

  if (!user) return res.status(400).json({ error: "Invalid credentials" }); //if user doesnt exist based on email, invalid credentials

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) return res.status(400).json({ error: "Invalid credentials" }); //if user does exist, but the password didnt match, invalid credentiials

  // Save login session so we know were logged in now
  req.session.userId = user.id;

  res.json({ success: true });
});

//register logic
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) return res.status(400).json({ error: "All fields required" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashed]
    );

    req.session.userId = result.rows[0].id;
    res.json({ message: "Registered successfully" });
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "User already exists" });

    res.status(500).json({ error: "Server error" });
  }
});

// logou logic
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // default session cookie name
    res.json({ message: "Logged out" });
  });
});

// start server
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
