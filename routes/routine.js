import express from 'express';

import { getRoutine, getRoutines, upsertRoutine, reorderRoutines, deleteRoutine } from '../controllers/routine.js';
import auth from '../middleware/auth.js'
import { routineValidation } from '../middleware/validation/routineValidation.js'

const router = express.Router();

router
    .route('/:id')
    .get(getRoutine);

router
    .route('/')
    .get(getRoutines);

router
    .route('/')
    .post(auth, routineValidation, upsertRoutine);

router
    .route('/reorder')
    .put(auth, reorderRoutines);

router
    .route('/:id')
    .put(auth, routineValidation, upsertRoutine);

router
    .route('/:id')
    .delete(auth, deleteRoutine);

export default router;