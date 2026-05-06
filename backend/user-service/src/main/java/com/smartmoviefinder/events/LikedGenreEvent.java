package com.smartmoviefinder.events;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LikedGenreEvent {
    private Long userId;
    private Long genreId;
    private String genreName;
}
