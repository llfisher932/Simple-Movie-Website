import { useEffect, useState } from "react";
import "./App.css";
import MovieModal from "./components/MovieModal.jsx";
import MovieCard from "./components/MovieCard.jsx";

function App() {
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

  async function fetchMovies(query, pageNumber) {
    try {
      const url = `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}&page=${pageNumber}`;

      const response = await fetch(url);

      if (!response.ok) throw new Error("Response Invalid.");

      const data = await response.json();
      console.log(data);
      if (data.Response === "True") {
        const uniqueMovies = Array.from(new Map(data.Search.map((movie) => [movie.imdbID, movie])).values()).sort(
          (a, b) => {
            return b.Year - a.Year; //sort by release year (most recent first)
          }
        );
        //get array of all data from API. turn it into a map based on ID (each ID can only be stored once)
        //storing each id means duplicated id's (duped movies) won't show up at all. Then turn that map back into an array based on just the values (array of all unique movies).
        setMovies(uniqueMovies);
      } else {
        throw new Error(data.Error);
      }
    } catch (err) {
      console.error("Error Fetching Movies: ", err);
    }
  }
  async function fetchMovieDetails(imdbID) {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`);
    const data = await res.json();
    setSelectedMovie(data);
    console.log(data);
  }

  return (
    <>
      <div className="bg-amber-600 flex items-center justify-end w-full p-4">
        <div className="flex-1"></div>
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
        <div className="w-1/4"></div>

        <div className="cursor-pointer grid grid-cols-3 gap-4 p-4 flex-1 box-border mb-15">
          {movies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} fetchMovieDetails={fetchMovieDetails} />
          ))}
        </div>

        <div className="w-1/4"></div>
        {selectedMovie && <MovieModal selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie} />}
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4 z-50 bg-amber-700 w-full justify-center p-2">
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
    </>
  );
}

export default App;
