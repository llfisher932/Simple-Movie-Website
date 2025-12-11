import { BACKEND_URL, ENDPOINTS } from "../config.js";

export default async function fetchMovieDetailsModal(id, setSelectedMovie) {
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

    setSelectedMovie(data.movie);
  } catch (err) {
    console.error("Error Fetching Movie Details: ", err);
  }
}
