import { Router } from 'express';
import { Issue } from '../models/Issue';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadToCloudinary } from '../lib/cloudinary';

const router = Router();

router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  const { status, category } = req.query;
  const filter: any = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  const issues = await Issue.find(filter).sort({ createdAt: -1 });
  res.json({ issues });
});

router.get('/map', async (req, res) => {
  const issues = await Issue.find({}, 'title latitude longitude status category').lean();
  res.json({ issues });
});

router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  res.json({ issue });
});

router.post('/', requireAuth, upload.array('photos', 5), async (req: AuthRequest, res) => {
  const { title, description, category, latitude, longitude } = req.body;
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) return res.status(400).json({ error: 'At least one photo is required' });
  if (!latitude || !longitude) return res.status(400).json({ error: 'GPS location is required' });

  const photos = await Promise.all(files.map(f => uploadToCloudinary(f.buffer, 'fixit/photos')));

  const issue = await Issue.create({
    title,
    description,
    category,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    photos,
    reporter: req.user!.id,
    reporterName: req.user!.name,
    timeline: [{
      type: 'reported',
      description: `Reported by ${req.user!.name}`,
      userId: req.user!.id,
    }],
  });

  res.status(201).json({ issue });
});

router.patch('/:id/status', requireAuth, upload.array('afterPhotos', 5), async (req: AuthRequest, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const isReporter = issue.reporter.toString() === req.user!.id;
  const isVolunteer = issue.volunteers.some(v => v.user.toString() === req.user!.id);
  if (!isReporter && !isVolunteer) return res.status(403).json({ error: 'Only reporter or volunteers can update status' });

  const { status } = req.body;
  if (!['in_progress', 'resolved'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const files = req.files as Express.Multer.File[];
  if (status === 'resolved' && files && files.length > 0) {
    issue.afterPhotos = await Promise.all(files.map(f => uploadToCloudinary(f.buffer, 'fixit/after')));
  }

  issue.status = status as any;
  issue.timeline.push({
    type: status === 'resolved' ? 'resolved' : 'status_change',
    description: `Status changed to ${status} by ${req.user!.name}`,
    userId: req.user!.id,
  } as any);

  await issue.save();
  res.json({ issue });
});

router.post('/:id/upvote', requireAuth, async (req: AuthRequest, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const userId = req.user!.id;
  const alreadyUpvoted = issue.upvotedBy.map(id => id.toString()).includes(userId);

  if (alreadyUpvoted) {
    issue.upvotedBy = issue.upvotedBy.filter(id => id.toString() !== userId) as any;
    issue.upvotes = Math.max(0, issue.upvotes - 1);
  } else {
    issue.upvotedBy.push(userId as any);
    issue.upvotes += 1;
  }

  await issue.save();
  res.json({ upvotes: issue.upvotes });
});

router.post('/:id/volunteer', requireAuth, async (req: AuthRequest, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const alreadyVolunteered = issue.volunteers.some(v => v.user.toString() === req.user!.id);
  if (alreadyVolunteered) return res.status(400).json({ error: 'Already volunteered' });

  const { skills } = req.body;
  issue.volunteers.push({
    user: req.user!.id as any,
    userName: req.user!.name,
    skills: skills || [],
  } as any);

  issue.timeline.push({
    type: 'volunteer_joined',
    description: `${req.user!.name} volunteered (${(skills || []).join(', ')})`,
    userId: req.user!.id,
  } as any);

  await issue.save();
  res.json({ volunteers: issue.volunteers });
});

router.delete('/:id/volunteer', requireAuth, async (req: AuthRequest, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  issue.volunteers = issue.volunteers.filter(v => v.user.toString() !== req.user!.id) as any;
  await issue.save();
  res.json({ volunteers: issue.volunteers });
});

router.post('/:id/flag', requireAuth, async (req: AuthRequest, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const alreadyFlagged = issue.flaggedBy.map(id => id.toString()).includes(req.user!.id);
  if (alreadyFlagged) return res.status(400).json({ error: 'Already flagged' });

  issue.flaggedBy.push(req.user!.id as any);
  issue.flags += 1;
  issue.timeline.push({
    type: 'flagged',
    description: `Flagged by community member: ${req.body.reason || 'No reason given'}`,
    userId: req.user!.id,
  } as any);

  await issue.save();
  res.json({ flags: issue.flags });
});

export default router;
