import jwt from 'jsonwebtoken';

import { JWT_PRIVATE_KEY } from '../constants/secrets.js';
import { GOOGLE, NATIVE } from '../constants/constants.js';
import { isEmpty } from '../functions/utility.js';

const auth = async (request, response, next) => {

    try {

        const tokenId = request.headers.authorization.split(" ")[1];
        const source = request.headers.source;

        let decodedToken;

        if (source === NATIVE) {

            decodedToken = jwt.verify(tokenId, JWT_PRIVATE_KEY);

        } else if (source === GOOGLE) {

            // Implement verifyGoogleAuth(tokenId) in the future
            decodedToken = jwt.decode(tokenId);

        }

        if (decodedToken && !isEmpty(decodedToken)) {

            // Check if expired
            if (decodedToken.exp < new Date().getTime()) {

                if (source === GOOGLE) {
                    request.userId = decodedToken.sub;
                } else if (source === NATIVE) {
                    request.userId = decodedToken.id
                }

            } else {
                response.status(200).json({
                    success: false,
                    message: {
                        text: 'Your token has expired. Please sign back in.',
                        type: 'ERROR'
                    }
                });
            }

        } else {
            response.status(200).json({
                success: false,
                message: {
                    text: 'You shall not pass!',
                    type: 'ERROR'
                }
            });
        }

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while authenticating user.'
        });
    }

    next();
}

export default auth;