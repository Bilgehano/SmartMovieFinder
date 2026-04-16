package com.smartmoviefinder.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class TmdbClient {

    private final RestClient restClient;
    private final String apiKey;

    public TmdbClient(
            @Value("${tmdb.base-url}") String baseUrl,
            @Value("${tmdb.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public String searchMovies(String query, int page) {
        return restClient.get()
                .uri("/search/movie?api_key={key}&query={q}&page={p}&language=en-US", apiKey, query, page)
                .retrieve()
                .body(String.class);
    }

    public String getMovieDetail(Long tmdbId) {
        return restClient.get()
                .uri("/movie/{id}?api_key={key}&language=en-US", tmdbId, apiKey)
                .retrieve()
                .body(String.class);
    }

    public String getPopularMovies(int page) {
        return restClient.get()
                .uri("/movie/popular?api_key={key}&page={p}&language=en-US", apiKey, page)
                .retrieve()
                .body(String.class);
    }

    public String getMoviesByGenre(int genreId, int page) {
        return restClient.get()
                .uri("/discover/movie?api_key={key}&with_genres={g}&page={p}&language=en-US", apiKey, genreId, page)
                .retrieve()
                .body(String.class);
    }

    public String getTrendingMovies() {
        return restClient.get()
                .uri("/trending/movie/week?api_key={key}&language=en-US", apiKey)
                .retrieve()
                .body(String.class);
    }
}
