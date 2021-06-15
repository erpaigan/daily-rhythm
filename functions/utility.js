import bcrypt from 'bcrypt';
import { SALTROUNDS, ISS, OAUTH2CLIENTID } from '../constants/secrets.js';
import { OAuth2Client } from 'google-auth-library';

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

const verifyGoogleAuth = async tokenId => {
    const authResponse = {
        success: true,
        code: 200
    }

    const client = new OAuth2Client(process.env.CLIENT_ID);

    const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.CLIENT_ID,
    }).catch(error => {
        authResponse.success = false;
        authResponse.code = 401;
        authResponse.message = 'Problem authenticating with Google.'

        console.log(error);
    });

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
    }

    return authResponse;
}

export { hashPassword, comparePasswords, removeObjectsListProps, removeObjectProps, verifyGoogleAuth };