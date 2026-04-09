package com.smartmoviefinder.movie;

import java.time.LocalDateTime;

import com.smartmoviefinder.user.UserEntity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movie_ratings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "movie_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class MovieRatingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private MovieEntity movie;

    @Column(nullable = false)
    private int rating;

    @Column(nullable = false)
    private LocalDateTime ratedAt;

    public MovieRatingEntity(UserEntity user, MovieEntity movie, int rating) {
        this.user = user;
        this.movie = movie;
        this.rating = rating;
    }

    @PrePersist
    public void prePersist() {
        this.ratedAt = LocalDateTime.now();
    }
}
