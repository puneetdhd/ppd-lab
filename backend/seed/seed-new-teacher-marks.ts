/**
 * seed-new-teacher-marks.ts
 *
 * The CSV-uploaded teachers (te000001–te000008 @edu.ppd) were assigned to
 * random batches/subjects via seed-assign-teachers.ts, but no marks were
 * ever entered for their assignments.
 *
 * This script seeds marks for every assignment belonging to @edu.ppd teachers
 * by pulling all students in each assignment's batch and generating realistic
 * random marks for them.
 *
 * Run: npx ts-node-dev --transpile-only seed/seed-new-teacher-marks.ts
 */

import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

import { User }               from '../src/models/User.model';
import { Teacher }            from '../src/models/Teacher.model';
import { TeachingAssignment } from '../src/models/TeachingAssignment.model';
import { Student }            from '../src/models/Student.model';
import { Mark }               from '../src/models/Mark.model';
// Must import these so Mongoose registers them before populate() runs
import '../src/models/Batch.model';
import '../src/models/Branch.model';
import '../src/models/Subject.model';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marks_result_db';

const GRADES = ['O','E','A','B','C','D','F'] as const;

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function splitMarks(total: number) {
  // total out of 100: midsem/20 + endsem/60 + quiz/10 + assignment/10
  const midsem     = Math.min(20, Math.round((total / 100) * 20 + rand(-3, 3)));
  const endsem     = Math.min(60, Math.round((total / 100) * 60 + rand(-5, 5)));
  const quiz       = Math.min(10, Math.round((total / 100) * 10 + rand(-1, 1)));
  const assignment = Math.min(10, Math.round((total / 100) * 10 + rand(-1, 1)));
  const actualTotal = midsem + endsem + quiz + assignment;
  return { midsem: Math.max(0, midsem), endsem: Math.max(0, endsem),
           quiz: Math.max(0, quiz), assignment: Math.max(0, assignment),
           total: Math.max(0, actualTotal) };
}

function grade(total: number): typeof GRADES[number] {
  if (total >= 90) return 'O';
  if (total >= 80) return 'E';
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'D';
  return 'F';
}

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Find all @edu.ppd teachers
  const teacherUsers = await User.find({ email: /@edu\.ppd$/i, role: 'teacher' }).lean();
  console.log(`Found ${teacherUsers.length} @edu.ppd teachers`);

  const teacherProfiles = await Teacher.find({
    user_id: { $in: teacherUsers.map(u => u._id) },
  }).lean();

  console.log(`Found ${teacherProfiles.length} teacher profiles\n`);

  let totalMarksCreated = 0;
  let totalSkipped      = 0;

  for (const tp of teacherProfiles) {
    const teacherUser = teacherUsers.find(u => String(u._id) === String(tp.user_id));
    console.log(`\n👩‍🏫 ${teacherUser?.email}`);

    const assignments = await TeachingAssignment.find({ teacher_id: tp._id })
      .populate('batch_id subject_id')
      .lean();

    console.log(`   ${assignments.length} assignments`);

    for (const asn of assignments) {
      const batchId = (asn.batch_id as any)?._id || asn.batch_id;

      // Get all students in this batch
      const students = await Student.find({ batch_id: batchId }).lean();
      if (students.length === 0) { totalSkipped++; continue; }

      // Check existing marks for this assignment to avoid duplicates
      const existingStudentIds = new Set(
        (await Mark.find({ assignment_id: asn._id }).lean())
          .map(m => String(m.student_id))
      );

      const newMarks: any[] = [];
      for (const student of students) {
        if (existingStudentIds.has(String(student._id))) continue;

        // Realistic distribution: mostly C–A, some O and F
        const totalScore = rand(35, 98);
        const { midsem, endsem, quiz, assignment: asgn, total } = splitMarks(totalScore);

        newMarks.push({
          student_id:    student._id,
          assignment_id: asn._id,
          midsem, endsem, quiz,
          assignment: asgn,
          total,
          grade: grade(total),
        });
      }

      if (newMarks.length > 0) {
        await Mark.insertMany(newMarks, { ordered: false });
        totalMarksCreated += newMarks.length;
        process.stdout.write(`   📝 Assignment ${String(asn._id).slice(-6)}: ${newMarks.length} marks inserted\n`);
      }
    }
  }

  const totalMarks = await Mark.countDocuments();
  console.log(`\n✅ Done!`);
  console.log(`   New marks created : ${totalMarksCreated}`);
  console.log(`   Skipped (existing): ${totalSkipped}`);
  console.log(`   Total marks in DB : ${totalMarks}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
