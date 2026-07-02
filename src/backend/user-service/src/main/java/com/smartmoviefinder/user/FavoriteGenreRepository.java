package com.smartmoviefinder.user;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FavoriteGenreRepository extends JpaRepository<FavoriteGenreEntity, Long> {

    boolean existsByUserIdAndGenreId(Long userId, Long genreId);

    List<FavoriteGenreEntity> findByUserId(Long userId);

    @Transactional
    void deleteByUserIdAndGenreId(Long userId, Long genreId);
}
