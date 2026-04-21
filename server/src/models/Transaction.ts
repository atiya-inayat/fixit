import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema({
  issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  type: { type: String, enum: ['donation', 'expense'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  receiptUrl: { type: String },
  userName: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
