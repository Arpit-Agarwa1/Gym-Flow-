import mongoose from 'mongoose';

export const WaiverTemplate = mongoose.model(
  'WaiverTemplate',
  new mongoose.Schema(
    {
      gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true,
      },
      title: { type: String, required: true },
      bodyText: { type: String, required: true },
      version: { type: String, default: '1.0' },
      active: { type: Boolean, default: true },
    },
    { timestamps: true }
  )
);

export const WaiverSignature = mongoose.model(
  'WaiverSignature',
  new mongoose.Schema(
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
      templateVersion: { type: String, required: true },
      signedAt: { type: Date, default: Date.now },
      signerIp: { type: String, default: '' },
      pdfUrl: { type: String, default: '' },
    },
    { timestamps: true }
  )
);
