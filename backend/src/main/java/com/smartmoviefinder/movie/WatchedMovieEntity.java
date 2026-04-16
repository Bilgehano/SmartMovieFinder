package com.smartmoviefinder.movie;

import java.time.LocalDateTime;

import com.smartmoviefinder.user.UserEntity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_watched_movies", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "tmdb_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class WatchedMovieEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "tmdb_id", nullable = false)
    private Long tmdbId;

    @Column(nullable = false)
    private String title;

    private String posterPath;

    private String releaseDate;

    @Column(nullable = false)
    private LocalDateTime watchedAt;

    public WatchedMovieEntity(UserEntity user, Long tmdbId, String title, String posterPath, String releaseDate) {
        this.user = user;
        this.tmdbId = tmdbId;
        this.title = title;
        this.posterPath = posterPath;
        this.releaseDate = releaseDate;
    }

    @PrePersist
    public void prePersist() {
        this.watchedAt = LocalDateTime.now();
    }
}
