import { Handle, Position } from "@xyflow/react";

function BaseGraphNode({ data, variant }) {
  const expandedClass = data.isExpanded ? "graph-node-expanded" : "";

  return (
    <div className={`graph-node graph-node-${variant} ${expandedClass}`}>
      <Handle
        id="target-center"
        type="target"
        position={Position.Top}
        className="graph-node-center-handle"
      />

      <div className="graph-node-label">{data.label}</div>

      {data.subtitle && (
        <div className="graph-node-subtitle">{data.subtitle}</div>
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