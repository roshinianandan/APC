export function roleBadgeClass(role) {
  if (role === "admin") return "bg-danger";
  if (role === "faculty") return "bg-success";
  return "bg-primary";
}
