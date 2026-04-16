package com.smartmoviefinder.movie;

import com.smartmoviefinder.integration.TmdbClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/movies")
public class MovieController {

    private final TmdbClient tmdbClient;

    public MovieController(TmdbClient tmdbClient) {
        this.tmdbClient = tmdbClient;
    }

    // Search movies by title
    @GetMapping("/search")
    public String searchMovies(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        return tmdbClient.searchMovies(query, page);
    }

    // Get movie detail by TMDB id
    @GetMapping("/{tmdbId}")
    public String getMovieDetail(@PathVariable Long tmdbId) {
        return tmdbClient.getMovieDetail(tmdbId);
    }

    // Get popular movies
    @GetMapping("/popular")
    public String getPopularMovies(@RequestParam(defaultValue = "1") int page) {
        return tmdbClient.getPopularMovies(page);
    }

    // Get movies by genre (TMDB genre id)
    @GetMapping("/genre/{genreId}")
    public String getMoviesByGenre(
            @PathVariable int genreId,
            @RequestParam(defaultValue = "1") int page) {
        return tmdbClient.getMoviesByGenre(genreId, page);
    }

    // Get trending movies (weekly)
    @GetMapping("/trending")
    public String getTrendingMovies() {
        return tmdbClient.getTrendingMovies();
    }
}
