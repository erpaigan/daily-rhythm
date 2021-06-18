import express from 'express';

import { postSignUp, postSignIn } from '../controllers/auth.js';
import { userValidation } from '../middleware/validation/userValidation.js';

const router = express.Router();

router
    .route('/signup')
    .post(userValidation, postSignUp);

router
    .route('/signin')
    .post(postSignIn);

export default router;