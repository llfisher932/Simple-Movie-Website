import { useState } from "react";

export default function MovieCard({ movie, fetchMovieDetails }) {
  const [imgError, setImgError] = useState(false);

  const showPlaceholder = movie.Poster === "N/A" || imgError;

  return (
    <div
      onClick={() => {
        fetchMovieDetails(movie.imdbID);
      }}
      className=" bg-gray-800 p-3 rounded-lg text-white text-center flex flex-col box-border"
    >
      {showPlaceholder ? (
        <div className="bg-gray-600 text-white flex items-center justify-center rounded mb-2 h-100">
          No Poster Available
        </div>
      ) : (
        <img
          src={movie.Poster}
          alt={movie.Title}
          onError={() => setImgError(true)}
          className="rounded mb-2 h-100"
        />
      )}

      <h2 className="font-bold">{movie.Title}</h2>
      <p>{movie.Year}</p>
    </div>
  );
}
