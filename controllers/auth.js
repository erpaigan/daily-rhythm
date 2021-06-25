import { Datastore } from '@google-cloud/datastore';
import jwt from 'jsonwebtoken';

import { NATIVE, GOOGLE } from '../constants/constants.js';
import { JWT_PRIVATE_KEY } from '../constants/secrets.js';
import { upsertEntity, getKey, signInUser, signInGoogleUser } from '../functions/datastore.js';

const datastore = new Datastore();

// User sign in
// GET /api/v1/auth/signin
// Public
const postSignIn = async (request, response) => {
    const { source, authorization } = request.headers;

    try {
        let responseData;

        const { payload } = request.body;

        if (source === NATIVE) {

            responseData = await signInUser(payload.email, payload.password);

        } else if (source === GOOGLE) {
            const tokenId = authorization.split(' ')[1];

            responseData = await signInGoogleUser(tokenId);
        }

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while signing in.'
        });
    }
}

// User sign up
// POST /api/v1/auth/signup
// Public
const postSignUp = async (request, response) => {
    const responseData = {
        success: true,
        message: {}
    }

    const validatedUser = request.validatedUser

    try {
        const userKey = await getKey('User', 'email', '=', validatedUser.email);

        if (userKey.length) {

            responseData.success = false;
            responseData.message = {
                text: 'An account with this email already exists, please use another email.',
                type: 'INFO'
            }

        } else {
            const userData = await upsertEntity(validatedUser, 'User');

            const jwtToken = jwt.sign({ email: validatedUser.email, id: userData.payload }, JWT_PRIVATE_KEY, { expiresIn: '7d' });

            responseData.token = {
                id: jwtToken,
                source: NATIVE
            }
        }

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while signing up.'
        });
    }

}

export { postSignIn, postSignUp };