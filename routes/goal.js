import express from 'express';

import { getGoals } from '../controllers/goal.js';
import auth from '../middleware/auth.js'

const router = express.Router();

router
    .route('/')
    .get(auth, getGoals);

export default router;