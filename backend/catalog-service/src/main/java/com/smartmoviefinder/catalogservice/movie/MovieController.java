package com.smartmoviefinder.catalogservice.movie;

import com.smartmoviefinder.catalogservice.integration.TmdbClient;
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

    @GetMapping("/search")
    public String searchMovies(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page) {
        return tmdbClient.searchMovies(query, page);
    }

    @GetMapping("/{tmdbId}")
    public String getMovieDetail(@PathVariable Long tmdbId) {
        return tmdbClient.getMovieDetail(tmdbId);
    }

    @GetMapping("/popular")
    public String getPopularMovies(@RequestParam(defaultValue = "1") int page) {
        return tmdbClient.getPopularMovies(page);
    }

    @GetMapping("/genre/{genreId}")
    public String getMoviesByGenre(
            @PathVariable int genreId,
            @RequestParam(defaultValue = "1") int page) {
        return tmdbClient.getMoviesByGenre(genreId, page);
    }

    @GetMapping("/trending")
    public String getTrendingMovies() {
        return tmdbClient.getTrendingMovies();
    }
}
