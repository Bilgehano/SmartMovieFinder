package com.smartmoviefinder.graph;

import java.util.List;
import java.util.Map;

import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GraphService {

    private final Neo4jClient neo4jClient;

    public GraphService(Neo4jClient neo4jClient) {
        this.neo4jClient = neo4jClient;
    }

    @Transactional
    public void saveWatchedMovie(Long userId, Long tmdbId, String title,
                                  String posterPath, String releaseDate,
                                  List<Long> genreIds, List<String> genreNames,
                                  String watchedAt) {
        // Merge User and Movie nodes, create WATCHED relationship
        neo4jClient.query("""
                MERGE (u:User {userId: $userId})
                MERGE (m:Movie {tmdbId: $tmdbId})
                  ON CREATE SET m.title = $title, m.posterPath = $posterPath, m.releaseDate = $releaseDate
                MERGE (u)-[r:WATCHED]->(m)
                  ON CREATE SET r.watchedAt = $watchedAt
                """)
                .bindAll(Map.of(
                        "userId", userId,
                        "tmdbId", tmdbId,
                        "title", title,
                        "posterPath", posterPath != null ? posterPath : "",
                        "releaseDate", releaseDate != null ? releaseDate : "",
                        "watchedAt", watchedAt
                ))
                .run();

        saveMovieGenres(tmdbId, genreIds, genreNames);
    }

    @Transactional
    public void saveRatedMovie(Long userId, Long tmdbId, String title,
                                String posterPath, String releaseDate,
                                List<Long> genreIds, List<String> genreNames,
                                int rating) {
        neo4jClient.query("""
                MERGE (u:User {userId: $userId})
                MERGE (m:Movie {tmdbId: $tmdbId})
                  ON CREATE SET m.title = $title, m.posterPath = $posterPath, m.releaseDate = $releaseDate
                MERGE (u)-[r:RATED]->(m)
                SET r.rating = $rating
                """)
                .bindAll(Map.of(
                        "userId", userId,
                        "tmdbId", tmdbId,
                        "title", title,
                        "posterPath", posterPath != null ? posterPath : "",
                        "releaseDate", releaseDate != null ? releaseDate : "",
                        "rating", rating
                ))
                .run();

        saveMovieGenres(tmdbId, genreIds, genreNames);
    }

    @Transactional
    public void saveWatchLater(Long userId, Long tmdbId, String title,
                                String posterPath, String releaseDate,
                                List<Long> genreIds, List<String> genreNames) {
        neo4jClient.query("""
                MERGE (u:User {userId: $userId})
                MERGE (m:Movie {tmdbId: $tmdbId})
                  ON CREATE SET m.title = $title, m.posterPath = $posterPath, m.releaseDate = $releaseDate
                MERGE (u)-[:WANTS_TO_WATCH]->(m)
                """)
                .bindAll(Map.of(
                        "userId", userId,
                        "tmdbId", tmdbId,
                        "title", title,
                        "posterPath", posterPath != null ? posterPath : "",
                        "releaseDate", releaseDate != null ? releaseDate : ""
                ))
                .run();

        saveMovieGenres(tmdbId, genreIds, genreNames);
    }

    @Transactional
    public void saveLikedGenre(Long userId, Long genreId, String genreName) {
        neo4jClient.query("""
                MERGE (u:User {userId: $userId})
                MERGE (g:Genre {genreId: $genreId})
                  ON CREATE SET g.name = $genreName
                MERGE (u)-[:LIKES_GENRE]->(g)
                """)
                .bindAll(Map.of(
                        "userId", userId,
                        "genreId", genreId,
                        "genreName", genreName
                ))
                .run();
    }

    @Transactional
    public void removeWatchLater(Long userId, Long tmdbId) {
        neo4jClient.query("""
                MATCH (u:User {userId: $userId})-[r:WANTS_TO_WATCH]->(m:Movie {tmdbId: $tmdbId})
                DELETE r
                """)
                .bindAll(Map.of("userId", userId, "tmdbId", tmdbId))
                .run();
    }

    public List<Map<String, Object>> getRecommendations(Long userId, int limit) {
        return neo4jClient.query("""
                // --- 1. Content-based: liked genres ---
                MATCH (u:User {userId: $userId})-[:LIKES_GENRE]->(g:Genre)<-[:HAS_GENRE]-(m:Movie)
                WHERE NOT (u)-[:WATCHED]->(m)
                WITH u, m, count(g) * 2 AS genreScore

                // --- 2. Watch-later boost: user already wants to watch it ---
                OPTIONAL MATCH (u)-[wl:WANTS_TO_WATCH]->(m)
                WITH u, m, genreScore, (CASE WHEN wl IS NOT NULL THEN 3 ELSE 0 END) AS watchLaterBoost

                // --- 3. Collaborative: similar users who watched this film ---
                OPTIONAL MATCH (other:User)-[:WATCHED]->(m)
                WHERE other <> u
                  AND (other)-[:LIKES_GENRE]->(:Genre)<-[:LIKES_GENRE]-(u)
                WITH u, m, genreScore, watchLaterBoost, count(DISTINCT other) AS socialScore

                // --- 4. Rating boost: similar users who rated it highly (>=4) ---
                OPTIONAL MATCH (other2:User)-[r:RATED]->(m)
                WHERE other2 <> u
                  AND r.rating >= 4
                  AND (other2)-[:LIKES_GENRE]->(:Genre)<-[:LIKES_GENRE]-(u)
                WITH u, m, genreScore, watchLaterBoost, socialScore,
                     count(DISTINCT other2) AS highRatingScore

                // --- 5. Recency boost from user's own watch history ---
                // If user recently watched films in the same genres, boost those genres more
                OPTIONAL MATCH (u)-[w:WATCHED]->(recentMovie:Movie)-[:HAS_GENRE]->(rg:Genre)<-[:HAS_GENRE]-(m)
                WHERE w.watchedAt > toString(datetime() - duration('P90D'))
                WITH m, genreScore, watchLaterBoost, socialScore, highRatingScore,
                     count(DISTINCT recentMovie) AS recencyScore

                RETURN m.tmdbId       AS tmdbId,
                       m.title        AS title,
                       m.posterPath   AS posterPath,
                       m.releaseDate  AS releaseDate,
                       (genreScore + watchLaterBoost + socialScore + highRatingScore * 2 + recencyScore) AS score
                ORDER BY score DESC
                LIMIT $limit
                """)
                .bindAll(Map.of("userId", userId, "limit", limit))
                .fetch()
                .all()
                .stream()
                .map(r -> (Map<String, Object>) r)
                .toList();
    }

    private void saveMovieGenres(Long tmdbId, List<Long> genreIds, List<String> genreNames) {
        if (genreIds == null || genreIds.isEmpty()) return;
        for (int i = 0; i < genreIds.size(); i++) {
            Long genreId = genreIds.get(i);
            String genreName = (genreNames != null && i < genreNames.size()) ? genreNames.get(i) : String.valueOf(genreId);
            neo4jClient.query("""
                    MERGE (g:Genre {genreId: $genreId})
                      ON CREATE SET g.name = $genreName
                    WITH g
                    MATCH (m:Movie {tmdbId: $tmdbId})
                    MERGE (m)-[:HAS_GENRE]->(g)
                    """)
                    .bindAll(Map.of("genreId", genreId, "genreName", genreName, "tmdbId", tmdbId))
                    .run();
        }
    }
}
