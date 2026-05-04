import mongoose from 'mongoose';

export const TaskTemplate = mongoose.model(
  'TaskTemplate',
  new mongoose.Schema(
    {
      gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
      },
      title: { type: String, required: true },
      items: [{ type: String }],
      scheduleHint: { type: String, default: 'daily' },
    },
    { timestamps: true }
  )
);

export const TaskRun = mongoose.model(
  'TaskRun',
  new mongoose.Schema(
    {
      gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
      },
      templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskTemplate',
        required: true,
      },
      completedByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      checklistState: [{ item: String, done: Boolean }],
      completedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  )
);
