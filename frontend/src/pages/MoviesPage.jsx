import { useEffect, useState } from "react";
import "../App.css";
import MovieModal from "../components/MovieModal.jsx";
import MovieCard from "../components/MovieCard.jsx";

export default function MoviesPage({ onLogout }) {
  const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [displayedSearch, setDisplayedSearch] = useState(null);
  const [searchText, setSearchText] = useState("");

  function pageIncrease() {
    setPageNumber((prev) => prev + 1);
  }

  function pageDecrease() {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  }

  function searchButton(searchText) {
    setDisplayedSearch(searchText);
    setPageNumber(1);
  }

  useEffect(() => {
    //runs when either of the values passed in the array changes.
    if (displayedSearch) {
      fetchMovies(displayedSearch, pageNumber);
    }
  }, [displayedSearch, pageNumber]);

  async function handleLogout() {
    const res = await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });

    onLogout();
  }

  async function fetchMovies(query, pageNumber) {
    try {
      const res = await fetch("http://localhost:5000/getMovies", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: `${query}`, page: `${pageNumber}` }),
      });

      if (!res.ok) throw new Error("Response Invalid.");

      const data = await res.json();

      setMovies(data.movies);
    } catch (err) {
      console.error("Error Fetching Movies: ", err);
    }
  }
  async function fetchMovieDetails(id) {
    const res = await fetch("http://localhost:5000/getMovieDetails", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: `${id}` }),
    });

    if (!res.ok) throw new Error("Response Invalid.");

    const data = await res.json();

    setSelectedMovie(data.movie);
  }

  return (
    <>
      <div className="bg-amber-600 flex items-center justify-end w-full p-4">
        <div className="flex-1">
          <button className="cursor-pointer bg-white p-2 rounded-lg" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <h1 className="flex-1 text-center text-white font-bold text-3xl">Simple Movie Site</h1>
        <div className="flex-1 flex gap-4 justify-end">
          <input
            id="searchBar"
            type="text"
            className="bg-white p-2 rounded"
            placeholder="Search movies..."
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            className="cursor-pointer flex justify-center items-center text-center bg-slate-200 p-2 rounded-md"
            onClick={() => {
              searchButton(searchText);
            }}>
            Search
          </button>
        </div>
      </div>
      <div className="flex box-border">
        <div className="w-1/6"></div>

        <div className="min-w-4xl max-w-5xl mx-auto cursor-pointer grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 box-border p-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} fetchMovieDetails={fetchMovieDetails} />
          ))}
        </div>

        <div className="w-1/6"></div>
        {selectedMovie && <MovieModal selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie} />}
      </div>
      <div className="text-xs mb-14 text-center">
        This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
      </div>

      <div className="flex-col fixed bottom-0 left-1/2 transform -translate-x-1/2 flex  z-50 bg-amber-700 w-full justify-center items-center p-2">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={pageDecrease}
            className="bg-amber-800 cursor-pointer  text-white text-lg px-4 py-1.5 rounded-md flex items-center justify-center ">
            Previous Page
          </button>
          <button
            type="button"
            onClick={pageIncrease}
            className="bg-amber-800 cursor-pointer text-white text-lg px-4 py-1.5 rounded-md flex items-center justify-center ">
            Next Page
          </button>
        </div>
      </div>
      <div className="fixed bottom-0 right-0 text-white z-100">
        <img src="../../assets/tmdb.svg" alt="TMDB image" className="w-32 p-4" />
      </div>
    </>
  );
}
