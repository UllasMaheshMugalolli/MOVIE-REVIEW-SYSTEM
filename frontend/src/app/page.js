// We can't use 'async' directly on the component by default
// in plain JS, so we'll fetch data on the client.
// We'll add 'use client' at the top.
'use client'; 

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function runs when the component loads
    async function getMovies() {
      try {
        // --- Make sure this URL is correct for your backend! ---
        const res = await fetch('http://localhost:4000/api/movies'); 
        
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await res.json();
        setMovies(data); // Save the movies in our state
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Stop loading
      }
    }

    getMovies();
  }, []); // The empty array [] means this runs only once

  if (loading) {
    return <p>Loading movies...</p>;
  }

  return (
    // 'p-8' is a Tailwind class (padding: 2rem)
    <main className="p-8"> 
      <h1 className="text-3xl font-bold mb-4">Movie Reviews</h1> 
      
      <div className="grid grid-cols-3 gap-4">
        {movies.map((movie) => (
          // 'key' must be unique
          <div key={movie.movie_id} className="border p-4 rounded-lg shadow"> 
            <h2 className="text-xl font-semibold">{movie.title}</h2> 
            <p>{movie.genre}</p>
          </div>
        ))}
      </div>
    </main>
  );
}