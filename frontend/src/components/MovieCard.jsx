import { useState } from "react";

export default function MovieCard({ movie, fetchMovieDetails }) {
  const [imgError, setImgError] = useState(false);

  const showPlaceholder = movie.poster_path === "N/A" || imgError;

  return (
    <div
      onClick={() => {
        fetchMovieDetails(movie.id);
      }}
      className="w-full bg-gray-800 p-3 rounded-lg text-white text-center flex flex-col box-border max-w-sm">
      {showPlaceholder ? (
        <div className="bg-gray-600 text-white flex items-center justify-center rounded mb-2 h-100">
          No Poster Available
        </div>
      ) : (
        <img
          src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
          alt={movie.title}
          onError={() => setImgError(true)}
          className="rounded mb-2 h-100 "
        />
        //logic above is to make sure that posters display properly. If no poster is found or loads, show a No Poster Available "poster" instead
      )}

      <h2 className="font-bold">{movie.title}</h2>
      <p>{movie.release_date}</p>
    </div>
  );
}
