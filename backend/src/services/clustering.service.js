// backend/src/services/clustering.service.js

function euclidean(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

function mean(vectors) {
  const dim = vectors[0].length;
  const out = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) out[i] += v[i];
  }
  for (let i = 0; i < dim; i++) out[i] /= vectors.length;
  return out;
}

function pickInitialCentroids(X, k) {
  const idx = [];
  while (idx.length < k) {
    const r = Math.floor(Math.random() * X.length);
    if (!idx.includes(r)) idx.push(r);
  }
  return idx.map((i) => X[i].slice());
}

export function runKMeans(X, k, maxIter = 50) {
  if (!Array.isArray(X) || X.length === 0) throw new Error("No data for clustering");
  if (!Number.isFinite(k)) throw new Error("k must be a number");
  if (k < 2) throw new Error("k must be >= 2");
  if (k > X.length) throw new Error("k cannot be greater than number of records");

  let centroids = pickInitialCentroids(X, k);
  let labels = new Array(X.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;

    // assign
    for (let i = 0; i < X.length; i++) {
      let best = 0;
      let bestDist = Infinity;

      for (let c = 0; c < k; c++) {
        const dist = euclidean(X[i], centroids[c]);
        if (dist < bestDist) {
          bestDist = dist;
          best = c;
        }
      }

      if (labels[i] !== best) changed = true;
      labels[i] = best;
    }

    // update
    const groups = Array.from({ length: k }, () => []);
    for (let i = 0; i < X.length; i++) {
      groups[labels[i]].push(X[i]);
    }

    for (let c = 0; c < k; c++) {
      if (groups[c].length === 0) {
        centroids[c] = X[Math.floor(Math.random() * X.length)].slice();
      } else {
        centroids[c] = mean(groups[c]);
      }
    }

    if (!changed) break;
  }

  return { labels, centroids };
}
