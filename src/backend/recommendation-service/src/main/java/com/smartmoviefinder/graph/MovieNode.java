package com.smartmoviefinder.graph;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Node("Movie")
@Getter
@Setter
@NoArgsConstructor
public class MovieNode {

    @Id
    private Long tmdbId;

    private String title;
    private String posterPath;
    private String releaseDate;

    @Relationship(type = "HAS_GENRE", direction = Relationship.Direction.OUTGOING)
    private List<GenreNode> genres = new ArrayList<>();

    public MovieNode(Long tmdbId, String title, String posterPath, String releaseDate) {
        this.tmdbId = tmdbId;
        this.title = title;
        this.posterPath = posterPath;
        this.releaseDate = releaseDate;
    }
}
