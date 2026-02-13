export function formatStudentLine(profile) {
  if (!profile) return "";
  return profile.registerNo + " - " + profile.department + " (Year " + profile.year + " " + profile.section + ")";
}
