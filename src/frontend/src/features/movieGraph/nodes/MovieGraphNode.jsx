import { Handle, Position } from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Tags, Wand2 } from "lucide-react";

function getCategoryIcon(categoryId) {
  switch (categoryId) {
    case "same-genre":
      return Tags;

    case "similar-movies":
      return Sparkles;

    case "recommendations":
      return Wand2;

    default:
      return null;
  }
}

function BaseGraphNode({ data, variant }) {
  const navigate = useNavigate();
  const expandedClass = data.isExpanded ? "graph-node-expanded" : "";

  const CategoryIcon =
    data.nodeKind === "category"
      ? getCategoryIcon(data.categoryId)
      : null;

  function handleNodeContentClick(event) {
    if (data.nodeKind !== "detail") {
      return;
    }

    if (!data.movieId) {
      console.warn("Detail node has no movieId:", data);
      return;
    }

    event.stopPropagation();
    navigate(`/movies/${data.movieId}/graph`);
  }

  return (
    <div
      className={`graph-node graph-node-${variant} ${expandedClass}`}
      onClick={handleNodeContentClick}
      role={
        data.nodeKind === "detail" && data.movieId
          ? "button"
          : undefined
      }
      tabIndex={
        data.nodeKind === "detail" && data.movieId
          ? 0
          : undefined
      }
    >
      <Handle
        id="target-center"
        type="target"
        position={Position.Top}
        className="graph-node-center-handle"
      />

      {CategoryIcon && (
        <div className="graph-node-category-icon">
          <CategoryIcon size={19} aria-hidden="true" />
        </div>
      )}

      <div className="graph-node-label">{data.label}</div>

      {data.subtitle && (
        <div className="graph-node-subtitle">
          {data.subtitle}
        </div>
      )}

      <Handle
        id="source-center"
        type="source"
        position={Position.Top}
        className="graph-node-center-handle"
      />
    </div>
  );
}

export function MovieNode(props) {
  return <BaseGraphNode {...props} variant="movie" />;
}

export function CategoryNode(props) {
  return <BaseGraphNode {...props} variant="category" />;
}

export function DetailNode(props) {
  return <BaseGraphNode {...props} variant="detail" />;
}