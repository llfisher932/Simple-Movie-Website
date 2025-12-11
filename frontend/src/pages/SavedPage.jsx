import { useEffect, useState, useCallback } from "react";
import "../App.css";
import MovieModal from "../components/MovieModal.jsx";
import MovieCard from "../components/MovieCard.jsx";
import React from "react";
import fetchMovieDetailsModal from "../utils/fetchMovieDetails.js";
const BACKEND_URL = "http://localhost:5000";
const ENDPOINTS = {
  LOGOUT: "/logout",
  GET_MOVIES: "/getMovies",
  GET_SAVED_MOVIES: "/getSavedMovies",
  GET_DETAILS: "/getMovieDetails",
};

const SavedPage = ({ swapPage }) => {
  const [popButtonAsc, setPopButtonAsc] = useState(false);
  const [dateButtonAsc, setDateButtonAsc] = useState(false);
  const [activeButton, setActiveButton] = useState("");
  const [movieIDs, setMovieIDs] = useState();
  const [movies, setMovies] = useState();
  const [selectedMovie, setSelectedMovie] = useState(null);

  function modalFetchPass(id) {
    fetchMovieDetailsModal(id, setSelectedMovie);
  }

  async function fetchMovieDetails(id) {
    try {
      const res = await fetch(`${BACKEND_URL}${ENDPOINTS.GET_DETAILS}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: `${id}` }),
      });

      if (!res.ok) throw new Error("Response Invalid.");

      const data = await res.json();

      return data.movie;
    } catch (err) {
      console.error("Error Fetching Movie Details: ", err);
    }
  }
  async function fetchSavedMovies() {
    try {
      const res = await fetch(`${BACKEND_URL}${ENDPOINTS.GET_SAVED_MOVIES}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Response Invalid.");

      const data = await res.json();

      // list of IDs from backend
      setMovieIDs(data.movies);

      // fetch details for each ID
      const fullMovies = await Promise.all(
        data.movies.map((m) => fetchMovieDetails(m.movie_id)) // FIX HERE
      );

      setMovies(fullMovies); // store final array
    } catch (err) {
      console.error("Error Fetching Saved Movies: ", err);
    }
  }
  useEffect(() => {
    fetchSavedMovies(); // or whatever default query/page you want
  }, []);

  return (
    <>
      <div className="bg-gray-800 flex items-center justify-end w-full p-4">
        <div className="flex-1"></div>
        <h1 className="flex-1 text-center text-white font-bold block text-3xl">Saved movies</h1>
        <div className="flex-1 flex md:gap-4 gap-2 justify-end"></div>
      </div>
      <div className="flex box-border justify-center flex-col">
        <div className="w-1/6"></div>
        <div className="text-center flex justify-center items-center flex-col">
          {!movies ? (
            <div className="mb-5 mt-5">There are currently no saved movies to display.</div>
          ) : (
            <>
              <div className="mt-3 flex gap-3"></div>
              <div className="lg:min-w-4xl md:min-w-2xl md:max-w-5xl min-w-xs max-w-xs mx-auto cursor-pointer grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 box-border p-2">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} fetchMovieDetailsModal={modalFetchPass} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-1/6"></div>
        {selectedMovie && (
          <MovieModal
            selectedMovie={selectedMovie}
            setSelectedMovie={setSelectedMovie}
            reloadSavedMovies={fetchSavedMovies}
          />
        )}
        <div className="text-xs mb-15 text-center justify-center items-center flex flex-col">
          This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.
          <img src="../../assets/tmdb.svg" alt="TMDB image" className="w-24 p-4 flex" />
        </div>
      </div>

      <div className="flex-col fixed bottom-0 left-1/2 transform -translate-x-1/2 flex  z-50 bg-gray-800 w-full justify-center items-center p-2">
        <div className="mx-auto flex items-center justify-center text-center">
          <button
            type="button"
            onClick={swapPage}
            className="bg-amber-700 cursor-pointer text-white text-lg px-4 py-1.5 rounded-md flex items-center justify-center ">
            Search For Movies
          </button>
        </div>
      </div>
    </>
  );
};

export default SavedPage;
