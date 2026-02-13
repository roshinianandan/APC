export function jsonPretty(obj) {
  return JSON.stringify(obj || {}, null, 2);
}
