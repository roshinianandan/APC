/**
 * Map cluster -> label + suggested action.
 * You can improve this logic later based on centroid meaning.
 */
export function clusterInsights(k) {
  // Generic fallback names
  const defaults = Array.from({ length: k }, (_, i) => ({
    cluster: i,
    name: `Cluster ${i + 1}`,
    meaning: "Group of students with similar academic patterns.",
    suggestions: [
      "Review attendance and internal scores regularly.",
      "Maintain consistent study schedule."
    ]
  }));

  return defaults;
}
