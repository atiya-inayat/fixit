import mongoose, { Schema } from 'mongoose';

const volunteerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  userName: { type: String, required: true },
  skills: [{ type: String, enum: ['labor', 'transport', 'technical', 'funding'] }],
  joinedAt: { type: Date, default: Date.now },
});

const timelineEventSchema = new Schema({
  type: {
    type: String,
    enum: ['reported', 'volunteer_joined', 'donation', 'status_change', 'resolved', 'flagged'],
    required: true,
  },
  description: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const issueSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Infrastructure', 'Sanitation', 'Environment', 'Safety', 'Public Services', 'Other'],
    required: true,
  },
  status: { type: String, enum: ['reported', 'in_progress', 'resolved'], default: 'reported' },
  photos: [{ type: String }],
  afterPhotos: [{ type: String }],
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  reporter: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  reporterName: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  volunteers: [volunteerSchema],
  flags: { type: Number, default: 0 },
  flaggedBy: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  aiVerification: {
    result: { type: String, enum: ['verified', 'uncertain'] },
    confidence: { type: Number },
    explanation: { type: String },
  },
  timeline: [timelineEventSchema],
}, { timestamps: true });

export const Issue = mongoose.model('Issue', issueSchema);
