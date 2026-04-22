package com.smartmoviefinder.catalogservice.config;

import com.smartmoviefinder.catalogservice.genre.GenreEntity;
import com.smartmoviefinder.catalogservice.genre.GenreRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final GenreRepository genreRepository;

    public DataInitializer(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    @Override
    public void run(String... args) {
        List<GenreEntity> genres = List.of(
                new GenreEntity(28L, "Action"),
                new GenreEntity(12L, "Adventure"),
                new GenreEntity(16L, "Animation"),
                new GenreEntity(35L, "Comedy"),
                new GenreEntity(80L, "Crime"),
                new GenreEntity(99L, "Documentary"),
                new GenreEntity(18L, "Drama"),
                new GenreEntity(10751L, "Family"),
                new GenreEntity(14L, "Fantasy"),
                new GenreEntity(36L, "History"),
                new GenreEntity(27L, "Horror"),
                new GenreEntity(10402L, "Music"),
                new GenreEntity(9648L, "Mystery"),
                new GenreEntity(10749L, "Romance"),
                new GenreEntity(878L, "Science Fiction"),
                new GenreEntity(53L, "Thriller"),
                new GenreEntity(10752L, "War"),
                new GenreEntity(37L, "Western")
        );

        for (GenreEntity genre : genres) {
            if (!genreRepository.existsById(genre.getId())) {
                genreRepository.save(genre);
            }
        }
    }
}
