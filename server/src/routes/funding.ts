import { Router, Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Issue } from '../models/Issue';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadToCloudinary } from '../lib/cloudinary';

const router = Router();

router.post('/:id/fund', requireAuth, async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { amount } = req.body;
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const transaction = await Transaction.create({
    issueId: issue._id,
    type: 'donation',
    amount: parseFloat(amount),
    userName: authReq.user!.name,
    userId: authReq.user!.id,
    description: `Donation by ${authReq.user!.name}`,
  });

  issue.timeline.push({
    type: 'donation',
    description: `${authReq.user!.name} donated Rs. ${amount}`,
    userId: authReq.user!.id,
  } as any);
  await issue.save();

  res.status(201).json({ transaction });
});

router.post('/:id/expense', requireAuth, upload.single('receipt'), async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { amount, description } = req.body;
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const file = (req as any).file as Express.Multer.File | undefined;
  const receiptUrl = file ? await uploadToCloudinary(file.buffer, 'fixit/receipts') : undefined;

  const transaction = await Transaction.create({
    issueId: issue._id,
    type: 'expense',
    amount: parseFloat(amount),
    description,
    receiptUrl,
    userName: authReq.user!.name,
    userId: authReq.user!.id,
  });

  res.status(201).json({ transaction });
});

router.get('/:id/ledger', async (req: Request, res: Response) => {
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
