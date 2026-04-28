/**
 * fix-teacher-passwords.ts
 *
 * Teachers created via bulk CSV upload had their passwords hashed from
 * the UPPERCASE regdNo (e.g. "TE000008") while users naturally type
 * the lowercase version (matching their email prefix "te000008").
 *
 * This script re-hashes all @edu.ppd teacher passwords with the
 * lowercase version of their email prefix so logins work.
 *
 * Run: npx ts-node-dev --transpile-only seed/fix-teacher-passwords.ts
 */

import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import dotenv   from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marks_result_db';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  const col = mongoose.connection.collection('users');

  // Only target teachers with @edu.ppd emails (bulk-uploaded ones)
  const teachers = await col.find({
    role: 'teacher',
    email: { $regex: '@edu\\.ppd$' },
  }).toArray();

  console.log(`Found ${teachers.length} @edu.ppd teachers to fix\n`);

  let fixed = 0;

  for (const teacher of teachers) {
    const email: string  = teacher.email;          // e.g. te000008@edu.ppd
    const expectedPwd    = email.split('@')[0];     // e.g. te000008 (already lowercase)

    // Check if current hash already matches the lowercase password
    const alreadyCorrect = await bcrypt.compare(expectedPwd, teacher.password);
    if (alreadyCorrect) continue;

    // Re-hash with the correct lowercase password
    const newHash = await bcrypt.hash(expectedPwd, 12);
    await col.updateOne({ _id: teacher._id }, { $set: { password: newHash } });
    fixed++;

    if (fixed % 10 === 0) process.stdout.write(`  Fixed ${fixed} so far…\r`);
  }

  console.log(`\n✅ Done!`);
  console.log(`   Fixed    : ${fixed}`);
  console.log(`   Unchanged: ${teachers.length - fixed}`);

  // Quick verification
  const sample = await col.findOne({ email: 'te000008@edu.ppd' });
  if (sample) {
    const ok = await bcrypt.compare('te000008', sample.password);
    console.log(`\n🔑 Verify te000008@edu.ppd / te000008 → ${ok ? '✅ PASS' : '❌ FAIL'}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
