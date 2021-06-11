import express from 'express';
import { postSignUp, postSignIn } from '../controllers/auth.js';

const router = express.Router();

router
    .route('/signup')
    .post(postSignUp);

router
    .route('/signin')
    .post(postSignIn);

export default router;