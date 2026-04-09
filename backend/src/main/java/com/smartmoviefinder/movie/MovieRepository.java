package com.smartmoviefinder.movie;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<MovieEntity, Long> {

    Optional<MovieEntity> findByTmdbId(Long tmdbId);

    boolean existsByTmdbId(Long tmdbId);
}
