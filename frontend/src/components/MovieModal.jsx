import { useState, useEffect } from "react";
import MovieReview from "./MovieReview";

export default function MovieModal({ selectedMovie, setSelectedMovie }) {
  const [reviewText, setReviewText] = useState("");
  const [reviewNumber, setReviewNumber] = useState(0);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!selectedMovie) return;

    async function loadReviews() {
      const movieID = selectedMovie.imdbID;
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
    const movieID = selectedMovie.imdbID;

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

    console.log("Review submitted!");

    //review form clear
    setReviews((prev) => [
      { review_id: data.review.review_id, username: "You", review_number: reviewNumber, review_text: reviewText },
      ...prev,
    ]);
    setReviewText("");
    setReviewNumber(0);
  }

  async function getReviews() {
    const movieID = selectedMovie.imdbID;

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
          <h1 className="text-2xl font-bold mb-2">{selectedMovie.Title}</h1>
          <p className="mb-2">{selectedMovie.Plot}</p>
          <p className="mb-1">Year: {selectedMovie.Year}</p>
          <p className="mb-1">Genre: {selectedMovie.Genre}</p>
          <p className="mb-1">Director: {selectedMovie.Director}</p>
          <img
            src={selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : ""}
            alt={selectedMovie.Title}
            className="mt-4 rounded max-h-[40vh] object-contain"
          />
        </div>

        {/* Right side: Reviews */}
        <div className="flex-1 overflow-y-auto max-h-[80vh]">
          <div className="bg-gray-700 p-4 rounded-lg ">
            <h2 className="text-xl font-semibold mb-2">Reviews</h2>
            <div className="flex flex-col gap-3">
              {reviews.length === 0 && <p>No reviews yet</p>}
              {reviews.map((review) => (
                <MovieReview
                  key={review.review_id}
                  username={review.username}
                  number={review.review_number}
                  text={review.review_text}
                />
              ))}
              {/* Add more reviews dynamically */}
            </div>
          </div>
          <div className="mt-4 bg-gray-700 p-4 rounded-lg">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-row">
                <div className="font-semibold text-xl">Leave a review!</div>
                <div className="flex ml-2">
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

/*

        <div className="absolute top-[25%] right-[20%]">
          <div className="text-xl font-bold">Leave a review!</div>
          <textarea className="resize" />
        </div>
        */
