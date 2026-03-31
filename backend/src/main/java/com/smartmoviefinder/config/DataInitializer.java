package com.smartmoviefinder.config;

import com.smartmoviefinder.genre.GenreEntity;
import com.smartmoviefinder.genre.GenreRepository;

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
        List<String> genres = List.of(
                "Action", "Adventure", "Animation", "Comedy", "Crime",
                "Documentary", "Drama", "Family", "Fantasy", "History",
                "Horror", "Music", "Mystery", "Romance", "Science Fiction",
                "Thriller", "War", "Western"
        );

        for (String name : genres) {
            if (!genreRepository.existsByName(name)) {
                genreRepository.save(new GenreEntity(name));
            }
        }

        System.out.println("Genres initialized: " + genreRepository.count());
    }
}
