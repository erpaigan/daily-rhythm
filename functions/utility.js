import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

import { SALTROUNDS, ISS, OAUTH2CLIENTID } from '../constants/secrets.js';

const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, SALTROUNDS);

    return hashedPassword;
}

const comparePasswords = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);

    return isMatch;
}

const removeObjectsListProps = (objectListWithProps, props) => {
    objectListWithProps.map(singleObject => {
        props.forEach(prop => {
            delete singleObject[prop];
        });

        return singleObject;
    });
}

const removeObjectProps = (objectWithProps, props) => {
    props.forEach(prop => {
        delete objectWithProps[prop];
    });
}

const isEmpty = obj => {
    return (obj && Object.keys(obj).length === 0 && obj.constructor === Object);
}

const verifyGoogleAuth = async tokenId => {
    const authResponse = {
        success: true
    }

    try {
        const client = new OAuth2Client(process.env.CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.CLIENT_ID,
        }).catch(error => console.log(error));

        if (ticket) {
            const authPayload = ticket.getPayload();

            if (authResponse.success &&
                authPayload.iss === ISS &&
                authPayload.aud === OAUTH2CLIENTID) {

                authResponse.payload = {
                    id: authPayload['sub'],
                    firstname: authPayload['given_name'],
                    lastname: authPayload['family_name'],
                    email: authPayload['email']
                }
            }
        } else {
            authResponse.success = false;
            authResponse.message = 'Problem authenticating with Google.'
        }
    } catch (error) {
        authResponse.success = false;
        authResponse.message = 'Problem authenticating with Google.'

        console.log(error);
    }

    return authResponse;
}

export {
    hashPassword,
    comparePasswords,
    removeObjectsListProps,
    removeObjectProps,
    isEmpty,
    verifyGoogleAuth
};