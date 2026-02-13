export function safeNumber(v, fallback) {
  if (typeof v === "number") return v;
  const n = Number(v);
  return isNaN(n) ? (fallback || 0) : n;
}
