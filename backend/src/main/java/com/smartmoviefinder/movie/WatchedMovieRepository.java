package com.smartmoviefinder.movie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface WatchedMovieRepository extends JpaRepository<WatchedMovieEntity, Long> {

    List<WatchedMovieEntity> findByUserId(Long userId);

    Optional<WatchedMovieEntity> findByUserIdAndTmdbId(Long userId, Long tmdbId);

    boolean existsByUserIdAndTmdbId(Long userId, Long tmdbId);

    @Transactional
    void deleteByUserIdAndTmdbId(Long userId, Long tmdbId);
}
