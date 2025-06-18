import React from 'react';
import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'



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
const endpoint = query
  ? `http://localhost:5000/api/movies?query=${encodeURIComponent(query)}`
  : `http://localhost:5000/api/movies`;


    const response = await fetch(endpoint);
    const data = await response.json();

    if (data.Response === 'False') {
      setErrorMessage(data.Error || 'Failed to fetch movies');
      setMovieList([]);
      return;
    }

    // Use `data.Search` because OMDb returns `Search` array
    setMovieList(data.Search || []);

    if (query && data.Search && data.Search.length > 0) {
      await updateSearchCount(query, data.Search[0]);
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
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

useEffect(() => {
  if (debouncedSearchTerm.trim().length < 3) {
    setMovieList([]);
    setErrorMessage('');
    return;
  }

  fetchMovies(debouncedSearchTerm);
}, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

{Array.isArray(trendingMovies) && trendingMovies.length > 0 && (
  <section className="trending">
    <h2>Trending Movies</h2>
    <ul>
      {trendingMovies
        .filter((movie) => movie && movie.poster_url && movie.poster_url !== 'N/A') // Prevents empty/flickering entries
        .map((movie, index) => (
          <li key={movie.$id}>
            <p>{index + 1}</p>
            <img
              src={movie.poster_url}
              alt={movie.title || 'Movie'}
              onError={(e) => {
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