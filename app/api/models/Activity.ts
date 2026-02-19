import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'user_login',
        'user_logout',
        'user_created',
        'user_updated',
        'user_suspended',
        'user_activated',
        'user_deleted',
      ],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true }
);

// Create index for faster queries
activitySchema.index({ createdAt: -1 });
activitySchema.index({ userId: 1 });

export default mongoose.models.Activity || mongoose.model('Activity', activitySchema);
