import { Router } from 'express';
import { auth } from '../lib/auth';
import { toNodeHandler } from 'better-auth/node';

const router = Router();

// Mount better-auth handler on all /api/auth/* routes
router.all('/*', toNodeHandler(auth));

export default router;
