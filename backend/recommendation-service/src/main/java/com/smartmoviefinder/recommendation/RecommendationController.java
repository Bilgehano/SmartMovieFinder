package com.smartmoviefinder.recommendation;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartmoviefinder.client.ExternalServiceClient;
import com.smartmoviefinder.graph.GraphService;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private final GraphService graphService;
    private final ExternalServiceClient externalServiceClient;

    public RecommendationController(GraphService graphService, ExternalServiceClient externalServiceClient) {
        this.graphService = graphService;
        this.externalServiceClient = externalServiceClient;
    }

    @GetMapping("/test")
    public String test() {
        return "Recommendation Service is working!";
    }

    /** Graph-based personalized recommendations */
    @GetMapping("/{userId}")
    public List<Map<String, Object>> getRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        return graphService.getRecommendations(userId, limit);
    }

    /** Genre-based: picks from user's watched genres, returns unwatched TMDB movies */
    @GetMapping("/{userId}/by-genre")
    public List<Map<String, Object>> getByGenre(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        Set<Long> watched = externalServiceClient.getWatchedTmdbIds(userId);
        List<Long> genreIds = externalServiceClient.getWatchedGenreIds(userId);
        if (genreIds.isEmpty()) return List.of();
        // try genres one by one until we fill the limit
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Long genreId : genreIds) {
            if (result.size() >= limit) break;
            List<Map<String, Object>> batch = externalServiceClient
                    .getMoviesByGenreExcluding(genreId, watched, limit - result.size());
            batch.forEach(m -> {
                long id = ((Number) m.getOrDefault("id", 0L)).longValue();
                if (!watched.contains(id) && result.stream().noneMatch(r -> ((Number) r.getOrDefault("id", 0L)).longValue() == id)) {
                    result.add(m);
                }
            });
        }
        return result;
    }

    /** Top-rated random: filters out already-watched movies */
    @GetMapping("/{userId}/top-rated")
    public List<Map<String, Object>> getTopRatedForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        Set<Long> watched = externalServiceClient.getWatchedTmdbIds(userId);
        return externalServiceClient.getTopRatedExcluding(watched, limit);
    }
}
