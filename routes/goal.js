import express from 'express';
import { getGoal, getGoals, upsertGoal, deleteGoal } from '../controllers/goal.js';

const router = express.Router();

router
    .route('/:id')
    .get(getGoal);

router
    .route('/')
    .get(getGoals);

router
    .route('/')
    .post(upsertGoal);

router
    .route('/:id')
    .post(deleteGoal);

export default router;