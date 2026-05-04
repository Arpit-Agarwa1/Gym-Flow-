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
    duration: { type: Number }, // minutes
    source: {
      type: String,
      enum: ['manual', 'qr', 'staff'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Attendance', attendanceSchema);
