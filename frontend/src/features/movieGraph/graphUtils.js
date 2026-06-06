const MAX_CHILDREN_PER_NODE = 5;

function createRelationshipEdge({ id, source, target, className }) {
  return {
    id,
    source,
    target,
    sourceHandle: "source-center",
    targetHandle: "target-center",
    type: "straight",
    className,
  };
}

function getDetailPosition({
  categoryPosition,
  categoryAngle,
  itemIndex,
  itemCount,
}) {
  const detailDistance = 330;
  const detailAngleStep = Math.PI / 6;

  const centeredIndex = itemIndex - (itemCount - 1) / 2;
  const detailAngle = categoryAngle + centeredIndex * detailAngleStep;

  return {
    x: categoryPosition.x + Math.cos(detailAngle) * detailDistance,
    y: categoryPosition.y + Math.sin(detailAngle) * detailDistance,
  };
}

function getDetailItemData(item, categoryLabel) {
  if (typeof item === "string") {
    return {
      movieId: null,
      label: item,
      year: undefined,
      averageRating: undefined,
      subtitle: categoryLabel,
    };
  }

  return {
    movieId: item.movieId ?? null,
    label: item.label ?? "Unknown Movie",
    year: item.year,
    averageRating: item.averageRating,
    subtitle: item.movieId ? "Click to open graph" : categoryLabel,
  };
}

export function buildMovieGraphElements(graphData, expandedCategoryIds = []) {
  const nodes = [];
  const edges = [];

  const centerNodeId = graphData.center.id;
  const centerPosition = { x: 0, y: 0 };

  nodes.push({
    id: centerNodeId,
    type: "movieNode",
    position: centerPosition,
    draggable: false,
    data: {
      nodeKind: "movie",
      movieId: graphData.center.movieId,
      label: graphData.center.label,
      year: graphData.center.year,
      genre: graphData.center.genre,
      averageRating: graphData.center.averageRating,
      subtitle: `Movie • ${graphData.center.year}`,
    },
  });

  const categories = graphData.categories.slice(0, MAX_CHILDREN_PER_NODE);
  const categoryRadius = 380;

  categories.forEach((category, categoryIndex) => {
    const categoryAngle =
      (2 * Math.PI * categoryIndex) / categories.length - Math.PI / 2;

    const categoryPosition = {
      x: Math.cos(categoryAngle) * categoryRadius,
      y: Math.sin(categoryAngle) * categoryRadius,
    };

    const categoryNodeId = `category-${category.id}`;
    const isExpanded = expandedCategoryIds.includes(category.id);

    nodes.push({
      id: categoryNodeId,
      type: "categoryNode",
      position: categoryPosition,
      draggable: false,
      data: {
        nodeKind: "category",
        categoryId: category.id,
        label: category.label,
        subtitle: isExpanded ? "" : "Click to open",
        isExpanded,
      },
    });

    edges.push(
      createRelationshipEdge({
        id: `${centerNodeId}-${categoryNodeId}`,
        source: centerNodeId,
        target: categoryNodeId,
        className: "movie-graph-edge movie-graph-edge-main",
      })
    );

    if (!isExpanded) {
      return;
    }

    const visibleItems = category.items.slice(0, MAX_CHILDREN_PER_NODE);

    visibleItems.forEach((item, itemIndex) => {
      const detailPosition = getDetailPosition({
        categoryPosition,
        categoryAngle,
        itemIndex,
        itemCount: visibleItems.length,
      });

      const detailItemData = getDetailItemData(item, category.label);

      const detailNodeId = detailItemData.movieId
        ? `detail-${category.id}-${detailItemData.movieId}`
        : `detail-${category.id}-${itemIndex}`;

      nodes.push({
        id: detailNodeId,
        type: "detailNode",
        position: detailPosition,
        draggable: false,
        data: {
          nodeKind: "detail",
          movieId: detailItemData.movieId,
          label: detailItemData.label,
          year: detailItemData.year,
          averageRating: detailItemData.averageRating,
          subtitle: detailItemData.subtitle,
        },
      });

      edges.push(
        createRelationshipEdge({
          id: `${categoryNodeId}-${detailNodeId}`,
          source: categoryNodeId,
          target: detailNodeId,
          className: "movie-graph-edge movie-graph-edge-detail",
        })
      );
    });
  });

  return { nodes, edges };
}