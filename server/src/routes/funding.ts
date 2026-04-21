import { Router } from 'express';
import { Transaction } from '../models/Transaction';
import { Issue } from '../models/Issue';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadToCloudinary } from '../lib/cloudinary';

const router = Router();

router.post('/:id/fund', requireAuth, async (req: AuthRequest, res) => {
  const { amount } = req.body;
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const transaction = await Transaction.create({
    issueId: issue._id,
    type: 'donation',
    amount: parseFloat(amount),
    userName: req.user!.name,
    userId: req.user!.id,
    description: `Donation by ${req.user!.name}`,
  });

  issue.timeline.push({
    type: 'donation',
    description: `${req.user!.name} donated Rs. ${amount}`,
    userId: req.user!.id,
  } as any);
  await issue.save();

  res.status(201).json({ transaction });
});

router.post('/:id/expense', requireAuth, upload.single('receipt'), async (req: AuthRequest, res) => {
  const { amount, description } = req.body;
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const receiptUrl = req.file ? await uploadToCloudinary(req.file.buffer, 'fixit/receipts') : undefined;

  const transaction = await Transaction.create({
    issueId: issue._id,
    type: 'expense',
    amount: parseFloat(amount),
    description,
    receiptUrl,
    userName: req.user!.name,
    userId: req.user!.id,
  });

  res.status(201).json({ transaction });
});

router.get('/:id/ledger', async (req, res) => {
  const transactions = await Transaction.find({ issueId: req.params.id }).sort({ createdAt: 1 });
  const donations = transactions.filter(t => t.type === 'donation');
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalRaised = donations.reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

  res.json({
    transactions,
    totalRaised,
    totalSpent,
    balance: totalRaised - totalSpent,
  });
});

export default router;
