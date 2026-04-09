package com.smartmoviefinder.movie;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class MovieService {
    private final MovieRepository movieRepository;
    private final MovieRatingRepository movieRatingRepository;

    @Autowired
    public MovieService(MovieRepository movieRepository, MovieRatingRepository movieRatingRepository) {
        this.movieRepository = movieRepository;
        this.movieRatingRepository = movieRatingRepository;
    }

    public MovieEntity getMovieByTmdbId(Long tmdbId) {
        return movieRepository.findByTmdbId(tmdbId).orElse(null);
    }

    public MovieEntity getMovieById(Long id) {
        return movieRepository.findById(id).orElse(null);
    }

    public List<MovieEntity> getAllMovies() {
        return movieRepository.findAll();
    }

    public boolean movieExistsByTmdbId(Long tmdbId) {
        return movieRepository.existsByTmdbId(tmdbId);
    }

    public List<MovieRatingEntity> getRatingsForMovie(Long tmdbId) {
        MovieEntity movie = movieRepository.findByTmdbId(tmdbId)
                .orElseThrow(() -> new RuntimeException("Movie not found with tmdbId: " + tmdbId));
        return movieRatingRepository.findByMovieId(movie.getId());
    }
}
