package com.smartmoviefinder.catalogservice.integration;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.GZIPInputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
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
        return get("/search/movie?api_key={key}&query={q}&page={p}&language=en-US", apiKey, query, page);
    }

    public String getMovieDetail(Long tmdbId) {
        return get("/movie/{id}?api_key={key}&language=en-US", tmdbId, apiKey);
    }

    public String getPopularMovies(int page) {
        return get("/movie/popular?api_key={key}&page={p}&language=en-US", apiKey, page);
    }

    public String getMoviesByGenre(int genreId, int page) {
        return get("/discover/movie?api_key={key}&with_genres={g}&page={p}&language=en-US", apiKey, genreId, page);
    }

    public String getTrendingMovies() {
        return get("/trending/movie/week?api_key={key}&language=en-US", apiKey);
    }

    public String getSimilarMovies(Long tmdbId) {
        return get("/movie/{id}/similar?api_key={key}&language=en-US&page=1", tmdbId, apiKey);
    }

    public String getTopRatedMovies(int page) {
        return get("/movie/top_rated?api_key={key}&language=en-US&page={p}", apiKey, page);
    }

    private String get(String uriTemplate, Object... uriVariables) {
        byte[] responseBody = restClient.get()
                .uri(uriTemplate, uriVariables)
                .retrieve()
                .toEntity(byte[].class)
                .getBody();

        if (responseBody == null || responseBody.length == 0) {
            return "";
        }

        if (isGzipped(responseBody)) {
            return unzip(responseBody);
        }

        return new String(responseBody, StandardCharsets.UTF_8);
    }

    private boolean isGzipped(byte[] responseBody) {
        return responseBody.length >= 2
                && responseBody[0] == (byte) 0x1f
                && responseBody[1] == (byte) 0x8b;
    }

    private String unzip(byte[] responseBody) {
        try (GZIPInputStream gzipInputStream = new GZIPInputStream(new ByteArrayInputStream(responseBody));
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            gzipInputStream.transferTo(outputStream);
            return outputStream.toString(StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to decode TMDB gzip response", exception);
        }
    }
}
