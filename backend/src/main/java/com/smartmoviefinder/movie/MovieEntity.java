package com.smartmoviefinder.movie;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movies")
@Getter
@Setter
@NoArgsConstructor
public class MovieEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long tmdbId;

    @Column(nullable = false)
    private String title;

    private String posterPath;

    private String releaseDate;

    public MovieEntity(Long tmdbId, String title, String posterPath, String releaseDate) {
        this.tmdbId = tmdbId;
        this.title = title;
        this.posterPath = posterPath;
        this.releaseDate = releaseDate;
    }
}
