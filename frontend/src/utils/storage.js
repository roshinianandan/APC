export function getToken() {
  return localStorage.getItem("accessToken");
}

export function getUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}
