package com.smartmoviefinder.genre;

import com.smartmoviefinder.genre.GenreEntity;
import com.smartmoviefinder.genre.GenreRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/genres")
public class GenreController {

    private final GenreRepository genreRepository;

    public GenreController(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    @GetMapping
    public List<GenreEntity> getAllGenres() {
        return genreRepository.findAll();
    }
}
