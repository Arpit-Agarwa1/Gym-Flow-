import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date },
    duration: { type: Number, min: 0 }, // minutes
    source: {
      type: String,
      enum: ['manual', 'qr', 'staff'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ gymId: 1, checkInTime: -1 });
attendanceSchema.index({ gymId: 1, memberId: 1, checkInTime: -1 });

export default mongoose.model('Attendance', attendanceSchema);
