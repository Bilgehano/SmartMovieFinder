package com.smartmoviefinder.user;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.smartmoviefinder.genre.GenreEntity;
import com.smartmoviefinder.genre.GenreRepository;
import com.smartmoviefinder.movie.MovieEntity;
import com.smartmoviefinder.movie.MovieRatingEntity;
import com.smartmoviefinder.movie.MovieRatingRepository;
import com.smartmoviefinder.movie.MovieRepository;

@Component
public class UserService {
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final MovieRepository movieRepository;
    private final MovieRatingRepository movieRatingRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public UserService(UserRepository userRepository, GenreRepository genreRepository,
                       MovieRepository movieRepository, MovieRatingRepository movieRatingRepository) {
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
        this.movieRepository = movieRepository;
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
        MovieEntity movie = findOrCreateMovie(tmdbId, title, posterPath, releaseDate);

        user.getWatchedMovies().add(movie);
        userRepository.save(user);
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
        MovieEntity movie = findOrCreateMovie(tmdbId, title, posterPath, releaseDate);

        MovieRatingEntity existingRating = movieRatingRepository.findByUserIdAndMovieId(userId, movie.getId())
                .orElse(null);

        if (existingRating != null) {
            existingRating.setRating(rating);
            movieRatingRepository.save(existingRating);
        } else {
            MovieRatingEntity newRating = new MovieRatingEntity(user, movie, rating);
            movieRatingRepository.save(newRating);
        }
    }




    public List<MovieEntity> getWatchedMovies(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return List.copyOf(user.getWatchedMovies());
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
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.getWatchedMovies().removeIf(movie -> movie.getTmdbId().equals(tmdbId));
        userRepository.save(user);
    }

    public void deleteFavoriteGenre(Long userId, Long genreId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.getFavoriteGenres().removeIf(genre -> genre.getId().equals(genreId));
        userRepository.save(user);
    }

    public void deleteMovieRating(Long userId, Long tmdbId) {
        MovieEntity movie = movieRepository.findByTmdbId(tmdbId)
                .orElseThrow(() -> new RuntimeException("Movie not found with tmdbId: " + tmdbId));
        MovieRatingEntity rating = movieRatingRepository.findByUserIdAndMovieId(userId, movie.getId())
                .orElseThrow(() -> new RuntimeException("Rating not found for user " + userId + " and movie tmdbId " + tmdbId));
        movieRatingRepository.delete(rating);
    }


    private MovieEntity findOrCreateMovie(Long tmdbId, String title, String posterPath, String releaseDate) {
        return movieRepository.findByTmdbId(tmdbId)
                .orElseGet(() -> movieRepository.save(new MovieEntity(tmdbId, title, posterPath, releaseDate)));
    }
}
