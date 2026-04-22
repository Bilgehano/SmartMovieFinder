package com.smartmoviefinder.genre;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "genres")
public class GenreEntity {

    @Id
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public GenreEntity() {
    }

    public GenreEntity(String name) {
        this.name = name;
    }

    public GenreEntity(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
