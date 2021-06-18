import jwt from 'jsonwebtoken';

import { JWT_PRIVATE_KEY } from '../constants/secrets.js';
import { verifyGoogleAuth } from '../functions/utility';

const auth = async (request, response, next) => {
    try {

        const tokenId = request.headers.authorization.split(" ")[1];
        const source = request.headers.source;
        console.log(tokenId);
        console.log(source);

        // check if from google or native

        // verify token with jwt or google:
        // jwt.verify(tokenId, JWT_PRIVATE_KEY)
        // verifyGoogleAuth(tokenId)

        // if not respond with 403 status, success false and
        // message you shall not pass

        // check if token is expired:
        // verifiedToken.exp < new Date().getTime()

        // else: return with success false and message token has expired

        // get the user id from the token

        // search for the user in the database (keys only)

        // if not found:
        // return response.status(403).json({
        //     success: false,
        //     payload: {
        //         success: false,
        //         message: {
        //             type: ERROR
        //             text: 'Please sign in to continue.'
        //         }
        //     }
        //     error: 'You must be signed in to gain access.'
        // });

        // if found:
        // set request.userId = user's id

        next();
    } catch (error) {
        console.log(error);
    }
}

export default auth;