/**
 * seed-assign-teachers.ts
 *
 * Automatically assigns every teacher in the DB to a spread of
 * random batches × subjects × semesters, skipping duplicates.
 *
 * Each teacher gets 3–6 teaching assignments across different
 * branch/batch/subject/semester combinations.
 *
 * Run: npx ts-node-dev --transpile-only seed/seed-assign-teachers.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Teacher }            from '../src/models/Teacher.model';
import { Batch }              from '../src/models/Batch.model';
import { Subject }            from '../src/models/Subject.model';
import { TeachingAssignment } from '../src/models/TeachingAssignment.model';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marks_result_db';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const teachers = await Teacher.find().lean();
  const batches  = await Batch.find().lean();
  const subjects = await Subject.find().lean();

  if (!teachers.length || !batches.length || !subjects.length) {
    console.error('❌ Missing teachers, batches or subjects. Run main seed first.');
    process.exit(1);
  }

  console.log(`👩‍🏫 Teachers : ${teachers.length}`);
  console.log(`🏫 Batches  : ${batches.length}`);
  console.log(`📚 Subjects : ${subjects.length}\n`);

  // Pre-load existing assignments to avoid duplicates
  const existing = await TeachingAssignment.find().lean();
  const existingKeys = new Set(
    existing.map((a: any) => `${a.teacher_id}_${a.batch_id}_${a.subject_id}_${a.semester}`)
  );
  console.log(`ℹ️  Existing assignments: ${existing.length}\n`);

  const newDocs: any[] = [];
  let skipped = 0;

  for (const teacher of teachers) {
    // Give each teacher 3–6 unique assignments
    const targetCount = 3 + Math.floor(Math.random() * 4);
    const batchPool   = shuffle(batches);
    const subjPool    = shuffle(subjects);

    let added = 0;
    let attempts = 0;

    while (added < targetCount && attempts < 40) {
      attempts++;
      const batch    = pick(batchPool);
      const subject  = pick(subjPool);
      const semester = 1 + Math.floor(Math.random() * 8); // 1–8

      const key = `${teacher._id}_${batch._id}_${subject._id}_${semester}`;
      if (existingKeys.has(key)) { skipped++; continue; }

      existingKeys.add(key);
      newDocs.push({
        teacher_id: teacher._id,
        batch_id:   batch._id,
        subject_id: subject._id,
        semester,
      });
      added++;
    }
  }

  if (newDocs.length === 0) {
    console.log('ℹ️  All assignments already exist — nothing to add.');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`📝 Inserting ${newDocs.length} new assignments (${skipped} duplicates skipped)…`);
  await TeachingAssignment.insertMany(newDocs, { ordered: false });

  // Summary
  const total = await TeachingAssignment.countDocuments();
  console.log(`\n✅ Done!`);
  console.log(`   New assignments created : ${newDocs.length}`);
  console.log(`   Total in DB             : ${total}`);

  // Per-teacher breakdown
  console.log('\n📊 Sample teacher assignment counts:');
  const sample = teachers.slice(0, 8);
  for (const t of sample) {
    const count = await TeachingAssignment.countDocuments({ teacher_id: t._id });
    console.log(`   ${String((t as any).user_id).slice(-6)}  →  ${count} assignments`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
