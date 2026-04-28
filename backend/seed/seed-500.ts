/**
 * seed-500.ts
 * Additive seed: creates 500 NEW students spread equally across all existing
 * batches, generates marks for each of their teaching assignments using the
 * updated schema (midsem/20, endsem/60, quiz/20, assignment/10 → total/100).
 *
 * Does NOT wipe any existing data.
 * Run: npx ts-node-dev --transpile-only seed/seed-500.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

import { User }               from '../src/models/User.model';
import { Batch }              from '../src/models/Batch.model';
import { Student }            from '../src/models/Student.model';
import { TeachingAssignment } from '../src/models/TeachingAssignment.model';
import { Mark }               from '../src/models/Mark.model';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marks_result_db';
const TOTAL_STUDENTS = 500;

// ── Grade distribution (weighted, realistic bell curve) ───────────────────────
const GRADE_BANDS = [
  { min: 90, max: 100, weight: 0.08 }, // O
  { min: 80, max: 89,  weight: 0.15 }, // A
  { min: 70, max: 79,  weight: 0.22 }, // B
  { min: 60, max: 69,  weight: 0.25 }, // C
  { min: 50, max: 59,  weight: 0.15 }, // D
  { min: 40, max: 49,  weight: 0.10 }, // E
  { min: 15, max: 39,  weight: 0.05 }, // F
];

const CUM_WEIGHTS: number[] = [];
let _cum = 0;
for (const band of GRADE_BANDS) { _cum += band.weight; CUM_WEIGHTS.push(_cum); }

function pickBand() {
  const r = Math.random();
  for (let i = 0; i < CUM_WEIGHTS.length; i++) {
    if (r <= CUM_WEIGHTS[i]) return GRADE_BANDS[i];
  }
  return GRADE_BANDS[GRADE_BANDS.length - 1];
}

function ri(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.floor(v)));
}

/**
 * Given a target total (0-100), split into midsem/endsem/quiz/assignment components.
 */
function splitMarks(targetTotal100: number) {
  const targetRaw = targetTotal100;

  const maxMid    = 20;
  const maxEnd    = 60;
  const maxQuiz   = 10;
  const maxAssign = 10;
  const maxRaw    = 100;

  const ratio  = targetRaw / maxRaw;
  const jitter = () => 0.80 + Math.random() * 0.40; // 0.80–1.20

  let midsem     = clamp(Math.round(maxMid    * ratio * jitter()), 0, maxMid);
  let endsem     = clamp(Math.round(maxEnd    * ratio * jitter()), 0, maxEnd);
  let quiz       = clamp(Math.round(maxQuiz   * ratio * jitter()), 0, maxQuiz);
  let assignment = clamp(Math.round(maxAssign * ratio * jitter()), 0, maxAssign);

  // Reconcile raw sum towards targetRaw
  let raw  = midsem + endsem + quiz + assignment;
  let diff = Math.round(targetRaw) - raw;

  while (diff !== 0) {
    if (diff > 0) {
      if      (endsem     < maxEnd)    { endsem++;     diff--; }
      else if (midsem     < maxMid)    { midsem++;     diff--; }
      else if (quiz       < maxQuiz)   { quiz++;       diff--; }
      else if (assignment < maxAssign) { assignment++; diff--; }
      else break;
    } else {
      if      (endsem     > 0) { endsem--;     diff++; }
      else if (midsem     > 0) { midsem--;     diff++; }
      else if (quiz       > 0) { quiz--;       diff++; }
      else if (assignment > 0) { assignment--; diff++; }
      else break;
    }
  }

  raw = midsem + endsem + quiz + assignment;
  const total = Math.round(raw * 100) / 100;
  return { midsem, endsem, quiz, assignment, total };
}

function calculateGrade(total: number): string {
  if (total >= 90) return 'O';
  if (total >= 80) return 'A';
  if (total >= 70) return 'B';
  if (total >= 60) return 'C';
  if (total >= 50) return 'D';
  if (total >= 40) return 'E';
  return 'F';
}

// ─────────────────────────────────────────────────────────────────────────────

const seed500 = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Load existing structure ────────────────────────────────────────────────
  const batches     = await Batch.find().lean();
  const assignments = await TeachingAssignment.find().lean();

  if (batches.length === 0) {
    console.error('❌ No batches found. Run the main seed first.');
    process.exit(1);
  }

  console.log(`📦 Found ${batches.length} batches, ${assignments.length} assignments`);

  // Map: batchId → assignments[]
  const batchToAssignments = new Map<string, typeof assignments>();
  for (const a of assignments) {
    const key = String(a.batch_id);
    if (!batchToAssignments.has(key)) batchToAssignments.set(key, []);
    batchToAssignments.get(key)!.push(a);
  }

  // Filter to batches that actually have assignments (so we can create marks)
  const activeBatches = batches.filter(b => batchToAssignments.has(String(b._id)));
  if (activeBatches.length === 0) {
    console.error('❌ No batches have assignments. Assign teachers first.');
    process.exit(1);
  }

  console.log(`✅ Active batches (with assignments): ${activeBatches.length}`);

  // ── Distribute 500 students equally across active batches ──────────────────
  const perBatch  = Math.floor(TOTAL_STUDENTS / activeBatches.length);
  let   remainder = TOTAL_STUDENTS - perBatch * activeBatches.length;

  const hashedPass = await bcrypt.hash('student123', 12);

  // Find next student index to avoid email collisions
  const existingCount = await User.countDocuments({ role: 'student' });
  let sIdx = existingCount + 1;

  const studentUserDefs: any[]                             = [];
  const studentMeta:     { batch_id: any; semester: number }[] = [];

  for (let bi = 0; bi < activeBatches.length; bi++) {
    const b    = activeBatches[bi];
    const count = perBatch + (remainder > 0 ? (remainder--, 1) : 0);

    // Compute current semester from start year
    const yearDiff = new Date().getFullYear() - b.start_year;
    let sem = (new Date().getMonth() >= 7) ? yearDiff * 2 + 1 : yearDiff * 2;
    if (sem < 1) sem = 1;
    if (sem > 8) sem = 8;

    for (let i = 0; i < count; i++) {
      studentUserDefs.push({
        name:     `Student ${sIdx}`,
        email:    `student${sIdx}@edu.ppd`,
        password: hashedPass,
        role:     'student' as const,
      });
      studentMeta.push({ batch_id: b._id, semester: sem });
      sIdx++;
    }
  }

  console.log(`⏳ Inserting ${studentUserDefs.length} student users…`);
  const studentUsers = await User.insertMany(studentUserDefs);

  const studentDocs = studentUsers.map((u, i) => ({
    user_id:   u._id,
    batch_id:  studentMeta[i].batch_id,
    semester:  studentMeta[i].semester,
  }));

  const insertedStudents = await Student.insertMany(studentDocs);
  console.log(`🎓 Students created: ${insertedStudents.length}`);

  // ── Generate marks ─────────────────────────────────────────────────────────
  console.log('⏳ Generating marks…');
  const markDocs: any[] = [];

  for (const stud of insertedStudents) {
    const bId      = String(stud.batch_id);
    const asnList  = batchToAssignments.get(bId) || [];

    for (const asn of asnList) {
      const band       = pickBand();
      const target100  = ri(band.min, band.max);
      const { midsem, endsem, quiz, assignment, total } = splitMarks(target100);
      const grade      = calculateGrade(total);

      markDocs.push({
        student_id:    stud._id,
        assignment_id: asn._id,
        midsem, endsem, quiz, assignment, total, grade,
      });
    }
  }

  // Insert in chunks of 2000
  const CHUNK = 2000;
  for (let i = 0; i < markDocs.length; i += CHUNK) {
    await Mark.insertMany(markDocs.slice(i, i + CHUNK));
    process.stdout.write(`  ✔ ${Math.min(i + CHUNK, markDocs.length)} / ${markDocs.length} marks\r`);
  }

  // Grade distribution summary
  const dist: Record<string, number> = {};
  for (const m of markDocs) { dist[m.grade] = (dist[m.grade] || 0) + 1; }
  console.log('\n📊 Grade distribution:');
  for (const g of ['O','A','B','C','D','E','F']) {
    const pct = markDocs.length > 0 ? ((dist[g] || 0) / markDocs.length * 100).toFixed(1) : '0';
    console.log(`   ${g}: ${dist[g] || 0}  (${pct}%)`);
  }

  console.log(`\n✅ Done! ${insertedStudents.length} students, ${markDocs.length} mark records created.`);
  await mongoose.disconnect();
  process.exit(0);
};

seed500().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
