/**
 * Grade scale based on total marks out of 100
 * mid(60) + quiz(15) + assignment(15) + attendance(10) = 100
 */
export function calculateGrade(total: number): string {
  if (total >= 90) return 'O';
  if (total >= 80) return 'A';
  if (total >= 70) return 'B';
  if (total >= 60) return 'C';
  if (total >= 50) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}
