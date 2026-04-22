package com.smartmoviefinder.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_favorite_genres", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "genre_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class FavoriteGenreEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "genre_id", nullable = false)
    private Long genreId;

    public FavoriteGenreEntity(Long userId, Long genreId) {
        this.userId = userId;
        this.genreId = genreId;
    }
}
