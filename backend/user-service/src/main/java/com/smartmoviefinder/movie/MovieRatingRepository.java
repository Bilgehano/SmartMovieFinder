package com.smartmoviefinder.movie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface MovieRatingRepository extends JpaRepository<MovieRatingEntity, Long> {

    Optional<MovieRatingEntity> findByUserIdAndTmdbId(Long userId, Long tmdbId);

    boolean existsByUserIdAndTmdbId(Long userId, Long tmdbId);

    List<MovieRatingEntity> findByUserId(Long userId);

    @Transactional
    void deleteByUserIdAndTmdbId(Long userId, Long tmdbId);
}
