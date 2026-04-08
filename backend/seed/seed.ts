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
  // 44 batches, assign each batch to exactly 1 distinct teacher so no teacher exceeds 5 batches.
  const assignmentDefs = [];
  for (let i = 0; i < batches.length; i++) {
    // Teacher `i` will handle all 5 subjects for batch `i`
    const t = teachers[i];
    const b = batches[i];
    
    // We also need the current semester for mapping, but an assignment usually depends on semester
    // Given the simplicity, we'll just bind the semester statically to what the batch is in or semester 1
    // The previous seed manually hardcoded semester, let's use the virtual we built for semester!
    // But since insertMany doesn't hydrate virtuals easily unless mapped, let's calculate here.
    const yearDiff = new Date().getFullYear() - b.start_year;
    let sem = (new Date().getMonth() >= 7) ? yearDiff * 2 + 1 : yearDiff * 2;
    if (sem < 1) sem = 1;
    if (sem > 8) sem = 8;
    
    for (const sub of subjects) {
      assignmentDefs.push({
        teacher_id: t._id,
        subject_id: sub._id,
        batch_id: b._id,
        semester: sem,
      });
    }
  }
  const assignments = await TeachingAssignment.insertMany(assignmentDefs);
  console.log(`📋 Teaching assignments created: 220`);

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
  console.log(`⏳ Generating Marks randomly (11,000 documents) ...`);
  const markDocs = [];
  
  for (const stud of insertedStudents) {
    const bId = String(stud.batch_id);
    const assigned = batchMappingForAssignments.get(bId) || [];
    
    for (const a of assigned) {
      // Random generation
      const mid = Math.floor(Math.random() * 61); // 0-60
      const quiz = Math.floor(Math.random() * 16); // 0-15
      const assignment = Math.floor(Math.random() * 16); // 0-15
      const attendance = Math.floor(Math.random() * 11); // 0-10
      
      const total = mid + quiz + assignment + attendance;
      const grade = calculateGrade(total);

      markDocs.push({
        student_id: stud._id,
        assignment_id: a._id,
        mid, quiz, assignment, attendance, total, grade
      });
    }
  }

  // Insert in chunks to prevent Mongoose memory overflow on some instances
  const chunkSize = 2000;
  for (let i = 0; i < markDocs.length; i += chunkSize) {
    await Mark.insertMany(markDocs.slice(i, i + chunkSize));
  }
  
  console.log(`📝 Marks created: 11000`);
  
  console.log('\n✅ Mass seeding completed successfully!\n');
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
