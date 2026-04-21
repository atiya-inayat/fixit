import { Router } from 'express';
import { Issue } from '../models/Issue';
import { Transaction } from '../models/Transaction';

const router = Router();

router.get('/stats', async (req, res) => {
  const totalIssues = await Issue.countDocuments();
  const resolvedCount = await Issue.countDocuments({ status: 'resolved' });
  const allIssues = await Issue.find({}, 'volunteers');
  const activeVolunteers = new Set(allIssues.flatMap(i => i.volunteers.map(v => v.user.toString()))).size;

  const donations = await Transaction.aggregate([
    { $match: { type: 'donation' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const expenses = await Transaction.aggregate([
    { $match: { type: 'expense' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  res.json({
    totalIssues,
    resolvedCount,
    fundsRaised: donations[0]?.total || 0,
    fundsSpent: expenses[0]?.total || 0,
    activeVolunteers,
    resolutionRate: totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0,
  });
});

export default router;
