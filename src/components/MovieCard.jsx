import React from 'react'

const MovieCard = ({ movie }) => {
  const {
    Title,
    Year,
    Poster,
    imdbRating,
    Language
  } = movie;

  return (
    <div className="movie-card">
      <img
        src={Poster && Poster !== "N/A" ? Poster : '/no-movie.png'}
        alt={Title}
      />

      <div className="mt-4">
        <h3>{Title}</h3>

        <div className="content">


          <span>•</span>
          <p className="year">{Year || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
