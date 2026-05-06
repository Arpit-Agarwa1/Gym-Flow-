import mongoose from 'mongoose';

const waiverTemplateSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    bodyText: { type: String, required: true, maxlength: 100000 },
    version: { type: String, default: '1.0', trim: true, maxlength: 32 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

waiverTemplateSchema.index({ gymId: 1, active: 1 });
waiverTemplateSchema.index({ gymId: 1, updatedAt: -1 });

export const WaiverTemplate = mongoose.model(
  'WaiverTemplate',
  waiverTemplateSchema
);

const waiverSignatureSchema = new mongoose.Schema(
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
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WaiverTemplate',
      required: true,
    },
    templateVersion: { type: String, required: true, trim: true, maxlength: 32 },
    signedAt: { type: Date, default: Date.now },
    signerIp: { type: String, default: '', maxlength: 45 },
    pdfUrl: { type: String, default: '', maxlength: 2048 },
  },
  { timestamps: true }
);

waiverSignatureSchema.index({ gymId: 1, memberId: 1, signedAt: -1 });
waiverSignatureSchema.index({ templateId: 1, memberId: 1 });

export const WaiverSignature = mongoose.model(
  'WaiverSignature',
  waiverSignatureSchema
);
