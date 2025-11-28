export default function MovieModal({ selectedMovie, setSelectedMovie }) {
  if (!selectedMovie) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="opacity-100 bg-gray-800 p-6 rounded-lg max-w-lg w-full text-white relative">
        <button
          className="cursor-pointer absolute top-2 right-2 bg-red-500 px-2 py-1 rounded"
          onClick={() => setSelectedMovie(null)}>
          X
        </button>

        <h1 className="text-2xl font-bold mb-2">{selectedMovie.Title}</h1>
        <p className="mb-2">{selectedMovie.Plot}</p>
        <p className="mb-1">Year: {selectedMovie.Year}</p>
        <p className="mb-1">Genre: {selectedMovie.Genre}</p>
        <p className="mb-1">Director: {selectedMovie.Director}</p>
        <p className="mb-1"></p>
        <img
          src={selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : ""}
          alt={selectedMovie.Title}
          className="mt-4 rounded"
        />
      </div>
    </div>
  );
}
