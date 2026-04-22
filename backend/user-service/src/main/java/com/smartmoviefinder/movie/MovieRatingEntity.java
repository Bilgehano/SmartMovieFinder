package com.smartmoviefinder.movie;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "movie_ratings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "tmdb_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class MovieRatingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "tmdb_id", nullable = false)
    private Long tmdbId;

    @Column(nullable = false)
    private String title;

    private String posterPath;

    private String releaseDate;

    @Column(nullable = false)
    private int rating;

    @Column(nullable = false)
    private LocalDateTime ratedAt;

    public MovieRatingEntity(Long userId, Long tmdbId, String title, String posterPath, String releaseDate, int rating) {
        this.userId = userId;
        this.tmdbId = tmdbId;
        this.title = title;
        this.posterPath = posterPath;
        this.releaseDate = releaseDate;
        this.rating = rating;
    }

    @PrePersist
    public void prePersist() {
        this.ratedAt = LocalDateTime.now();
    }
}
