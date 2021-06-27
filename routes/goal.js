import express from 'express';

import { getGoals } from '../controllers/goal.js';
import auth from '../middleware/auth.js'
import dailyRoutineUpdate from '../middleware/dailyRoutineUpdate.js';

const router = express.Router();

router
    .route('/')
    .get(auth, dailyRoutineUpdate, getGoals);

export default router;