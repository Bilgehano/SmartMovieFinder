package com.smartmoviefinder.genre;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GenreRepository extends JpaRepository<GenreEntity, Long> {

    Optional<GenreEntity> findByName(String name);
    Optional<GenreEntity> findById(Long id);
    List<GenreEntity> findAll();


    void deleteById(Long id);
    void deleteByName(String name);


    boolean existsById(Long id);
    boolean existsByName(String name);
}
