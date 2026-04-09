package com.smartmoviefinder.movie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRatingRepository extends JpaRepository<MovieRatingEntity, Long> {

    Optional<MovieRatingEntity> findByUserIdAndMovieId(Long userId, Long movieId);

    List<MovieRatingEntity> findByUserId(Long userId);

    List<MovieRatingEntity> findByMovieId(Long movieId);

    void deleteByUserIdAndMovieId(Long userId, Long movieId);
}
