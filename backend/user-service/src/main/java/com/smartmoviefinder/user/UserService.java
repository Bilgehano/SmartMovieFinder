package com.smartmoviefinder.user;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartmoviefinder.events.EventPublisher;
import com.smartmoviefinder.genre.GenreEntity;
import com.smartmoviefinder.genre.GenreRepository;
import com.smartmoviefinder.movie.MovieRatingEntity;
import com.smartmoviefinder.movie.MovieRatingRepository;
import com.smartmoviefinder.movie.WatchLaterEntity;
import com.smartmoviefinder.movie.WatchLaterRepository;
import com.smartmoviefinder.movie.WatchedMovieEntity;
import com.smartmoviefinder.movie.WatchedMovieRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final WatchedMovieRepository watchedMovieRepository;
    private final WatchLaterRepository watchLaterRepository;
    private final MovieRatingRepository movieRatingRepository;
    private final FavoriteGenreRepository favoriteGenreRepository;
    private final EventPublisher eventPublisher;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository, GenreRepository genreRepository,
                       WatchedMovieRepository watchedMovieRepository, WatchLaterRepository watchLaterRepository,
                       MovieRatingRepository movieRatingRepository,
                       FavoriteGenreRepository favoriteGenreRepository,
                       EventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
        this.watchedMovieRepository = watchedMovieRepository;
        this.watchLaterRepository = watchLaterRepository;
        this.movieRatingRepository = movieRatingRepository;
        this.favoriteGenreRepository = favoriteGenreRepository;
        this.eventPublisher = eventPublisher;
    }

    public UserEntity register(String username, String email, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already taken");
        }
        String hashedPassword = passwordEncoder.encode(password);
        return userRepository.save(new UserEntity(username, email, hashedPassword));
    }

    public UserEntity login(String username, String password) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }

    public UserEntity createUser(UserEntity user) {
        return userRepository.save(user);
    }

    public UserEntity getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public UserEntity getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public boolean userExistsById(Long id) {
        return userRepository.existsById(id);
    }

    public boolean userExistsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean userExistsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void addWatchedMovie(Long userId, Long tmdbId, String title, String posterPath, String releaseDate, String genreIds) {
        requireUserExists(userId);
        if (!watchedMovieRepository.existsByUserIdAndTmdbId(userId, tmdbId)) {
            watchedMovieRepository.save(new WatchedMovieEntity(userId, tmdbId, title, posterPath, releaseDate, genreIds));
        }
        // Auto-remove from watch later when marked as watched
        if (watchLaterRepository.existsByUserIdAndTmdbId(userId, tmdbId)) {
            watchLaterRepository.deleteByUserIdAndTmdbId(userId, tmdbId);
            eventPublisher.publishWatchLaterRemoved(userId, tmdbId);
        }
        eventPublisher.publishWatched(userId, tmdbId, title, posterPath, releaseDate, genreIds,
                java.time.LocalDateTime.now().toString());
    }

    public void addToWatchLater(Long userId, Long tmdbId, String title, String posterPath, String releaseDate) {
        requireUserExists(userId);
        if (!watchLaterRepository.existsByUserIdAndTmdbId(userId, tmdbId)) {
            watchLaterRepository.save(new WatchLaterEntity(userId, tmdbId, title, posterPath, releaseDate));
            eventPublisher.publishWatchLater(userId, tmdbId, title, posterPath, releaseDate, null);
        }
    }

    public void removeFromWatchLater(Long userId, Long tmdbId) {
        requireUserExists(userId);
        watchLaterRepository.deleteByUserIdAndTmdbId(userId, tmdbId);
        eventPublisher.publishWatchLaterRemoved(userId, tmdbId);
    }

    public List<WatchLaterEntity> getWatchLaterList(Long userId) {
        requireUserExists(userId);
        return watchLaterRepository.findByUserId(userId);
    }

    public boolean isInWatchLater(Long userId, Long tmdbId) {
        requireUserExists(userId);
        return watchLaterRepository.existsByUserIdAndTmdbId(userId, tmdbId);
    }

    public void addFavoriteGenre(Long userId, Long genreId) {
        requireUserExists(userId);
        GenreEntity genre = genreRepository.findById(genreId)
                .orElseThrow(() -> new RuntimeException("Genre not found with id: " + genreId));
        if (!favoriteGenreRepository.existsByUserIdAndGenreId(userId, genre.getId())) {
            favoriteGenreRepository.save(new FavoriteGenreEntity(userId, genre.getId()));
            eventPublisher.publishLikedGenre(userId, genre.getId(), genre.getName());
        }
    }

    public void rateMovie(Long userId, Long tmdbId, String title, String posterPath, String releaseDate, String genreIds, int rating) {
        requireUserExists(userId);
        MovieRatingEntity existingRating = movieRatingRepository.existsByUserIdAndTmdbId(userId, tmdbId)
                ? movieRatingRepository.findByUserIdAndTmdbId(userId, tmdbId).orElse(null)
                : null;
        if (existingRating != null) {
            existingRating.setRating(rating);
            movieRatingRepository.save(existingRating);
        } else {
            movieRatingRepository.save(new MovieRatingEntity(userId, tmdbId, title, posterPath, releaseDate, genreIds, rating));
        }
        eventPublisher.publishRated(userId, tmdbId, title, posterPath, releaseDate, genreIds, rating);
    }

    public List<WatchedMovieEntity> getWatchedMovies(Long userId) {
        requireUserExists(userId);
        return watchedMovieRepository.findByUserId(userId);
    }

    public List<String> getFavoriteGenres(Long userId) {
        requireUserExists(userId);
        List<Long> favoriteGenreIds = favoriteGenreRepository.findByUserId(userId).stream()
                .map(FavoriteGenreEntity::getGenreId)
                .toList();
        return genreRepository.findAllById(favoriteGenreIds).stream()
                .map(GenreEntity::getName)
                .collect(Collectors.toList());
    }

    public List<MovieRatingEntity> getMovieRatings(Long userId) {
        requireUserExists(userId);
        return movieRatingRepository.findByUserId(userId);
    }

    public void deleteWatchedMovie(Long userId, Long tmdbId) {
        requireUserExists(userId);
        watchedMovieRepository.deleteByUserIdAndTmdbId(userId, tmdbId);
    }

    public void deleteFavoriteGenre(Long userId, Long genreId) {
        requireUserExists(userId);
        favoriteGenreRepository.deleteByUserIdAndGenreId(userId, genreId);
    }

    public void deleteMovieRating(Long userId, Long tmdbId) {
        requireUserExists(userId);
        movieRatingRepository.deleteByUserIdAndTmdbId(userId, tmdbId);
    }

    private void requireUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }
}
