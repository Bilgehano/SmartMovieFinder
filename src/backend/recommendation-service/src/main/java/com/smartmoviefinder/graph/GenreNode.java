package com.smartmoviefinder.graph;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Node("Genre")
@Getter
@Setter
@NoArgsConstructor
public class GenreNode {

    @Id
    private Long genreId;

    private String name;

    public GenreNode(Long genreId, String name) {
        this.genreId = genreId;
        this.name = name;
    }
}
