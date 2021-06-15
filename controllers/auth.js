import { Datastore } from '@google-cloud/datastore';

import { NATIVE, GOOGLE } from '../constants/constants.js';
import { getEntity, signInUser, signInGoogleUser, upsertEntity } from '../functions/datastore.js';
import { hashPassword } from '../functions/utility.js';

const datastore = new Datastore();

// Get all users
// GET /api/v1/user
// Private
const postSignIn = async (request, response) => {
    const { source, authorization } = request.headers;

    try {
        let responseData;

        if (source === NATIVE) {
            const { email, password } = request.body;

            responseData = await signInUser(email, password);
        } else if (source === GOOGLE) {
            const tokenId = authorization.split(' ')[1];

            responseData = await signInGoogleUser(tokenId);
        }

        return response.status(responseData.code).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while signing in.'
        });
    }
}

// Add user
// POST /api/v1/user
// Private
const postSignUp = async (request, response) => {
    const user = {
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        role: 'USER',
        email: request.body.email,
        password: await hashPassword(request.body.password),
    };

    try {
        // Check if user already exists
        const responseData = await upsertEntity(user, 'User');

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while signing up.'
        })
    }
}

export { postSignIn, postSignUp };