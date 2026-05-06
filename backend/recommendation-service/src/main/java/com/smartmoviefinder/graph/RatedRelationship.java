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
public class RatedRelationship {

    @RelationshipId
    private Long id;

    private int rating;

    @TargetNode
    private MovieNode movie;

    public RatedRelationship(MovieNode movie, int rating) {
        this.movie = movie;
        this.rating = rating;
    }
}
