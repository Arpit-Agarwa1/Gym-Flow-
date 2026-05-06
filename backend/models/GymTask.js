import mongoose from 'mongoose';

const taskTemplateSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    items: [{ type: String, trim: true, maxlength: 500 }],
    scheduleHint: { type: String, default: 'daily', trim: true, maxlength: 120 },
  },
  { timestamps: true }
);

taskTemplateSchema.index({ gymId: 1, updatedAt: -1 });

export const TaskTemplate = mongoose.model('TaskTemplate', taskTemplateSchema);

const taskRunSchema = new mongoose.Schema(
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
);

taskRunSchema.index({ gymId: 1, completedAt: -1 });
taskRunSchema.index({ gymId: 1, templateId: 1, completedAt: -1 });

export const TaskRun = mongoose.model('TaskRun', taskRunSchema);
