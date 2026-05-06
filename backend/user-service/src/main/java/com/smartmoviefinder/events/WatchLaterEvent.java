package com.smartmoviefinder.events;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WatchLaterEvent {
    private Long userId;
    private Long tmdbId;
    private String title;
    private String posterPath;
    private String releaseDate;
    private List<Long> genreIds;
}
