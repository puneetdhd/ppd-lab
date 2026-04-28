/**
 * fix-passwords.ts
 *
 * The seed scripts used insertMany / direct Model.create patterns that
 * bypassed the Mongoose pre-save hook, leaving passwords stored as
 * plain-text. This script finds every user whose password is NOT a valid
 * bcrypt hash and re-hashes it.
 *
 * Run: npx ts-node-dev --transpile-only seed/fix-passwords.ts
 */

import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import dotenv   from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marks_result_db';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Use the raw collection so we can read un-transformed documents
  const col = mongoose.connection.collection('users');

  const users = await col.find({}).toArray();
  console.log(`Found ${users.length} users total\n`);

  let fixed = 0;
  let skipped = 0;

  for (const user of users) {
    const pwd: string = user.password;

    // bcrypt hashes always start with $2b$ or $2a$ and are exactly 60 chars
    const isAlreadyHashed = /^\$2[ab]\$/.test(pwd);

    if (isAlreadyHashed) {
      skipped++;
      continue;
    }

    // Plain-text password — re-hash it
    const hashed = await bcrypt.hash(pwd, 12);
    await col.updateOne({ _id: user._id }, { $set: { password: hashed } });
    fixed++;

    if (fixed % 50 === 0) process.stdout.write(`  Hashed ${fixed} so far…\r`);
  }

  console.log(`\n✅ Done!`);
  console.log(`   Re-hashed : ${fixed}`);
  console.log(`   Already OK: ${skipped}`);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
