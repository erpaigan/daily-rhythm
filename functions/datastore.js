import { Datastore } from '@google-cloud/datastore';
import jwt from 'jsonwebtoken';

import { NATIVE, GOOGLE } from '../constants/constants.js';
import { JWT_PRIVATE_KEY } from '../constants/secrets.js';
import { comparePasswords, verifyGoogleAuth, isEmpty } from './utility.js'

const datastore = new Datastore();

const getEntityById = async (id, kind) => {
    const responseData = {
        success: true
    };

    const key = datastore.key([kind, datastore.int(id)]);
    const [entity] = await datastore.get(key);

    responseData.payload = entity;

    return responseData;
}

// Keys only request
const getKey = async (kind, property, operator, value) => {
    const query = datastore
        .createQuery(kind)
        .select('__key__')
        .filter(property, operator, value)
        .limit(1);

    const [entity] = await datastore.runQuery(query);

    return entity;
}

const getEntityByKey = async (entityKey) => {
    let [key] = entityKey;
    key = key[datastore.KEY];

    const [entity] = await datastore.get(key);

    return entity;
}

const getEntities = async (requestQuery, kind, includeId) => {
    const responseData = {
        success: true
    };

    const query = datastore.createQuery(kind)

    if (requestQuery?.limit) {
        query.limit(requestQuery.limit);
    }

    // Set query cursor if available
    if (requestQuery?.cursor) {
        query.start(requestQuery.cursor);
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
        success: true
    };

    const key = datastore.key(id ? [kind, datastore.int(id)] : kind);
    const entity = {
        key,
        data,
    };

    const [newEntity] = await datastore.upsert(entity);

    responseData.payload = key.id;

    return responseData;
}

const signInUser = async (email, password, referrer) => {
    const responseData = {
        success: true,
        message: {}
    };

    const userKey = await getKey('User', 'email', '=', email);

    if (userKey.length) {

        const user = await getEntityByKey(userKey);

        if (!user.password) {
            responseData.success = false;
            responseData.message.text = 'Try signing in using the Sign in with Google button below.';
            responseData.message.type = 'INFO';

        } else {
            if (await comparePasswords(password, user.password)) {
                const jwtToken = jwt.sign({ email: user.email, id: user[datastore.KEY].id }, JWT_PRIVATE_KEY, { expiresIn: '7d' });

                responseData.token = {
                    id: jwtToken,
                    source: NATIVE
                }

                // grab the goals and stuff depending on referrer 
                if (referrer === '/goals') {

                } else if (referrer === '/stash') {

                }

                // responseData.payload = goals or stash entities

            } else {
                responseData.success = false;
                responseData.message.text = 'Email or password may be incorrect.';
                responseData.message.type = 'WARNING';
            }

        }

        return responseData;
    } else {
        responseData.success = false;
        responseData.message.text = 'Email or password may be incorrect.';
        responseData.message.type = 'WARNING';

        return responseData;
    }
}

const signInGoogleUser = async (tokenId, referrer) => {
    const responseData = {
        success: true,
        message: {}
    };

    const authResponse = await verifyGoogleAuth(tokenId);

    if (authResponse.message?.text) {
        responseData.message.text = authResponse.message.text;
        responseData.message.type = authResponse.message.type;
    }

    if (authResponse.success) {
        const userData = authResponse.payload

        responseData.token = {
            id: tokenId,
            source: GOOGLE
        }

        const entity = await getEntityById(userData.id, 'User');

        if (!entity.payload || isEmpty(entity?.payload)) {

            const userKey = await getKey('User', 'email', '=', userData.email)

            if (userKey.length) {

                const user = await getEntityByKey(userKey);

                const jwtToken = jwt.sign({ email: user.email, id: user[datastore.KEY].id }, JWT_PRIVATE_KEY, { expiresIn: '7d' });

                responseData.token = {
                    id: jwtToken,
                    source: NATIVE
                }

                // grab the goals and stuff depending on referrer 
                if (referrer === '/goals') {

                } else if (referrer === '/stash') {

                }

                // responseData.payload = goals or stash entities

            } else {
                // Create user here, no need grabbing stuff
            }

        } else {

            // grab the goals and stuff depending on referrer 
            if (referrer === '/goals') {

            } else if (referrer === '/stash') {

            }

        }

    } else {
        responseData.success = false;
    }

    return responseData;
}

export { signInUser, signInGoogleUser, getEntityById, getKey, getEntities, upsertEntity };