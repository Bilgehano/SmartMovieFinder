package com.smartmoviefinder.user;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartmoviefinder.movie.MovieRatingEntity;
import com.smartmoviefinder.movie.WatchedMovieEntity;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/test")
    public String testEndpoint() {
        return "User Service is working!";
    }

    @GetMapping
    public List<UserEntity> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public String getUserById(@PathVariable Long id) {
        UserEntity user = userService.getUserById(id);
        if (user != null) {
            return "User found: " + user.getUsername();
        }
        return "User not found with ID: " + id;
    }

    @GetMapping("/username/{username}")
    public String getUserByUsername(@PathVariable String username) {
        UserEntity user = userService.getUserByUsername(username);
        if (user != null) {
            return "User found: " + user.getUsername();
        }
        return "User not found with username: " + username;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            UserEntity user = userService.register(body.get("username"), body.get("email"), body.get("password"));
            return ResponseEntity.ok(user);
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            UserEntity user = userService.login(body.get("username"), body.get("password"));
            return ResponseEntity.ok(user);
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    @PostMapping
    public UserEntity createUser(@RequestBody UserEntity user) {
        return userService.createUser(user);
    }

    @GetMapping("/exists/id/{id}")
    public boolean userExistsById(@PathVariable Long id) {
        return userService.userExistsById(id);
    }

    @GetMapping("/exists/username/{username}")
    public boolean userExistsByUsername(@PathVariable String username) {
        return userService.userExistsByUsername(username);
    }

    @GetMapping("/exists/email/{email}")
    public boolean userExistsByEmail(@PathVariable String email) {
        return userService.userExistsByEmail(email);
    }

    @PostMapping("/{userId}/watched")
    public void addWatchedMovie(@PathVariable Long userId, @RequestBody Map<String, String> movieData) {
        Long tmdbId = Long.parseLong(movieData.get("tmdbId"));
        String title = movieData.get("title");
        String posterPath = movieData.get("posterPath");
        String releaseDate = movieData.get("releaseDate");
        userService.addWatchedMovie(userId, tmdbId, title, posterPath, releaseDate);
    }

    @PostMapping("/{userId}/favorite-genre/{genreId}")
    public void addFavoriteGenre(@PathVariable Long userId, @PathVariable Long genreId) {
        userService.addFavoriteGenre(userId, genreId);
    }

    @PostMapping("/{userId}/rate/{rating}")
    public void rateMovie(@PathVariable Long userId, @PathVariable int rating, @RequestBody Map<String, String> movieData) {
        Long tmdbId = Long.parseLong(movieData.get("tmdbId"));
        String title = movieData.get("title");
        String posterPath = movieData.get("posterPath");
        String releaseDate = movieData.get("releaseDate");
        userService.rateMovie(userId, tmdbId, title, posterPath, releaseDate, rating);
    }

    @GetMapping("/{userId}/watched")
    public List<WatchedMovieEntity> getWatchedMovies(@PathVariable Long userId) {
        return userService.getWatchedMovies(userId);
    }

    @GetMapping("/{userId}/favorite-genres")
    public List<String> getFavoriteGenres(@PathVariable Long userId) {
        return userService.getFavoriteGenres(userId);
    }

    @GetMapping("/{userId}/ratings")
    public List<MovieRatingEntity> getMovieRatings(@PathVariable Long userId) {
        return userService.getMovieRatings(userId);
    }

    @DeleteMapping("/{userId}/watched/{tmdbId}")
    public void deleteWatchedMovie(@PathVariable Long userId, @PathVariable Long tmdbId) {
        userService.deleteWatchedMovie(userId, tmdbId);
    }

    @DeleteMapping("/{userId}/favorite-genre/{genreId}")
    public void deleteFavoriteGenre(@PathVariable Long userId, @PathVariable Long genreId) {
        userService.deleteFavoriteGenre(userId, genreId);
    }

    @DeleteMapping("/{userId}/rate/{tmdbId}")
    public void deleteMovieRating(@PathVariable Long userId, @PathVariable Long tmdbId) {
        userService.deleteMovieRating(userId, tmdbId);
    }
}