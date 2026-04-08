import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBatch extends Document {
  branch_id: Types.ObjectId;
  start_year: number;
  graduation_year: number;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    branch_id: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    start_year: { type: Number, required: true },
    graduation_year: { type: Number, required: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

BatchSchema.virtual('current_semester').get(function () {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0 = Jan, 11 = Dec
  
  const yearDiff = currentYear - this.start_year;
  
  // Semester starts in August (month index 7)
  let sem = 0;
  if (currentMonth >= 7) { 
    sem = yearDiff * 2 + 1; // Aug/Sept/Oct/Nov/Dec -> Odd semesters
  } else { 
    sem = yearDiff * 2;     // Jan/Feb/Mar/Apr/May/Jun/Jul -> Even semesters
  }
  
  if (sem > 8) return 'Graduated';
  if (sem < 1) return 'Not Started';
  return sem;
});

export const Batch = mongoose.model<IBatch>('Batch', BatchSchema);
