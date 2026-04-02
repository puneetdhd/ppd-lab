"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateGrade = calculateGrade;
/**
 * Grade scale based on total marks out of 100
 * mid(60) + quiz(15) + assignment(15) + attendance(10) = 100
 */
function calculateGrade(total) {
    if (total >= 90)
        return 'O';
    if (total >= 80)
        return 'E';
    if (total >= 70)
        return 'A';
    if (total >= 60)
        return 'B';
    if (total >= 50)
        return 'C';
    if (total >= 40)
        return 'D';
    return 'F';
}
