package com.smartmoviefinder.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public  interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findById(Long id);
    List<UserEntity> findAll();


    void deleteById(Long id);
    void deleteByUsername(String username);
    void deleteByEmail(String email);


    boolean existsById(Long id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}


