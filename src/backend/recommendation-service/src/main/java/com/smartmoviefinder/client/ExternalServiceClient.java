package com.smartmoviefinder.client;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ExternalServiceClient {

    private final RestClient userClient;
    private final RestClient catalogClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ExternalServiceClient(
            @Value("${services.user-service-url}") String userServiceUrl,
            @Value("${services.catalog-service-url}") String catalogServiceUrl) {
        this.userClient = RestClient.builder().baseUrl(userServiceUrl).build();
        this.catalogClient = RestClient.builder().baseUrl(catalogServiceUrl).build();
    }

    /** Returns set of tmdbIds the user has already watched */
    public Set<Long> getWatchedTmdbIds(Long userId) {
        try {
            JsonNode arr = objectMapper.readTree(
                    userClient.get()
                            .uri("/users/{userId}/watched", userId)
                            .retrieve()
                            .body(String.class));
            Set<Long> ids = new java.util.HashSet<>();
            for (JsonNode n : arr) ids.add(n.path("tmdbId").asLong());
            return ids;
        } catch (Exception e) {
            return Set.of();
        }
    }

    /** Returns distinct genreIds from the user's watched movies */
    public List<Long> getWatchedGenreIds(Long userId) {
        try {
            JsonNode arr = objectMapper.readTree(
                    userClient.get()
                            .uri("/users/{userId}/watched", userId)
                            .retrieve()
                            .body(String.class));
            Set<Long> genreSet = new java.util.HashSet<>();
            for (JsonNode n : arr) {
                String genreIds = n.path("genreIds").asText("");
                if (!genreIds.isBlank()) {
                    for (String g : genreIds.split(",")) {
                        try { genreSet.add(Long.parseLong(g.trim())); } catch (NumberFormatException ignored) {}
                    }
                }
            }
            List<Long> list = new ArrayList<>(genreSet);
            Collections.shuffle(list);
            return list;
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Fetch movies by genreId from catalog-service (TMDB), exclude watched */
    public List<Map<String, Object>> getMoviesByGenreExcluding(Long genreId, Set<Long> excludeTmdbIds, int limit) {
        try {
            String raw = catalogClient.get()
                    .uri("/movies/genre/{genreId}?page=1", genreId)
                    .retrieve()
                    .body(String.class);
            JsonNode results = objectMapper.readTree(raw).path("results");
            List<Map<String, Object>> movies = new ArrayList<>();
            for (JsonNode node : results) {
                long tmdbId = node.path("id").asLong();
                if (!excludeTmdbIds.contains(tmdbId)) {
                    movies.add(objectMapper.convertValue(node, Map.class));
                }
                if (movies.size() >= limit) break;
            }
            return movies;
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Fetch top-rated movies from catalog-service, exclude watched */
    public List<Map<String, Object>> getTopRatedExcluding(Set<Long> excludeTmdbIds, int limit) {
        try {
            int page = 1 + (int) (Math.random() * 5);
            String raw = catalogClient.get()
                    .uri("/movies/top-rated?page={page}", page)
                    .retrieve()
                    .body(String.class);
            JsonNode results = objectMapper.readTree(raw).path("results");
            List<Map<String, Object>> all = new ArrayList<>();
            for (JsonNode node : results) all.add(objectMapper.convertValue(node, Map.class));
            Collections.shuffle(all);
            return all.stream()
                    .filter(m -> !excludeTmdbIds.contains(((Number) m.getOrDefault("id", 0L)).longValue()))
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }
}
