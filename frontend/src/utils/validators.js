export function isEmail(value) {
  return typeof value === "string" && value.indexOf("@") !== -1;
}
