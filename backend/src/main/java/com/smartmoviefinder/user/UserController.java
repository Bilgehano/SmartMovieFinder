package com.smartmoviefinder.user;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartmoviefinder.movie.MovieEntity;



@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;


    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/test")
    public String testEndpoint() {
        return "UserController is working!";
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
        } else {
            return "User not found with ID: " + id;
        }
    }


    @GetMapping("/username/{username}")
    public String getUserByUsername(@PathVariable String username) {
        UserEntity user = userService.getUserByUsername(username);
        if (user != null) {
            return "User found: " + user.getUsername();
        } else {
            return "User not found with username: " + username;
        }
    }






    @PostMapping
    public UserEntity createUser(@RequestBody UserEntity user) {
        return userService.createUser(user);
    }


    //Add watched movie
    @PostMapping("/{userId}/watched/{movieId}")
    public void addWatchedMovie(@PathVariable Long userId, @PathVariable Long movieId) {
        userService.addWatchedMovie(userId, movieId);
    }

    //Add favorite genre
    @PostMapping("/{userId}/favorite-genre/{genreId}")
    public void addFavoriteGenre(@PathVariable Long userId, @PathVariable Long genreId) {
        userService.addFavoriteGenre(userId, genreId);
    }

    //Rate a movie
    @PostMapping("/{userId}/rate/{movieId}/{rating}")
    public void rateMovie(@PathVariable Long userId, @PathVariable Long movieId, @PathVariable int rating) {
        userService.rateMovie(userId, movieId, rating);
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



    //Get watched movies for a user
    @GetMapping("/{userId}/watched")
    public List<MovieEntity> getWatchedMovies(@PathVariable Long userId) {
        return userService.getWatchedMovies(userId);
    }

    //Get favorite genres for a user
    @GetMapping("/{userId}/favorite-genres")
    public List<String> getFavoriteGenres(@PathVariable Long userId) {
        return userService.getFavoriteGenres(userId);
    }

    //Get movie ratings for a user
    @GetMapping("/{userId}/ratings")    
    public List<String> getMovieRatings(@PathVariable Long userId) {
        return userService.getMovieRatings(userId);
    }


    //Delete a user
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }


    //Delete watched movie
    @DeleteMapping("/{userId}/watched/{movieId}")
    public void deleteWatchedMovie(@PathVariable Long userId, @PathVariable Long movieId) {
        userService.deleteWatchedMovie(userId, movieId);
    }

    //Delete favorite genre
    @DeleteMapping("/{userId}/favorite-genre/{genreId}")
    public void deleteFavoriteGenre(@PathVariable Long userId, @PathVariable Long genreId) {
        userService.deleteFavoriteGenre(userId, genreId);
    }

    //Delete movie rating
    @DeleteMapping("/{userId}/rate/{movieId}")
    public void deleteMovieRating(@PathVariable Long userId, @PathVariable Long movieId) {  
        userService.deleteMovieRating(userId, movieId);
    }






}