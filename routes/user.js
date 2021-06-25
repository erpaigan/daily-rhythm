import express from 'express';

import { getUser, getUsers, upsertUser, deleteUser, checkInUser } from '../controllers/user.js';
import auth from '../middleware/auth.js'

const router = express.Router();

router
    .route('/:id')
    .get(getUser);

router
    .route('/')
    .get(getUsers);

router
    .route('/')
    .post(upsertUser);

router
    .route('/:id')
    .delete(deleteUser);

router
    .route('/checkin')
    .put(auth, checkInUser);

export default router;