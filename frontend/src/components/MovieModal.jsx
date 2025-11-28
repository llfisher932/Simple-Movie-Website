import { useState } from "react";

export default function MovieModal({ selectedMovie, setSelectedMovie }) {
  const [reviewText, setReviewText] = useState("");
  const [reviewNumber, setReviewNumber] = useState(0);

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

    //review form claer
    setReviewText("");
    setReviewNumber(0);
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
            <p className="text-sm mb-2">"Amazing movie, loved the plot!"</p>
            <p className="text-sm mb-2">"Great cinematography, worth watching."</p>
            <p className="text-sm mb-2">"The ending was unexpected and thrilling."</p>
            {/* Add more reviews dynamically */}
          </div>
          <div className="mt-4 bg-gray-700 p-4 rounded-lg">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-row">
                <div className="font-semibold text-xl">Leave a review!</div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="ml-4 w-16 text-black rounded"
                  value={reviewNumber}
                  onChange={(e) => setReviewNumber(e.target.value)}
                />
              </div>
              <textarea
                className="resize-none w-full h-40 p-1 rounded-lg mt-2"
                maxLength={200}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Type your review! Max 200 characters."
              />
              <button type="submit">test</button>
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
