// App.jsx
import React from 'react';
import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js' // Assuming appwrite.js handles Appwrite SDK calls

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // --- CHANGE MADE HERE ---
      // Use a relative path for the API endpoint.
      // Vercel will automatically route /api/movies to your serverless function (api/movies.js).
      const endpoint = query
        ? `/api/movies?query=${encodeURIComponent(query)}`
        : `/api/movies`;
      // --- END CHANGE ---

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      // Use `data.Search` because OMDb returns `Search` array
      setMovieList(data.Search || []);

      // If a query was made and results were found, update search count via Appwrite
      if (query && data.Search && data.Search.length > 0) {
        await updateSearchCount(query, data.Search[0]); // Ensure updateSearchCount is correctly implemented in appwrite.js
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      // Assuming getTrendingMovies from appwrite.js correctly fetches data
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    // Only fetch if the debounced search term has at least 3 characters
    if (debouncedSearchTerm.trim().length < 3) {
      setMovieList([]);
      setErrorMessage('');
      return;
    }

    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]); // Dependency array ensures effect runs when debouncedSearchTerm changes

  useEffect(() => {
    // Load trending movies when the component mounts
    loadTrendingMovies();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Display Trending Movies section if there are movies */}
        {Array.isArray(trendingMovies) && trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies
                .filter((movie) => movie && movie.poster_url && movie.poster_url !== 'N/A') // Filter out invalid entries
                .map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img
                      src={movie.poster_url}
                      alt={movie.title || 'Movie'}
                      onError={(e) => {
                        // Fallback for broken image URLs
                        if (e.target.src !== 'https://via.placeholder.com/300x450?text=No+Image') {
                          e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                        }
                      }}
                    />
                  </li>
                ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {/* Map through movieList to display MovieCard components */}
              {movieList.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
