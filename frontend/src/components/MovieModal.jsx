import { useState, useEffect } from "react";
import MovieReview from "./MovieReview";

export default function MovieModal({ selectedMovie, setSelectedMovie }) {
  const [reviewText, setReviewText] = useState("");
  const [reviewNumber, setReviewNumber] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [imgError, setImgError] = useState(false);
  const [starRating, setStarRating] = useState(0);
  const showPlaceholder = selectedMovie.poster_path === "N/A" || imgError;

  useEffect(() => {
    if (!selectedMovie) return;

    async function loadStars() {
      const movieID = selectedMovie.id;
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

    async function loadReviews() {
      const movieID = selectedMovie.id;
      try {
        const res = await fetch(`http://localhost:5000/getreviews/${movieID}`, {
          //get reviews based on movieID, not sensitive info or modifying so GET works
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setReviews(data.reviews); // store reviews in state
        else console.error(data.error);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    }

    loadReviews();
  }, [selectedMovie]);

  async function handleSubmit(e) {
    e.preventDefault();
    const movieID = selectedMovie.id;

    const res = await fetch("http://localhost:5000/addreview", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieID, reviewText, reviewNumber }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data.error);
      return;
    }

    //review form clear
    setReviews((prev) => [
      { review_id: data.review.review_id, username: "You", review_number: reviewNumber, review_text: reviewText },
      ...prev,
    ]);
    setReviewText("");
    setReviewNumber(1);
  }

  async function getReviews() {
    const movieID = selectedMovie.id;

    const res = await fetch(`http://localhost:5000/getreviews/${movieID}`, {
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data.error);
      return;
    }

    return data.reviews;
  }

  if (!selectedMovie) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full text-white relative max-h-[90vh] overflow-y-auto flex gap-6">
        {/* Close Button */}
        <button
          className="cursor-pointer absolute top-2 right-2 bg-red-500 px-2 py-1 rounded hover:bg-red-600"
          onClick={() => setSelectedMovie(null)}>
          X
        </button>

        {/* Left side: Movie info */}
        <div className="flex-1">
          {showPlaceholder ? (
            <div className="bg-gray-600 text-white flex items-center justify-center rounded mb-2 h-100">
              No Poster Available
            </div>
          ) : (
            <img
              src={`https://image.tmdb.org/t/p/w500/${selectedMovie.poster_path}`}
              alt={selectedMovie.title}
              onError={() => setImgError(true)}
              className="rounded mb-2 h-100 "
            />
            //logic above is to make sure that posters display properly. If no poster is found or loads, show a No Poster Available "poster" instead
          )}
          <h1 className="text-2xl font-bold mb-2">{selectedMovie.title}</h1>
          <p className="mb-2">{selectedMovie.overview}</p>
          <p className="mb-1">Release Date: {selectedMovie.release_date}</p>
          <p className="mb-1">
            Genres:
            <div className="flex gap-2">
              {selectedMovie.genres.map((item) => {
                return (
                  <div key={item.id} className="p-2 bg-gray-900">
                    {item.name}
                  </div>
                );
              })}
            </div>
          </p>
          <p className="mb-1">Studio: {selectedMovie.production_companies[0].name}</p>
        </div>

        {/* Right side: Reviews */}
        <div className="flex-1 overflow-y-auto max-h-[80vh]">
          <div className="bg-gray-700 p-4 rounded-lg ">
            <h2 className="text-xl font-semibold mb-2 flex flex-row">
              Reviews
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
            </h2>
            <div className="flex flex-col gap-3 overflow-y-scroll h-90 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {
                //in case there are no reviews
                reviews.length === 0 && <p>No reviews yet</p>
              }
              {
                //if there are no reviews, this will do nothing. But, otherwise, show all reviews as MovieReview component from backend Query (only grabs last 4 at most)
                reviews.map((review) => (
                  <MovieReview
                    key={review.review_id}
                    username={review.username}
                    number={review.review_number}
                    text={review.review_text}
                  />
                ))
              }
            </div>
          </div>
          <div className="mt-4 bg-gray-700 p-4 rounded-lg">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-row">
                <div className="font-semibold text-xl">Leave a review!</div>
                <div className="flex ml-2">
                  {/* allows user to click stars to get a review number */}
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      onClick={() => setReviewNumber(star)}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill={star <= reviewNumber ? "yellow" : "gray"}
                      className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.947a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.947c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.784.57-1.838-.197-1.539-1.118l1.286-3.947a1 1 0 00-.364-1.118L2.034 9.374c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.287-3.947z" />
                    </svg>
                  ))}
                </div>
              </div>
              <textarea
                className="resize-none w-full h-40 p-1 rounded-lg mt-2 border-2 border-gray-900"
                maxLength={200}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Type your review! Max 200 characters."
              />
              <button className="cursor-pointer bg-amber-700 p-2 rounded-lg mt-1" type="submit">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
