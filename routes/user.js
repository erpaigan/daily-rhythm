import express from 'express';
import { getUser, getUsers, upsertUser, deleteUser } from '../controllers/user.js';

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

export default router;