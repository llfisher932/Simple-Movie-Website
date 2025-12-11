import express from "express"; //a minimal, flexible Node.js web framework for building HTTP servers and APIs. It provides routing, middleware support, request/response helpers, etc.
import cors from "cors"; //adds Cross-Origin Resource Sharing headers so browsers will allow requests from other origins (e.g., your React app at http://localhost:3000 calling http://localhost:5000).
import { pool } from "./db.js"; //an instance of pg.Pool (Postgres connection pool) created using the pg package, used to run database queries.
import bcrypt from "bcrypt"; //for registering users (hashing passwords) and for verifying passwords at login (comparing hashes).
import dotenv from "dotenv"; //.env variables loaded
import session from "express-session";

dotenv.config();

const app = express(); //creates express app instance and assigns it to app.
const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.use(cors({ origin: "http://localhost:5173", credentials: true })); //need to lock down before upload, fine for now.
app.use(express.json());

// Enable sessions (keeps users logged in)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
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

  res.json({ success: true, userID: `${user.id}` });
});
// get reviews (: means everytthing form that point on is the movieID I want)
app.get("/getreviews/:movieID", async (req, res) => {
  const { movieID } = req.params; //pull ID from URL

  try {
    const result = await pool.query(
      "SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.movie_id = $1 ORDER BY r.created_at DESC",
      [movieID]
    );

    res.json({ reviews: result.rows });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Database error" });
  }
});
//new review logic
app.post("/addreview", async (req, res) => {
  const { movieID, reviewText, reviewNumber } = req.body; //received from frontend
  const userID = req.session.userId; //express session stores the userID the whole time they are logged in.
  if (!userID) {
    return res.status(400).json({ error: "Missing userID (user not logged in)" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO reviews (user_id, movie_id, review_text, review_number) VALUES ($1, $2, $3, $4) returning *",
      [userID, movieID, reviewText, reviewNumber]
    );

    res.json({ success: true, review: result.rows[0] });
  } catch (err) {
    console.error("Review insert error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

//watch later logic
app.post("/watchlater", async (req, res) => {
  const { movieID } = req.body; //received from frontend
  const userID = req.session.userId; //express session stores the userID the whole time they are logged in.
  if (!userID) {
    return res.status(400).json({ error: "Missing userID (user not logged in)" });
  }

  try {
    const result = await pool.query("INSERT INTO saved_movies (user_id, movie_id) VALUES ($1, $2) returning *", [
      userID,
      movieID,
    ]);

    res.json({ success: true, review: result.rows[0] });
  } catch (err) {
    console.error("Watch Later Insert error:", err);
    res.status(500).json({ error: "Movie already in watch later!" });
  }
});

//watch later remove logic
app.post("/removewatchlater", async (req, res) => {
  const { movieID } = req.body; //received from frontend
  const userID = req.session.userId; //express session stores the userID the whole time they are logged in.
  if (!userID) {
    return res.status(400).json({ error: "Missing userID (user not logged in)" });
  }

  try {
    const result = await pool.query("DELETE FROM saved_movies WHERE user_id = $1 AND movie_id = $2 RETURNING *", [
      userID,
      movieID,
    ]);

    res.json({ success: true, review: result.rows[0] });
  } catch (err) {
    console.error("Watch Later Deletion error:", err);
    res.status(500).json({ error: "Movie not in watch later!" });
  }
});

//get saved movies logic
app.post("/getSavedMovies", async (req, res) => {
  const userID = req.session.userId; //express session stores the userID the whole time they are logged in.
  if (!userID) {
    return res.status(400).json({ error: "Missing userID (user not logged in)" });
  }
  try {
    const result = await pool.query("SELECT movie_id FROM saved_movies WHERE user_id = $1 ORDER BY saved_at DESC", [
      userID,
    ]);

    res.json({ movies: result.rows });
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ error: "Database error" });
  }
});

//register logic
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  //check for any fields that didnt get sent
  if (!username || !email || !password) return res.status(400).json({ error: "All fields required" });

  try {
    //hashed password (12 is more secure but slower)
    const hashed = await bcrypt.hash(password, 10);

    //add this new user to the database
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashed]
    );

    //set the current session userID to their newly assigned userID from the database (uses SERIAL)
    req.session.userId = result.rows[0].id;
    //return message that it was successful
    res.json({ message: "Registered successfully" });
  } catch (err) {
    //not a new user
    if (err.code === "23505") return res.status(400).json({ error: "User already exists" });
    //some other error
    return res.status(500).json({ error: "Server error" });
  }
});

// logout logic
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }

    res.clearCookie("connect.sid"); // default session cookie name
    res.json({ message: "Logged out" });
  });
});

app.post("/getMovies", async (req, res) => {
  const { query, page } = req.body;

  //check for any fields that didnt get sent
  if (!query || !page) return res.status(400).json({ error: "All fields required" });

  try {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
      query
    )}&include_adult=false&language=en-US&page=${page}`;
    const result = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    });

    if (!result.ok) {
      return res.status(500).json({ error: "TMDB API failed" });
    }

    const data = await result.json();

    res.json({
      movies: data.results
        .filter((movie) => {
          if (movie.release_date) {
            return true;
          } else {
            return false;
          }
        })
        .sort((a, b) => {
          return b.popularity - a.popularity;
        }),
    });
  } catch (err) {
    //some error
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/getMovieDetails", async (req, res) => {
  const { id } = req.body;

  //check for any fields that didnt get sent
  if (!id) return res.status(400).json({ error: "All fields required" });

  try {
    const url = `https://api.themoviedb.org/3/movie/${id}`;
    const result = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    });

    if (!result.ok) {
      return res.status(500).json({ error: "TMDB API failed" });
    }

    const data = await result.json();

    res.json({ movie: data });
  } catch (err) {
    //some error
    return res.status(500).json({ error: "Server error" });
  }
});

// start server
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
