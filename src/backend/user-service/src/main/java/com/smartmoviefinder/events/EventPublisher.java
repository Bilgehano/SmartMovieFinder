package com.smartmoviefinder.events;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(EventPublisher.class);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public EventPublisher(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishWatched(Long userId, Long tmdbId, String title,
                                String posterPath, String releaseDate,
                                String genreIds, String watchedAt) {
        publish("user.watched", new WatchedEvent(
                userId, tmdbId, title, posterPath, releaseDate,
                parseGenreIds(genreIds), watchedAt
        ));
    }

    public void publishRated(Long userId, Long tmdbId, String title,
                              String posterPath, String releaseDate,
                              String genreIds, int rating) {
        publish("user.rated", new RatedEvent(
                userId, tmdbId, title, posterPath, releaseDate,
                parseGenreIds(genreIds), rating
        ));
    }

    public void publishWatchLater(Long userId, Long tmdbId, String title,
                                   String posterPath, String releaseDate,
                                   String genreIds) {
        publish("user.watch_later", new WatchLaterEvent(
                userId, tmdbId, title, posterPath, releaseDate,
                parseGenreIds(genreIds)
        ));
    }

    public void publishWatchLaterRemoved(Long userId, Long tmdbId) {
        publish("user.watch_later_removed", new WatchLaterRemovedEvent(userId, tmdbId));
    }

    public void publishLikedGenre(Long userId, Long genreId, String genreName) {
        publish("user.liked_genre", new LikedGenreEvent(userId, genreId, genreName));
    }

    private void publish(String channel, Object event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(channel, json);
        } catch (Exception e) {
            log.error("Failed to publish event to channel {}: {}", channel, e.getMessage());
        }
    }

    private List<Long> parseGenreIds(String genreIds) {
        if (genreIds == null || genreIds.isBlank()) return List.of();
        return Arrays.stream(genreIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }
}
