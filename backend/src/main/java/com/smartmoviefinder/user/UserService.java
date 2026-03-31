package com.smartmoviefinder.user;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.smartmoviefinder.genre.GenreEntity;
import com.smartmoviefinder.genre.GenreRepository;
import com.smartmoviefinder.movie.MovieEntity;

@Component
public class UserService {
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;

    @Autowired
    public UserService(UserRepository userRepository, GenreRepository genreRepository) {
        this.userRepository = userRepository;
        this.genreRepository = genreRepository;
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




    public void addWatchedMovie(Long userId, Long movieId) {
        // TODO: implement later
    }   

    public void addFavoriteGenre(Long userId, Long genreId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        GenreEntity genre = genreRepository.findById(genreId)
                .orElseThrow(() -> new RuntimeException("Genre not found with id: " + genreId));

                
        user.getFavoriteGenres().add(genre);
        userRepository.save(user);
    }



    public void rateMovie(Long userId, Long movieId, int rating) {
        // TODO: implement later
    }




    public List<MovieEntity> getWatchedMovies(Long userId) {
        // TODO Auto-generated method stub
        return null;
    }

    public List<String> getFavoriteGenres(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return user.getFavoriteGenres().stream()
                .map(GenreEntity::getName)
                .collect(Collectors.toList());
    }

    public List<String> getMovieRatings(Long userId) {
        // TODO Auto-generated method stub
        return null;
    }




    public void deleteWatchedMovie(Long userId, Long movieId) {
        // TODO Auto-generated method stub
    }

    public void deleteFavoriteGenre(Long userId, Long genreId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.getFavoriteGenres().removeIf(genre -> genre.getId().equals(genreId));
        userRepository.save(user);
    }

    public void deleteMovieRating(Long userId, Long movieId) {
        // TODO Auto-generated method stub
    }




    
    
}
