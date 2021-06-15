import { Datastore } from '@google-cloud/datastore';
import jwt from 'jsonwebtoken';

import { JWT_PRIVATE_KEY } from '../constants/secrets.js';
import { comparePasswords, verifyGoogleAuth } from './utility.js'

const datastore = new Datastore();

const signInUser = async (email, password) => {
    const responseData = {
        success: true,
        code: 200
    };

    const query = datastore.createQuery('User').select('__key__').filter('email', '=', email).limit(1);
    const [entity] = await datastore.runQuery(query);

    if (entity.length) {
        let [key] = entity;
        key = key[datastore.KEY];

        const [user] = await datastore.get(key);

        if (await comparePasswords(password, user.password)) {
            responseData.token = jwt.sign({ email: user.email, id: user[datastore.KEY].id }, JWT_PRIVATE_KEY, { expiresIn: '7d' })
            responseData.message = 'User is legit';
        } else {
            responseData.success = 'Email or password may be incorrect'
            responseData.code = 402;
        }

        return responseData;
    } else {
        responseData.success = false;
        responseData.code = 404;
        responseData.message = 'User does not exist.';

        return responseData;
    }
}

const signInGoogleUser = async (tokenId) => {
    const authResponse = await verifyGoogleAuth(tokenId);

    if (authResponse.success) {
        const userData = authResponse.payload

        const user = {
            id: userData.payid,
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email
        };

        // To do: Search database and upsert user to the database
    }

    return authResponse;
}

// get keys only
// const query = datastore.createQuery().select('__key__').limit(1);


const getEntity = async (id, kind) => {
    const responseData = {
        success: true,
        code: 200
    };

    const key = datastore.key([kind, datastore.int(id)]);
    const [entity] = await datastore.get(key);

    responseData.payload = entity;

    return responseData;
}

const getEntities = async (request, kind, includeId) => {
    const responseData = {
        success: true,
        code: 200
    };

    const query = datastore.createQuery(kind)

    if (request.query.limit) {
        query.limit(request.query.limit);
    }

    // Set query cursor if available
    if (request.query.cursor) {
        query.start(request.query.cursor);
    }

    const [entities, cursor] = await datastore.runQuery(query);

    // Add Id's to result if specified in includeId
    if (includeId) {
        entities.map(entity => {
            entity['id'] = entity[datastore.KEY]['id']
            return entity
        });
    }

    responseData.payload = entities

    // Check if more results may exist.
    if (cursor.moreResults !== datastore.NO_MORE_RESULTS) {
        responseData.cursor = cursor.endCursor;
    }

    return responseData;
}

const upsertEntity = async (data, kind, id) => {
    const responseData = {
        success: true,
        code: 200
    };

    const key = datastore.key(id ? [kind, datastore.int(id)] : kind);
    const entity = {
        key,
        data,
    };

    const [newEntity] = await datastore.upsert(entity);

    console.log(newEntity);

    responseData.payload = key.id;

    return responseData;
}

export { signInUser, signInGoogleUser, getEntity, getEntities, upsertEntity };