import { useState } from "react";

export default function MovieReview({ username, number, text }) {
  return (
    <div className=" bg-gray-800 p-3 rounded-lg text-white  flex flex-col box-border">
      <div className="flex">
        <h2 className="font-bold">{username}</h2>

        <div className="flex ml-2">
          {/* uses prety much same logic as stars to leave review, but just rended filled stars based on database number, not click */}
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill={star <= number ? "yellow" : "gray"}
              className="w-6 h-6 ">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.947a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.947c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.784.57-1.838-.197-1.539-1.118l1.286-3.947a1 1 0 00-.364-1.118L2.034 9.374c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.287-3.947z" />
            </svg>
          ))}
        </div>
      </div>
      <p className="text-wrap wrap-break-word">{text}</p>
    </div>
  );
}
