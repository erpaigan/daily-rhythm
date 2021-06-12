import { Datastore } from '@google-cloud/datastore';

import { NATIVE, GOOGLE } from '../constants/constants.js';
import { getEntity, signInUser, signInGoogleUser, upsertEntity } from '../functions/datastore.js';
import { hashPassword } from '../functions/utility.js';


const datastore = new Datastore();

// Get all users
// GET /api/v1/user
// Private
const postSignIn = async (request, response) => {
    const { source } = request.headers;

    try {
        let payload;

        if (source === NATIVE) {
            const { email, password } = request.body;

            payload = await signInUser(email, password);
        } else if (source === GOOGLE) {
            const data = request.body;

            payload = await signInGoogleUser(data);
        }

        return response.status(payload.code).json(payload);

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
        const payload = await upsertEntity(user, 'User');

        return response.status(200).json(payload);
    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while signing up.'
        })
    }
}

export { postSignIn, postSignUp };