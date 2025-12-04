import { useEffect, useState } from "react";
import "../App.css";
import MovieModal from "../components/MovieModal.jsx";
import MovieCard from "../components/MovieCard.jsx";

export default function MoviesPage({ onLogout }) {
  const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
  const [movies, setMovies] = useState();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [displayedSearch, setDisplayedSearch] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [popButtonAsc, setPopButtonAsc] = useState(false);
  const [dateButtonAsc, setDateButtonAsc] = useState(false);
  const [activeButton, setActiveButton] = useState("");

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

  function popButton() {
    setActiveButton("popularity");
    if (popButtonAsc) {
      setMovies(
        [...movies].sort((a, b) => {
          return b.popularity - a.popularity;
        })
      );
    } else {
      setMovies(
        [...movies].sort((a, b) => {
          return a.popularity - b.popularity;
        })
      );
    }
    setPopButtonAsc(!popButtonAsc);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      searchButton(searchText);
    }
  }

  function releaseDateButton() {
    setActiveButton("releaseDate");
    if (dateButtonAsc) {
      setMovies(
        [...movies].sort((a, b) => {
          const aMovieData = a.release_date.split("-");
          const bMovieData = b.release_date.split("-");

          let aRelease = aMovieData[0] * 365 + aMovieData[1] * 30 + aMovieData[2];
          let bRelease = bMovieData[0] * 365 + bMovieData[1] * 30 + bMovieData[2];

          return bRelease - aRelease;
        })
      );
    } else {
      setMovies(
        [...movies].sort((a, b) => {
          const aMovieData = a.release_date.split("-");
          const bMovieData = b.release_date.split("-");

          let aRelease = aMovieData[0] * 365 + aMovieData[1] * 30 + aMovieData[2];
          let bRelease = bMovieData[0] * 365 + bMovieData[1] * 30 + bMovieData[2];
          return aRelease - bRelease;
        })
      );
    }
    setDateButtonAsc(!dateButtonAsc);
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

      if (data.movies.length > 0) {
        setMovies(data.movies);
      } else {
        setMovies();
      }
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
        <h1 className="flex-1 text-center text-white font-bold hidden md:block text-3xl">Simple Movie Site</h1>
        <div className="flex-1 flex md:gap-4 gap-2 justify-end">
          <input
            id="searchBar"
            type="text"
            className="bg-white p-2 rounde w-full"
            placeholder="Search movies..."
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
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
      <div className="flex box-border justify-center">
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
                    activeButton === "popularity" ? "bg-amber-600" : "bg-white"
                  } justify-center items-center rounded-xl   p-2 flex border cursor-pointer`}>
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
                    activeButton === "releaseDate" ? "bg-amber-600" : "bg-white"
                  } justify-center items-center rounded-xl p-2 flex border cursor-pointer`}>
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
              <div className="lg:min-w-4xl md:min-w-2xl max-w-5xl mx-auto cursor-pointer grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 box-border p-2">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} fetchMovieDetails={fetchMovieDetails} />
                ))}
              </div>
            </>
          )}
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
        <img src="../../assets/tmdb.svg" alt="TMDB image" className="w-32 p-4 hidden md:block" />
        <img src="../../assets/tmdb2.svg" alt="TMDB image" className="w-12 mb-2 p-2 md:hidden" />
      </div>
    </>
  );
}
