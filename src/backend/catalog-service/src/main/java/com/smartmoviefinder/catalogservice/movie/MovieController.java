package com.smartmoviefinder.catalogservice.movie;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmoviefinder.catalogservice.integration.TmdbClient;

@RestController
@RequestMapping(value = "/movies", produces = MediaType.APPLICATION_JSON_VALUE)
public class MovieController {

    private final TmdbClient tmdbClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

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

    @GetMapping("/top-rated")
    public String getTopRatedMovies(@RequestParam(defaultValue = "1") int page) {
        return tmdbClient.getTopRatedMovies(page);
    }

    // Similar movies based on a given tmdbId (from TMDB)
    @GetMapping("/{tmdbId}/similar")
    public List<Object> getSimilarMovies(@PathVariable Long tmdbId,
                                          @RequestParam(defaultValue = "5") int limit) {
        try {
            String raw = tmdbClient.getSimilarMovies(tmdbId);
            JsonNode results = objectMapper.readTree(raw).path("results");
            List<Object> movies = new ArrayList<>();
            for (JsonNode node : results) {
                if (movies.size() >= limit) break;
                movies.add(objectMapper.convertValue(node, Map.class));
            }
            return movies;
        } catch (Exception e) {
            return List.of();
        }
    }
}
