package com.smartmoviefinder.movie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface WatchLaterRepository extends JpaRepository<WatchLaterEntity, Long> {

    List<WatchLaterEntity> findByUserId(Long userId);

    Optional<WatchLaterEntity> findByUserIdAndTmdbId(Long userId, Long tmdbId);

    boolean existsByUserIdAndTmdbId(Long userId, Long tmdbId);

    @Transactional
    void deleteByUserIdAndTmdbId(Long userId, Long tmdbId);
}
