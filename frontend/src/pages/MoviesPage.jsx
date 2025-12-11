import { useEffect, useState, useCallback } from "react";
import "../App.css";
import MovieModal from "../components/MovieModal.jsx";
import MovieCard from "../components/MovieCard.jsx";
import fetchMovieDetailsModal from "../utils/fetchMovieDetails.js";
const BACKEND_URL = "http://localhost:5000";
const ENDPOINTS = {
  LOGOUT: "/logout",
  GET_MOVIES: "/getMovies",
  GET_DETAILS: "/getMovieDetails",
};

export default function MoviesPage({ swapPage, onLogout }) {
  const [movies, setMovies] = useState();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [displayedSearch, setDisplayedSearch] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [popButtonAsc, setPopButtonAsc] = useState(false);
  const [dateButtonAsc, setDateButtonAsc] = useState(false);
  const [activeButton, setActiveButton] = useState("");

  const fetchMovies = useCallback(async (query, pageNumber) => {
    try {
      const res = await fetch(`${BACKEND_URL}${ENDPOINTS.GET_MOVIES}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${query}`, page: `${pageNumber}` }),
      });

      if (!res.ok) throw new Error("Response Invalid.");
      const data = await res.json();

      if (data.movies.length > 0) {
        setMovies(data.movies);
      } else {
        setMovies();
      }
    } catch (err) {
      console.error("Error Fetching Movies: ", err);
    }
  }, []); // Empty array = function never changes
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
  const sortMovies = (movies, sortBy, ascending) => {
    return [...movies].sort((a, b) => {
      let aVal, bVal;
      if (sortBy === "popularity") {
        aVal = a.popularity;
        bVal = b.popularity;
      } else {
        aVal = new Date(a.release_date);
        bVal = new Date(b.release_date);
      }
      return ascending ? aVal - bVal : bVal - aVal;
    });
  };

  function popButton() {
    setActiveButton("popularity");
    const sorted = sortMovies(movies, "popularity", popButtonAsc);
    setMovies(sorted);
    setPopButtonAsc(!popButtonAsc);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      searchButton(searchText);
    }
  }

  function releaseDateButton() {
    setActiveButton("releaseDate");
    const sorted = sortMovies(movies, "date", dateButtonAsc);
    setMovies(sorted);
    setDateButtonAsc(!dateButtonAsc);
  }

  useEffect(() => {
    if (displayedSearch) {
      fetchMovies(displayedSearch, pageNumber);
    }
  }, [displayedSearch, pageNumber, fetchMovies]);

  async function handleLogout() {
    const res = await fetch(`${BACKEND_URL}${ENDPOINTS.LOGOUT}`, {
      method: "POST",
      credentials: "include",
    });

    onLogout();
  }

  function modalFetchPass(id) {
    fetchMovieDetailsModal(id, setSelectedMovie);
  }

  return (
    <>
      <div className="bg-gray-800 flex items-center justify-end w-full p-4">
        <div className="flex-1">
          <button className="cursor-pointer text-white bg-amber-700 p-2 rounded-lg" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <h1 className="flex-1 text-center text-white font-bold hidden md:block text-3xl">Simple Movie Site</h1>
        <div className="flex-1 flex md:gap-4 gap-2 justify-end">
          <input
            id="searchBar"
            type="text"
            className="bg-white p-2 rounded w-full"
            placeholder="Search movies..."
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
          <button
            className="text-white cursor-pointer flex justify-center items-center text-center bg-amber-700 p-2 rounded-md"
            onClick={() => {
              searchButton(searchText);
            }}>
            Search
          </button>
        </div>
      </div>
      <div className="flex box-border justify-center flex-col">
        <div className="w-1/6"></div>
        <div className="text-center flex justify-center items-center flex-col">
          {!movies ? (
            <div className="mb-5 mt-5">There are currently no search results to display.</div>
          ) : (
            <>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={popButton}
                  className={`${
                    activeButton === "popularity" ? "bg-amber-700" : "bg-gray-800"
                  } justify-center items-center rounded-xl p-2 flex cursor-pointer text-white`}>
                  Popularity |
                  {popButtonAsc ? (
                    <img
                      className="w-3 h-3 ml-1"
                      src="https://cdn-icons-png.flaticon.com/128/130/130906.png"
                      alt="Up Arrow"></img>
                  ) : (
                    <img
                      className="w-3 h-3 ml-1"
                      src="https://cdn-icons-png.flaticon.com/128/318/318426.png"
                      alt="Down Arrow"></img>
                  )}
                </button>
                <button
                  onClick={releaseDateButton}
                  className={`${
                    activeButton === "releaseDate" ? "bg-amber-700" : "bg-gray-800"
                  } justify-center items-center rounded-xl p-2 flex cursor-pointer text-white`}>
                  Release Date |
                  {dateButtonAsc ? (
                    <img
                      className="w-3 h-3 ml-1"
                      src="https://cdn-icons-png.flaticon.com/128/130/130906.png"
                      alt="Up Arrow"></img>
                  ) : (
                    <img
                      className="w-3 h-3 ml-1"
                      src="https://cdn-icons-png.flaticon.com/128/318/318426.png"
                      alt="Down Arrow"></img>
                  )}
                </button>
              </div>
              <div className="lg:min-w-4xl md:min-w-2xl md:max-w-5xl min-w-xs max-w-xs mx-auto cursor-pointer grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 box-border p-2">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} fetchMovieDetailsModal={modalFetchPass} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-1/6"></div>
        {selectedMovie && <MovieModal selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie} />}
        <div className="text-xs mb-15 text-center justify-center items-center flex flex-col">
          This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
          <img src="../../assets/tmdb.svg" alt="TMDB image" className="w-24 p-4 flex" />
        </div>
      </div>

      <div className="flex-col fixed bottom-0 left-1/2 transform -translate-x-1/2 flex  z-50 bg-gray-800 w-full justify-centeritems-center p-2">
        <div className="flex-row flex justify-between w-full gap-4">
          <button
            type="button"
            onClick={pageDecrease}
            className="bg-amber-700 cursor-pointer  text-white text-lg px-4 py-1.5 rounded-md flex items-center justify-center ">
            Previous Page
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <button
              type="button"
              onClick={swapPage}
              className="bg-amber-700 cursor-pointer text-white text-lg px-4 py-1.5 rounded-md flex items-center justify-center ">
              View Saved Movies
            </button>
          </div>
          <button
            type="button"
            onClick={pageIncrease}
            className="bg-amber-700 cursor-pointer text-white text-lg px-4 py-1.5 rounded-md flex items-center justify-center ">
            Next Page
          </button>
        </div>
      </div>
    </>
  );
}
