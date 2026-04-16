package com.smartmoviefinder.user;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.smartmoviefinder.genre.GenreEntity;
import com.smartmoviefinder.genre.GenreRepository;
import com.smartmoviefinder.movie.MovieRatingEntity;
import com.smartmoviefinder.movie.MovieRatingRepository;
import com.smartmoviefinder.movie.WatchedMovieEntity;
import com.smartmoviefinder.movie.WatchedMovieRepository;

@Component
public class UserService {
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final WatchedMovieRepository watchedMovieRepository;
    private final MovieRatingRepository movieRatingRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public UserService(UserRepository userRepository, GenreRepository genreRepository,
                       WatchedMovieRepository watchedMovieRepository, MovieRatingRepository movieRatingRepository) {
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
        this.watchedMovieRepository = watchedMovieRepository;
        this.movieRatingRepository = movieRatingRepository;
    }




    // Authentication methods

    public UserEntity register(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already taken");
        }
        String hashedPassword = passwordEncoder.encode(password);
        UserEntity user = new UserEntity(username, email, hashedPassword);
        return userRepository.save(user);
    }

    public UserEntity login(String username, String password) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }


    // CRUD operations for UserEntity

    public UserEntity createUser(UserEntity user) {
        return userRepository.save(user);
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    public UserEntity getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public UserEntity updateUser(UserEntity user) {
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }
    public boolean userExistsById(Long id) {
        return userRepository.existsById(id);
    }


    // Authentication and validation methods
    public boolean userExistsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    public boolean userExistsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }




    public void addWatchedMovie(Long userId, Long tmdbId, String title, String posterPath, String releaseDate) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        if (!watchedMovieRepository.existsByUserIdAndTmdbId(userId, tmdbId)) {
            watchedMovieRepository.save(new WatchedMovieEntity(user, tmdbId, title, posterPath, releaseDate));
        }
    }


    public void addFavoriteGenre(Long userId, Long genreId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        GenreEntity genre = genreRepository.findById(genreId)
                .orElseThrow(() -> new RuntimeException("Genre not found with id: " + genreId));

                
        user.getFavoriteGenres().add(genre);
        userRepository.save(user);
    }



    public void rateMovie(Long userId, Long tmdbId, String title, String posterPath, String releaseDate, int rating) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        MovieRatingEntity existingRating = movieRatingRepository.existsByUserIdAndTmdbId(userId, tmdbId)
                ? movieRatingRepository.findByUserIdAndTmdbId(userId, tmdbId).orElse(null)
                : null;
        if (existingRating != null) {
            existingRating.setRating(rating);
            movieRatingRepository.save(existingRating);
        } else {
            movieRatingRepository.save(new MovieRatingEntity(user, tmdbId, title, posterPath, releaseDate, rating));
        }
    }




    public List<WatchedMovieEntity> getWatchedMovies(Long userId) {
        return watchedMovieRepository.findByUserId(userId);
    }

    public List<String> getFavoriteGenres(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return user.getFavoriteGenres().stream()
                .map(GenreEntity::getName)
                .collect(Collectors.toList());
    }

    public List<MovieRatingEntity> getMovieRatings(Long userId) {
        return movieRatingRepository.findByUserId(userId);
    }




    public void deleteWatchedMovie(Long userId, Long tmdbId) {
        watchedMovieRepository.deleteByUserIdAndTmdbId(userId, tmdbId);
    }

    public void deleteFavoriteGenre(Long userId, Long genreId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.getFavoriteGenres().removeIf(genre -> genre.getId().equals(genreId));
        userRepository.save(user);
    }

    public void deleteMovieRating(Long userId, Long tmdbId) {
        movieRatingRepository.deleteByUserIdAndTmdbId(userId, tmdbId);
    }
}
