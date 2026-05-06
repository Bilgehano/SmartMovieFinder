package com.smartmoviefinder.graph;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Node("User")
@Getter
@Setter
@NoArgsConstructor
public class UserNode {

    @Id
    private Long userId;

    @Relationship(type = "WATCHED", direction = Relationship.Direction.OUTGOING)
    private List<WatchedRelationship> watched = new ArrayList<>();

    @Relationship(type = "RATED", direction = Relationship.Direction.OUTGOING)
    private List<RatedRelationship> rated = new ArrayList<>();

    @Relationship(type = "WANTS_TO_WATCH", direction = Relationship.Direction.OUTGOING)
    private List<MovieNode> watchLater = new ArrayList<>();

    @Relationship(type = "LIKES_GENRE", direction = Relationship.Direction.OUTGOING)
    private List<GenreNode> likedGenres = new ArrayList<>();

    public UserNode(Long userId) {
        this.userId = userId;
    }
}
