package com.smartmoviefinder.graph;

import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@RelationshipProperties
@Getter
@Setter
@NoArgsConstructor
public class WatchedRelationship {

    @RelationshipId
    private Long id;

    private String watchedAt;

    @TargetNode
    private MovieNode movie;

    public WatchedRelationship(MovieNode movie, String watchedAt) {
        this.movie = movie;
        this.watchedAt = watchedAt;
    }
}
