import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

import { User } from '../src/models/User.model';
import { Branch } from '../src/models/Branch.model';
import { Batch } from '../src/models/Batch.model';
import { Teacher } from '../src/models/Teacher.model';
import { Student } from '../src/models/Student.model';
import { Subject } from '../src/models/Subject.model';
import { TeachingAssignment } from '../src/models/TeachingAssignment.model';
import { Mark } from '../src/models/Mark.model';
import { calculateGrade } from '../src/utils/grades';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marks_result_db';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Batch.deleteMany({}),
    Teacher.deleteMany({}),
    Student.deleteMany({}),
    Subject.deleteMany({}),
    TeachingAssignment.deleteMany({}),
    Mark.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  const hashedAdminPass = await bcrypt.hash('admin123', 12);
  const hashedTeacherPass = await bcrypt.hash('teacher123', 12);
  const hashedStudentPass = await bcrypt.hash('student123', 12);

  // ── Admin ──────────────────────────────────────────────────────────────────
  await User.insertMany([{
    name: 'Super Admin',
    email: 'admin@ppd.edu',
    password: hashedAdminPass,
    role: 'admin'
  }]);
  console.log('👤 Admin created');

  // ── Branches ───────────────────────────────────────────────────────────────
  const branchNames = ['CSE', 'IT', 'MECH', 'AI', 'ML', 'ECE', 'E&I', 'Civil', 'Biotech', 'CE', 'Electrical'];
  const branches = await Branch.insertMany(branchNames.map(name => ({ branch_name: name })));
  console.log(`🏛️  Branches created: 11`);

  // ── Batches ────────────────────────────────────────────────────────────────
  const gradYears = [2026, 2027, 2028, 2029];
  const batchDefs = [];
  for (const b of branches) {
    for (const gy of gradYears) {
      batchDefs.push({
        branch_id: b._id,
        start_year: gy - 4,
        graduation_year: gy,
      });
    }
  }
  const batches = await Batch.insertMany(batchDefs);
  console.log(`📅 Batches created: 44`);

  // ── Subjects ───────────────────────────────────────────────────────────────
  const subjects = await Subject.insertMany([
    { subject_name: 'Object Oriented Programming', credits: 4 },
    { subject_name: 'Database Management Systems', credits: 4 },
    { subject_name: 'Operating Systems', credits: 4 },
    { subject_name: 'Computer Networks', credits: 3 },
    { subject_name: 'Data Structures', credits: 4 },
  ]);
  console.log(`📚 Subjects created: 5 shared generic subjects`);

  // ── Teachers ───────────────────────────────────────────────────────────────
  const teacherUserDefs = Array.from({ length: 50 }).map((_, i) => ({
    name: `Teacher ${i + 1}`,
    email: `teacher${i + 1}@ppd.edu`,
    password: hashedTeacherPass,
    role: 'teacher' as const
  }));
  const teacherUsers = await User.insertMany(teacherUserDefs);
  const teacherDefs = teacherUsers.map(u => ({ user_id: u._id }));
  const teachers = await Teacher.insertMany(teacherDefs);
  console.log(`👨‍🏫 Teachers created: 50`);

  // ── Assignments ────────────────────────────────────────────────────────────
  // Many-to-many: each batch gets a DIFFERENT teacher per subject (5 teachers/batch),
  // and teachers round-robin across batches so each teacher covers multiple batches.
  // 44 batches × 5 subjects = 220 assignments across 50 teachers → ~4-5 batches per teacher.
  const assignmentDefs = [];
  let teacherCursor = 0; // global round-robin index

  for (let i = 0; i < batches.length; i++) {
    const b = batches[i];

    const yearDiff = new Date().getFullYear() - b.start_year;
    let sem = (new Date().getMonth() >= 7) ? yearDiff * 2 + 1 : yearDiff * 2;
    if (sem < 1) sem = 1;
    if (sem > 8) sem = 8;

    for (const sub of subjects) {
      assignmentDefs.push({
        teacher_id: teachers[teacherCursor % teachers.length]._id,
        subject_id: sub._id,
        batch_id: b._id,
        semester: sem,
      });
      teacherCursor++;
    }
  }
  const assignments = await TeachingAssignment.insertMany(assignmentDefs);
  console.log(`📋 Teaching assignments created: ${assignments.length} (${batches.length} batches × ${subjects.length} subjects, round-robin across ${teachers.length} teachers)`);

  // ── Students ───────────────────────────────────────────────────────────────
  const batchMappingForAssignments = new Map();
  for (const a of assignments) {
    const bId = String(a.batch_id);
    if (!batchMappingForAssignments.has(bId)) batchMappingForAssignments.set(bId, []);
    batchMappingForAssignments.get(bId).push(a);
  }

  const studentUserDefs: any[] = [];
  const studentMetadataDefs: { batch_id: any; semester: number }[] = []; // Store batch_id & semester info for the 2nd DB pass
  let sIdCount = 1;

  for (const b of batches) {
    const yearDiff = new Date().getFullYear() - b.start_year;
    let sem = (new Date().getMonth() >= 7) ? yearDiff * 2 + 1 : yearDiff * 2;
    if (sem < 1) sem = 1;
    if (sem > 8) sem = 8;

    for (let is = 0; is < 50; is++) {
      studentUserDefs.push({
        name: `Student ${sIdCount}`,
        email: `student${sIdCount}@ppd.edu`,
        password: hashedStudentPass,
        role: 'student' as const
      });
      studentMetadataDefs.push({
        batch_id: b._id,
        semester: sem
      });
      sIdCount++;
    }
  }

  // Insert Users in Chunks (just in case)
  console.log(`⏳ Inserting 2200 Students...`);
  const studentUsers = await User.insertMany(studentUserDefs);

  // Combine real _id with metadata for Student collection
  const realStudentDefs = studentUsers.map((u, i) => ({
    user_id: u._id,
    batch_id: studentMetadataDefs[i].batch_id,
    semester: studentMetadataDefs[i].semester
  }));

  const insertedStudents = await Student.insertMany(realStudentDefs);
  console.log(`🎓 Students created: 2200`);

  // ── Marks ──────────────────────────────────────────────────────────────────
  console.log(`⏳ Generating Marks with realistic grade distribution (11,000 documents) ...`);
  const markDocs: any[] = [];

  // Weighted grade distribution — realistic bell curve centred on B/C
  // O(8%), A(15%), B(22%), C(25%), D(15%), E(10%), F(5%)
  const gradeBands = [
    { min: 90, max: 100, weight: 0.08 },  // O
    { min: 80, max: 89,  weight: 0.15 },  // A
    { min: 70, max: 79,  weight: 0.22 },  // B
    { min: 60, max: 69,  weight: 0.25 },  // C
    { min: 50, max: 59,  weight: 0.15 },  // D
    { min: 40, max: 49,  weight: 0.10 },  // E
    { min: 15, max: 39,  weight: 0.05 },  // F
  ];

  // Build cumulative distribution for weighted random pick
  const cumulativeWeights: number[] = [];
  let cumulative = 0;
  for (const band of gradeBands) {
    cumulative += band.weight;
    cumulativeWeights.push(cumulative);
  }

  /** Pick a random grade band based on the weighted distribution */
  function pickGradeBand() {
    const r = Math.random();
    for (let i = 0; i < cumulativeWeights.length; i++) {
      if (r <= cumulativeWeights[i]) return gradeBands[i];
    }
    return gradeBands[gradeBands.length - 1];
  }

  /** Clamp a value between min and max */
  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, Math.floor(val)));
  }

  /**
   * Given a target total, split it into component marks (mid, quiz, assignment, attendance)
   * proportionally to their max values with some random jitter.
   */
  function splitIntoComponents(targetTotal: number) {
    // Max values: mid=60, quiz=15, assignment=15, attendance=10 → total max=100
    const maxMid = 60, maxQuiz = 15, maxAssign = 15, maxAtt = 10;
    const maxTotal = 100;

    // Base proportion of each component
    const ratio = targetTotal / maxTotal;

    // Add jitter: ±15% variation around the proportional value
    const jitter = () => 0.85 + Math.random() * 0.30; // 0.85 – 1.15

    let mid = clamp(Math.round(maxMid * ratio * jitter()), 0, maxMid);
    let quiz = clamp(Math.round(maxQuiz * ratio * jitter()), 0, maxQuiz);
    let assign = clamp(Math.round(maxAssign * ratio * jitter()), 0, maxAssign);
    let att = clamp(Math.round(maxAtt * ratio * jitter()), 0, maxAtt);

    // Adjust to hit the exact targetTotal
    let diff = targetTotal - (mid + quiz + assign + att);

    // Distribute the difference across components (prefer adjusting mid since it has the most room)
    while (diff !== 0) {
      if (diff > 0) {
        // Need to add marks — try mid first, then quiz, assign, att
        if (mid < maxMid) { mid++; diff--; }
        else if (quiz < maxQuiz) { quiz++; diff--; }
        else if (assign < maxAssign) { assign++; diff--; }
        else if (att < maxAtt) { att++; diff--; }
        else break; // shouldn't happen
      } else {
        // Need to remove marks
        if (mid > 0) { mid--; diff++; }
        else if (quiz > 0) { quiz--; diff++; }
        else if (assign > 0) { assign--; diff++; }
        else if (att > 0) { att--; diff++; }
        else break;
      }
    }

    return { mid, quiz, assignment: assign, attendance: att };
  }

  for (const stud of insertedStudents) {
    const bId = String(stud.batch_id);
    const assigned = batchMappingForAssignments.get(bId) || [];

    for (const a of assigned) {
      const band = pickGradeBand();
      const targetTotal = band.min + Math.floor(Math.random() * (band.max - band.min + 1));
      const { mid, quiz, assignment, attendance } = splitIntoComponents(targetTotal);
      const total = mid + quiz + assignment + attendance;
      const grade = calculateGrade(total);

      markDocs.push({
        student_id: stud._id,
        assignment_id: a._id,
        mid, quiz, assignment, attendance, total, grade,
      });
    }
  }

  // Insert in chunks to prevent Mongoose memory overflow on some instances
  const chunkSize = 2000;
  for (let i = 0; i < markDocs.length; i += chunkSize) {
    await Mark.insertMany(markDocs.slice(i, i + chunkSize));
  }

  // Log actual distribution for verification
  const gradeCounts: Record<string, number> = {};
  for (const m of markDocs) { gradeCounts[m.grade] = (gradeCounts[m.grade] || 0) + 1; }
  console.log(`📝 Marks created: ${markDocs.length}`);
  console.log(`📊 Grade distribution:`, gradeCounts);
  
  console.log('\n✅ Mass seeding completed successfully!\n');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
