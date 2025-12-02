import { useEffect } from "react";
import { useState } from "react";

export default function MovieCard({ movie, fetchMovieDetails }) {
  const [starRating, setStarRating] = useState(0);

  useEffect(() => {
    async function loadStars() {
      const movieID = movie.id;
      try {
        const res = await fetch(`http://localhost:5000/getreviews/${movieID}`, {
          //get reviews based on movieID, not sensitive info or modifying so GET works
          credentials: "include",
        });
        const data = await res.json();
        console.log("reviews =", data.reviews);
        if (res.ok) {
          let sum = 0;
          let counter = 0;
          for (let review of data.reviews) {
            sum += review.review_number;
            counter++;
          }

          const avg = counter > 0 ? sum / counter : 0;
          setStarRating(avg);
          console.log(starRating);
        } else console.error(data.error);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    }

    loadStars();
  }, [movie.id]);

  const [imgError, setImgError] = useState(false);

  const showPlaceholder = movie.poster_path === "N/A" || imgError;

  const movieData = movie.release_date.split("-");

  let year = "0000";
  let month = "00";
  let day = "00";

  if (movieData != null && movieData != undefined) {
    year = movieData[0];
    month = movieData[1];
    if (month.charAt(0) === "0") {
      month = month.slice(1);
    }
    day = movieData[2];
  }

  const months = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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
          className="rounded mb-2 h-100"
        />
        //logic above is to make sure that posters display properly. If no poster is found or loads, show a No Poster Available "poster" instead
      )}

      <h2 className="font-bold truncate">{movie.title}</h2>
      <p>
        {months[month]} {day}, {year}
      </p>
      <div className="flex ml-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillLevel = Math.min(Math.max(starRating - (star - 1), 0), 1);
          // fillLevel = 0 to 1 (0%, 50%, 100%)
          return (
            <div key={star} className="relative w-6 h-6 mr-1">
              {/* Empty outline */}
              <svg className="absolute top-0 left-0 w-6 h-6" viewBox="0 0 20 20" fill="gray">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.947a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.947c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.784.57-1.838-.197-1.539-1.118l1.286-3.947a1 1 0 00-.364-1.118L2.034 9.374c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.287-3.947z" />
              </svg>

              {/* Filled star clip */}
              <svg
                className="absolute top-0 left-0 w-6 h-6"
                viewBox="0 0 20 20"
                fill="yellow"
                style={{ clipPath: `inset(0 ${100 - fillLevel * 100}% 0 0)` }}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.947a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.947c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.784-.57-1.838-.197-1.539-1.118l1.286-3.947a1 1 0 00-.364-1.118L2.034 9.374c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.287-3.947z" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
