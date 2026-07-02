package com.smartmoviefinder.events;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmoviefinder.graph.GraphService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Component
public class RedisEventSubscriber implements MessageListener {

    private static final Logger log = LoggerFactory.getLogger(RedisEventSubscriber.class);

    private final GraphService graphService;
    private final ObjectMapper objectMapper;

    public RedisEventSubscriber(GraphService graphService, ObjectMapper objectMapper) {
        this.graphService = graphService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String channel = new String(message.getChannel());
        String body = new String(message.getBody());

        try {
            switch (channel) {
                case "user.watched" -> {
                    WatchedEvent event = objectMapper.readValue(body, WatchedEvent.class);
                    graphService.saveWatchedMovie(
                            event.getUserId(), event.getTmdbId(),
                            event.getTitle(), event.getPosterPath(), event.getReleaseDate(),
                            event.getGenreIds(), event.getGenreNames(),
                            event.getWatchedAt()
                    );
                    log.info("Graph: user {} watched movie {}", event.getUserId(), event.getTmdbId());
                }
                case "user.rated" -> {
                    RatedEvent event = objectMapper.readValue(body, RatedEvent.class);
                    graphService.saveRatedMovie(
                            event.getUserId(), event.getTmdbId(),
                            event.getTitle(), event.getPosterPath(), event.getReleaseDate(),
                            event.getGenreIds(), event.getGenreNames(),
                            event.getRating()
                    );
                    log.info("Graph: user {} rated movie {} -> {}", event.getUserId(), event.getTmdbId(), event.getRating());
                }
                case "user.watch_later" -> {
                    WatchLaterEvent event = objectMapper.readValue(body, WatchLaterEvent.class);
                    graphService.saveWatchLater(
                            event.getUserId(), event.getTmdbId(),
                            event.getTitle(), event.getPosterPath(), event.getReleaseDate(),
                            event.getGenreIds(), event.getGenreNames()
                    );
                    log.info("Graph: user {} added movie {} to watch later", event.getUserId(), event.getTmdbId());
                }
                case "user.watch_later_removed" -> {
                    WatchLaterRemovedEvent event = objectMapper.readValue(body, WatchLaterRemovedEvent.class);
                    graphService.removeWatchLater(event.getUserId(), event.getTmdbId());
                    log.info("Graph: user {} removed movie {} from watch later", event.getUserId(), event.getTmdbId());
                }
                case "user.liked_genre" -> {
                    LikedGenreEvent event = objectMapper.readValue(body, LikedGenreEvent.class);
                    graphService.saveLikedGenre(event.getUserId(), event.getGenreId(), event.getGenreName());
                    log.info("Graph: user {} liked genre {}", event.getUserId(), event.getGenreId());
                }
                default -> log.warn("Unknown channel: {}", channel);
            }
        } catch (Exception e) {
            log.error("Failed to process Redis event on channel {}: {}", channel, e.getMessage());
        }
    }
}
