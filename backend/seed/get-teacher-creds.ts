import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marks_result_db').then(async () => {
  const col = mongoose.connection.collection('users');
  const user = await col.findOne({ email: 'te000008@edu.ppd' });
  
  if (!user) { console.log('User NOT found!'); process.exit(1); }
  
  const stored = user.password;
  console.log('Stored hash:', stored);
  console.log('Is bcrypt?  ', /^\$2[ab]\$/.test(stored));
  
  const match1 = await bcrypt.compare('te000008', stored);
  const match2 = await bcrypt.compare('TE000008', stored);
  const match3 = await bcrypt.compare('te000008@edu.ppd', stored);
  
  console.log('compare(te000008)          :', match1);
  console.log('compare(TE000008)          :', match2);
  console.log('compare(te000008@edu.ppd)  :', match3);
  
  await mongoose.disconnect();
});
