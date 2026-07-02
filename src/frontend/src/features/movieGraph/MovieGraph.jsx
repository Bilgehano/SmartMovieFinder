import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./MovieGraph.css";

import { buildMovieGraphElements } from "./graphUtils";
import {
  CategoryNode,
  DetailNode,
  MovieNode,
} from "./nodes/MovieGraphNode";

const nodeTypes = {
  movieNode: MovieNode,
  categoryNode: CategoryNode,
  detailNode: DetailNode,
};

const nodeOrigin = [0.5, 0.5];

function MovieGraph({ graphData }) {
  const navigate = useNavigate();

  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);
  const [moviePopupData, setMoviePopupData] = useState(null);

  const graphElements = useMemo(() => {
    return buildMovieGraphElements(
      graphData,
      expandedCategoryIds
    );
  }, [graphData, expandedCategoryIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    graphElements.nodes
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    graphElements.edges
  );

  useEffect(() => {
    setNodes(graphElements.nodes);
    setEdges(graphElements.edges);
  }, [graphElements, setNodes, setEdges]);

  useEffect(() => {
    setExpandedCategoryIds([]);
    setMoviePopupData(null);
  }, [graphData]);

  function handleNodeClick(event, node) {
    if (node.data.nodeKind === "movie") {
      setMoviePopupData(node.data);
      return;
    }

    if (
      node.data.nodeKind === "detail" &&
      node.data.movieId
    ) {
      navigate(`/movies/${node.data.movieId}/graph`);
      return;
    }

    if (node.data.nodeKind === "category") {
      const categoryId = node.data.categoryId;

      setExpandedCategoryIds((currentCategoryIds) => {
        const isAlreadyExpanded =
          currentCategoryIds.includes(categoryId);

        if (isAlreadyExpanded) {
          return currentCategoryIds.filter(
            (id) => id !== categoryId
          );
        }

        return [...currentCategoryIds, categoryId];
      });
    }
  }

  function handlePaneClick() {
    setMoviePopupData(null);
  }

  function handleClosePopup() {
    setMoviePopupData(null);
  }

  function handleNodesChange(changes) {
    const allowedChanges = changes.filter(
      (change) => change.type !== "position"
    );

    onNodesChange(allowedChanges);
  }

  return (
    <div className="movie-graph-layout">
      <div className="movie-graph-canvas">
        <div className="movie-graph-guide">
          <strong>Explore connections</strong>
          <span>
            Click a category to expand related movies.
          </span>
          <span>
            Click a related movie to open its graph.
          </span>
        </div>

        <div className="movie-graph-legend">
          <div className="movie-graph-legend-item">
            <span className="movie-graph-legend-marker movie-graph-legend-marker-center" />
            <span>Selected movie</span>
          </div>

          <div className="movie-graph-legend-item">
            <span className="movie-graph-legend-marker movie-graph-legend-marker-category" />
            <span>Category</span>
          </div>

          <div className="movie-graph-legend-item">
            <span className="movie-graph-legend-marker movie-graph-legend-marker-detail" />
            <span>Related movie</span>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodeOrigin={nodeOrigin}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.35}
          maxZoom={1.6}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable
          panOnDrag
          zoomOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
          />

          <Controls showInteractive={false} />
        </ReactFlow>

        {moviePopupData && (
          <div className="movie-graph-popup">
            <button
              type="button"
              className="movie-graph-popup-close"
              onClick={handleClosePopup}
              aria-label="Close movie popup"
            >
              ×
            </button>

            <p className="movie-graph-popup-kicker">
              Movie Details
            </p>

            <h3>{moviePopupData.label}</h3>

            <div className="movie-graph-popup-list">
              <div>
                <span>Year</span>
                <strong>{moviePopupData.year}</strong>
              </div>

              <div>
                <span>Genre</span>
                <strong>
                  {moviePopupData.genre ?? "Unknown"}
                </strong>
              </div>

              <div>
                <span>Average Rating</span>
                <strong>
                  {moviePopupData.averageRating ?? "N/A"}
                </strong>
              </div>
            </div>

            <Link
              className="movie-graph-popup-link"
              to={`/movies/${moviePopupData.movieId}`}
            >
              Open Movie Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieGraph;