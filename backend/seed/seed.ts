import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { User } from '../src/models/User.model';
import { Branch } from '../src/models/Branch.model';
import { Batch } from '../src/models/Batch.model';
import { Teacher } from '../src/models/Teacher.model';
import { Student } from '../src/models/Student.model';
import { Subject } from '../src/models/Subject.model';
import { TeachingAssignment } from '../src/models/TeachingAssignment.model';
import { Mark } from '../src/models/Mark.model';
import { Feedback } from '../src/models/Feedback.model';
import { calculateGrade } from '../src/utils/grades';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marks_result_db';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Batch.deleteMany({}),
    Teacher.deleteMany({}),
    Student.deleteMany({}),
    Subject.deleteMany({}),
    TeachingAssignment.deleteMany({}),
    Mark.deleteMany({}),
    Feedback.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Admin (User.create triggers bcrypt pre-save hook) ──────────────────────
  const adminUser = await User.create({ name: 'Super Admin', email: 'admin@ppd.edu', password: 'admin123', role: 'admin' });
  console.log(`👤 Admin created: ${adminUser.email}`);

  // ── Branches ───────────────────────────────────────────────────────────────
  const branches = await Branch.insertMany([
    { branch_name: 'Information Technology' },
    { branch_name: 'Computer Science Engineering' },
    { branch_name: 'Electronics & Communication' },
  ]);
  const [itBranch, cseBranch] = branches;
  console.log('🏛️  Branches created');

  // ── Batches ────────────────────────────────────────────────────────────────
  const batches = await Batch.insertMany([
    { branch_id: itBranch._id, start_year: 2024, graduation_year: 2028 },
    { branch_id: itBranch._id, start_year: 2023, graduation_year: 2027 },
    { branch_id: cseBranch._id, start_year: 2024, graduation_year: 2028 },
  ]);
  const [itBatch2024, itBatch2023, cseBatch2024] = batches;
  console.log('📅 Batches created');

  // ── Subjects ───────────────────────────────────────────────────────────────
  const subjects = await Subject.insertMany([
    { subject_name: 'Object Oriented Programming', credits: 4 },
    { subject_name: 'Database Management Systems', credits: 4 },
    { subject_name: 'Computer Networks', credits: 3 },
    { subject_name: 'Operating Systems', credits: 4 },
    { subject_name: 'Engineering Mathematics', credits: 3 },
  ]);
  const [oops, dbms, cn] = subjects;
  console.log('📚 Subjects created');

  // ── Teachers (User.create triggers bcrypt pre-save hook) ───────────────────
  const tU1 = await User.create({ name: 'Dr. Ramesh Kumar',    email: 'ramesh@ppd.edu', password: 'teacher123', role: 'teacher' });
  const tU2 = await User.create({ name: 'Prof. Sunita Sharma', email: 'sunita@ppd.edu', password: 'teacher123', role: 'teacher' });
  const tU3 = await User.create({ name: 'Dr. Anil Verma',      email: 'anil@ppd.edu',   password: 'teacher123', role: 'teacher' });

  const teachers = await Teacher.insertMany([
    { user_id: tU1._id },
    { user_id: tU2._id },
    { user_id: tU3._id },
  ]);
  const [t1, t2, t3] = teachers;
  console.log('👨‍🏫 Teachers created');

  // ── Students (User.create triggers bcrypt pre-save hook) ───────────────────
  const studentDefs = [
    { name: 'Arjun Singh',    email: 's1@ppd.edu',  batchId: itBatch2024._id,  semester: 1 },
    { name: 'Priya Mehta',    email: 's2@ppd.edu',  batchId: itBatch2024._id,  semester: 1 },
    { name: 'Rahul Gupta',    email: 's3@ppd.edu',  batchId: itBatch2024._id,  semester: 1 },
    { name: 'Sneha Patel',    email: 's4@ppd.edu',  batchId: itBatch2024._id,  semester: 1 },
    { name: 'Vikram Yadav',   email: 's5@ppd.edu',  batchId: itBatch2024._id,  semester: 1 },
    { name: 'Ananya Joshi',   email: 's6@ppd.edu',  batchId: itBatch2023._id,  semester: 3 },
    { name: 'Kunal Verma',    email: 's7@ppd.edu',  batchId: itBatch2023._id,  semester: 3 },
    { name: 'Divya Rao',      email: 's8@ppd.edu',  batchId: itBatch2023._id,  semester: 3 },
    { name: 'Harsh Malhotra', email: 's9@ppd.edu',  batchId: cseBatch2024._id, semester: 1 },
    { name: 'Pooja Kapoor',   email: 's10@ppd.edu', batchId: cseBatch2024._id, semester: 1 },
  ];

  const students: any[] = [];
  for (const def of studentDefs) {
    const u = await User.create({ name: def.name, email: def.email, password: 'student123', role: 'student' });
    const s = await Student.create({ user_id: u._id, batch_id: def.batchId, semester: def.semester });
    students.push(s);
  }
  console.log('🎓 Students created');

  // ── Teaching Assignments ───────────────────────────────────────────────────
  const assignments = await TeachingAssignment.insertMany([
    { teacher_id: t1._id, subject_id: oops._id, batch_id: itBatch2024._id,  semester: 1 },
    { teacher_id: t2._id, subject_id: dbms._id, batch_id: itBatch2023._id,  semester: 3 },
    { teacher_id: t3._id, subject_id: cn._id,   batch_id: cseBatch2024._id, semester: 1 },
  ]);
  const [ta1, ta2, ta3] = assignments;
  console.log('📋 Teaching assignments created');

  // ── Marks ──────────────────────────────────────────────────────────────────
  // mid(max 60) + quiz(max 15) + assignment(max 15) + attendance(max 10) = 100
  const markSets = [
    {
      studs: students.slice(0, 5),
      ta: ta1,
      raw: [
        { mid: 55, quiz: 14, assignment: 13, attendance: 9  }, // 91 → O
        { mid: 48, quiz: 12, assignment: 12, attendance: 8  }, // 80 → E
        { mid: 40, quiz: 10, assignment: 10, attendance: 7  }, // 67 → B
        { mid: 30, quiz: 8,  assignment: 9,  attendance: 6  }, // 53 → C
        { mid: 20, quiz: 5,  assignment: 6,  attendance: 4  }, // 35 → F
      ],
    },
    {
      studs: students.slice(5, 8),
      ta: ta2,
      raw: [
        { mid: 58, quiz: 14, assignment: 14, attendance: 10 }, // 96 → O
        { mid: 45, quiz: 11, assignment: 11, attendance: 8  }, // 75 → A
        { mid: 25, quiz: 6,  assignment: 7,  attendance: 5  }, // 43 → D
      ],
    },
    {
      studs: students.slice(8, 10),
      ta: ta3,
      raw: [
        { mid: 52, quiz: 13, assignment: 12, attendance: 9 }, // 86 → E
        { mid: 36, quiz: 9,  assignment: 8,  attendance: 7 }, // 60 → B
      ],
    },
  ];

  const markDocs: any[] = [];
  for (const set of markSets) {
    for (let i = 0; i < set.studs.length; i++) {
      const m = set.raw[i];
      const total = m.mid + m.quiz + m.assignment + m.attendance;
      markDocs.push({
        student_id:    set.studs[i]._id,
        assignment_id: set.ta._id,
        ...m,
        total,
        grade: calculateGrade(total),
      });
    }
  }
  await Mark.insertMany(markDocs);
  console.log('📝 Marks created');

  // ── Feedback ───────────────────────────────────────────────────────────────
  await Feedback.insertMany([
    { student_id: students[0]._id, teacher_id: t1._id, subject_id: oops._id, rating: 5, comment: 'Excellent teaching! Very clear explanations.' },
    { student_id: students[1]._id, teacher_id: t1._id, subject_id: oops._id, rating: 4, comment: 'Good lectures, could use more examples.' },
    { student_id: students[5]._id, teacher_id: t2._id, subject_id: dbms._id, rating: 5, comment: 'Best DBMS classes I have attended.' },
  ]);
  console.log('💬 Feedback created');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('─────────────────────────────────────────');
  console.log('🔑 Login Credentials:');
  console.log('  Admin    → admin@ppd.edu      / admin123');
  console.log('  Teacher1 → ramesh@ppd.edu     / teacher123');
  console.log('  Teacher2 → sunita@ppd.edu     / teacher123');
  console.log('  Teacher3 → anil@ppd.edu       / teacher123');
  console.log('  Student1 → s1@ppd.edu         / student123');
  console.log('  Student6 → s6@ppd.edu         / student123');
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
