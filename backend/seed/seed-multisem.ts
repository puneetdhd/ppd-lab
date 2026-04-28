/**
 * seed-multisem.ts
 * 
 * WHAT THIS DOES:
 * 1. Computes completed semesters for every batch based on start_year
 *    (Aug of start_year = start of Sem 1, each sem is 6 months)
 * 2. Creates TeachingAssignments for every completed & current sem per batch
 *    (round-robin across existing teachers, skips if already exists)
 * 3. Creates Marks for the 500 students added by seed-500
 *    for each assignment across all their completed semesters
 *    (skips if mark already exists via unique index)
 * 
 * Run: npx ts-node-dev --transpile-only seed/seed-multisem.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Batch }              from '../src/models/Batch.model';
import { Teacher }            from '../src/models/Teacher.model';
import { Student }            from '../src/models/Student.model';
import { Subject }            from '../src/models/Subject.model';
import { User }               from '../src/models/User.model';
import { TeachingAssignment } from '../src/models/TeachingAssignment.model';
import { Mark }               from '../src/models/Mark.model';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marks_result_db';

// ── Semester helpers ──────────────────────────────────────────────────────────

/**
 * Returns the list of semester numbers that have been fully completed
 * plus the current ongoing semester (if at least 1 month in).
 * Logic: Sem 1 starts Aug of start_year, each sem is 6 months.
 */
function computeSemesters(startYear: number): { completed: number[]; current: number } {
  const now          = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  // Months elapsed since Aug of start_year
  const monthsElapsed = (currentYear - startYear) * 12 + (currentMonth - 8);
  if (monthsElapsed <= 0) return { completed: [], current: 1 };

  const currentSem   = Math.min(Math.floor(monthsElapsed / 6) + 1, 8);
  const completedSems: number[] = [];
  for (let s = 1; s < currentSem; s++) completedSems.push(s);

  return { completed: completedSems, current: currentSem };
}

// ── Grade helpers ─────────────────────────────────────────────────────────────

const GRADE_BANDS = [
  { min: 90, max: 100, weight: 0.08 },
  { min: 80, max: 89,  weight: 0.15 },
  { min: 70, max: 79,  weight: 0.22 },
  { min: 60, max: 69,  weight: 0.25 },
  { min: 50, max: 59,  weight: 0.15 },
  { min: 40, max: 49,  weight: 0.10 },
  { min: 15, max: 39,  weight: 0.05 },
];

const CUM: number[] = [];
let _c = 0;
for (const b of GRADE_BANDS) { _c += b.weight; CUM.push(_c); }

function pickBand() {
  const r = Math.random();
  for (let i = 0; i < CUM.length; i++) if (r <= CUM[i]) return GRADE_BANDS[i];
  return GRADE_BANDS[GRADE_BANDS.length - 1];
}

function ri(lo: number, hi: number) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, Math.floor(v))); }

function splitMarks(t100: number) {
  const tRaw = t100;
  const ratio = tRaw / 100;
  const jit = () => 0.80 + Math.random() * 0.40;

  let midsem     = clamp(Math.round(20 * ratio * jit()), 0, 20);
  let endsem     = clamp(Math.round(60 * ratio * jit()), 0, 60);
  let quiz       = clamp(Math.round(10 * ratio * jit()), 0, 10);
  let assignment = clamp(Math.round(10 * ratio * jit()), 0, 10);

  let diff = Math.round(tRaw) - (midsem + endsem + quiz + assignment);
  while (diff !== 0) {
    if (diff > 0) {
      if      (endsem     < 60) { endsem++;     diff--; }
      else if (midsem     < 20) { midsem++;     diff--; }
      else if (quiz       < 10) { quiz++;       diff--; }
      else if (assignment < 10) { assignment++; diff--; }
      else break;
    } else {
      if      (endsem     > 0) { endsem--;     diff++; }
      else if (midsem     > 0) { midsem--;     diff++; }
      else if (quiz       > 0) { quiz--;       diff++; }
      else if (assignment > 0) { assignment--; diff++; }
      else break;
    }
  }

  const total = Math.round((midsem + endsem + quiz + assignment) * 100) / 100;
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

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const batches  = await Batch.find().lean();
  const subjects = await Subject.find().lean();
  const teachers = await Teacher.find().lean();

  if (!batches.length || !subjects.length || !teachers.length) {
    console.error('❌ Missing batches, subjects, or teachers. Run seed.ts first.'); process.exit(1);
  }

  // ── Step 1: ensure assignments exist for ALL semesters ─────────────────────
  console.log('📋 Creating multi-semester teaching assignments…');

  let newAsnCount = 0;
  let tchCursor   = 0;

  // Build a set of existing (batch_id+semester+subject_id) combos to avoid duplication
  const existingAsns = await TeachingAssignment.find().lean();
  const existingKeys = new Set(existingAsns.map(a =>
    `${a.batch_id}_${a.semester}_${a.subject_id}`));

  const newAsnDocs: any[] = [];

  for (const b of batches) {
    const { completed, current } = computeSemesters(b.start_year);
    const allSems = [...completed, current];

    for (const sem of allSems) {
      for (const sub of subjects) {
        const key = `${b._id}_${sem}_${sub._id}`;
        if (existingKeys.has(key)) continue;

        newAsnDocs.push({
          teacher_id: teachers[tchCursor % teachers.length]._id,
          subject_id: sub._id,
          batch_id:   b._id,
          semester:   sem,
        });
        existingKeys.add(key);
        tchCursor++;
        newAsnCount++;
      }
    }
  }

  if (newAsnDocs.length > 0) {
    const inserted = await TeachingAssignment.insertMany(newAsnDocs);
    console.log(`  ✔ Created ${inserted.length} new teaching assignments`);
  } else {
    console.log('  ✔ All assignments already exist');
  }

  // Reload all assignments (including newly created)
  const allAsns = await TeachingAssignment.find().lean();
  const batchSemToAsns = new Map<string, typeof allAsns>();
  for (const a of allAsns) {
    const key = `${a.batch_id}_${a.semester}`;
    if (!batchSemToAsns.has(key)) batchSemToAsns.set(key, []);
    batchSemToAsns.get(key)!.push(a);
  }

  // ── Step 2: find the 500 students from seed-500 (email ends @edu.ppd) ──────
  const eduUsers = await User.find({ email: /@edu\.ppd$/ }, '_id').lean();
  const eduUserIds = eduUsers.map(u => u._id);

  const targetStudents = await Student.find({ user_id: { $in: eduUserIds } }).lean();
  console.log(`\n🎓 Students from seed-500 (@edu.ppd): ${targetStudents.length}`);

  if (targetStudents.length === 0) {
    console.log('  ℹ No @edu.ppd students found — nothing to seed marks for.');
    await mongoose.disconnect(); process.exit(0);
  }

  // ── Step 3: for each student, create marks for ALL completed sems ──────────
  console.log('📝 Generating multi-semester marks…');

  // Track existing marks to skip duplicates
  const existingMarks = await Mark.find({
    student_id: { $in: targetStudents.map(s => s._id) }
  }).lean();
  const existingMarkKeys = new Set(existingMarks.map(m =>
    `${m.student_id}_${m.assignment_id}`));

  const markDocs: any[] = [];

  for (const stud of targetStudents) {
    const batchId  = String(stud.batch_id);
    const batch    = batches.find(b => String(b._id) === batchId);
    if (!batch) continue;

    const { completed, current } = computeSemesters(batch.start_year);
    const allSems = [...completed, current];

    for (const sem of allSems) {
      const asnList = batchSemToAsns.get(`${batchId}_${sem}`) || [];
      for (const asn of asnList) {
        const key = `${stud._id}_${asn._id}`;
        if (existingMarkKeys.has(key)) continue;

        const band  = pickBand();
        const t100  = ri(band.min, band.max);
        const { midsem, endsem, quiz, assignment, total } = splitMarks(t100);
        const grade = calculateGrade(total);

        markDocs.push({
          student_id:    stud._id,
          assignment_id: asn._id,
          midsem, endsem, quiz, assignment, total, grade,
        });
        existingMarkKeys.add(key);
      }
    }
  }

  console.log(`  Inserting ${markDocs.length} mark documents…`);

  const CHUNK = 2000;
  for (let i = 0; i < markDocs.length; i += CHUNK) {
    await Mark.insertMany(markDocs.slice(i, i + CHUNK), { ordered: false }).catch(() => {});
    process.stdout.write(`  ✔ ${Math.min(i + CHUNK, markDocs.length)} / ${markDocs.length}\r`);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const dist: Record<string, number> = {};
  for (const m of markDocs) { dist[m.grade] = (dist[m.grade] || 0) + 1; }

  console.log('\n\n📊 Grade distribution across all new marks:');
  for (const g of ['O','A','B','C','D','E','F']) {
    const pct = markDocs.length ? ((dist[g] || 0) / markDocs.length * 100).toFixed(1) : '0.0';
    console.log(`   ${g}: ${(dist[g] || 0).toString().padStart(5)} (${pct}%)`);
  }

  // Show per-batch semester summary
  console.log('\n📅 Semesters seeded per start_year:');
  const yearSet = new Set(batches.map(b => b.start_year));
  for (const yr of [...yearSet].sort()) {
    const { completed, current } = computeSemesters(yr);
    console.log(`   ${yr}–${yr+4}: Sems ${[...completed, current].join(', ')} (${completed.length} completed + Sem ${current} ongoing)`);
  }

  console.log(`\n✅ Done! ${markDocs.length} mark records created across ${targetStudents.length} students.\n`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
