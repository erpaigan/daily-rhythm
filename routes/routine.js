import express from 'express';

import { getRoutine, getRoutines, upsertRoutine, deleteRoutine } from '../controllers/routine.js';
import auth from '../middleware/auth.js'
import { routineValidation } from '../middleware/validation/routineValidation.js'

const router = express.Router();

router
    .route('/:id')
    .get(auth, getRoutine);

router
    .route('/')
    .get(auth, getRoutines);

router
    .route('/')
    .post(auth, routineValidation, upsertRoutine);

router
    .route('/:id')
    .delete(auth, deleteRoutine);

export default router;