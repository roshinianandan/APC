export function computeGradeFromRecord(rec) {
  if (!rec) return null;

  const att = Number(rec.attendancePct || 0);
  const cgpa = Number(rec.cgpa || 0);
  const internal = Number(rec.avgInternal || 0);
  const backlogs = Number(rec.backlogs || 0);

  // A = HIGH
  if (backlogs === 0 && cgpa >= 8 && att >= 75 && internal >= 70) {
    return "A";
  }

  // B = MEDIUM
  if (backlogs <= 1 && cgpa >= 6.5 && att >= 65) {
    return "B";
  }

  // C = LOW
  return "C";
}

export function getClusterInfoFromGrade(grade) {
  if (!grade) return null;

  if (grade === "A") return { grade: "A", meaning: "HIGH Performer", badge: "success" };
  if (grade === "B") return { grade: "B", meaning: "MEDIUM / AVERAGE Performer", badge: "warning" };
  if (grade === "C") return { grade: "C", meaning: "LOW Performer", badge: "danger" };

  return { grade, meaning: "Performance Group", badge: "secondary" };
}