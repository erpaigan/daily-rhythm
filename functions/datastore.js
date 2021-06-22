import { Datastore } from '@google-cloud/datastore';
import jwt from 'jsonwebtoken';

import { NATIVE, GOOGLE } from '../constants/constants.js';
import { JWT_PRIVATE_KEY } from '../constants/secrets.js';
import { comparePasswords, verifyGoogleAuth, isEmpty } from './utility.js';
import userSchema from '../schematics/userSchema.js';

const datastore = new Datastore();

// If the id is a string, Google calls it name, otherwise,
// it is called Id. This function is termed name id because
// we cant save very long integer values which Google auth
// sub returns to us, so we save it as a string.
const getEntityByIdOrName = async (idOrName, kind, source) => {
    const responseData = {
        success: true
    };

    const key = datastore.key([kind, source === GOOGLE ? idOrName.toString() : datastore.int(idOrName)]);
    const [entity] = await datastore.get(key);

    responseData.payload = entity;

    return responseData;
}

const getEntityByType = async (type, idOrName, kind) => {
    const key = datastore.key([kind, type === 'name' ? idOrName.toString() : datastore.int(idOrName)]);
    const [entity] = await datastore.get(key);

    responseData.payload = entity;

    return responseData;
}

const getEntityById = async (id, kind) => {
    return getEntityByType('id', id, kind);
}

const getEntityByName = async (name, kind) => {
    return getEntityByType('name', name, kind);
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

    const key = datastore.key(id ? [kind, id.toString()] : kind);
    const entity = {
        key,
        data,
    };

    const [newEntity] = await datastore.upsert(entity);

    responseData.payload = key.id;

    return responseData;
}

const upsertEntityWithAncestor = async (type, data, kind, ancestor, ancestorNameId, id) => {
    const responseData = {
        success: true
    };

    const keyArray = [ancestor, type === 'name' ? ancestorNameId.toString() : datastore.int(ancestorNameId), kind];

    if (id) {
        keyArray.push(id);
    }

    const key = datastore.key(keyArray);

    const entity = {
        key,
        data,
    };

    const [newEntity] = await datastore.upsert(entity);

    responseData.payload = key.id;

    return responseData;
}

const upsertEntityWithAncestorId = async (data, kind, ancestor, ancestorId, id) => {
    return upsertEntityWithAncestor('id', data, kind, ancestor, ancestorId, id);
}

const upsertEntityWithAncestorName = async (data, kind, ancestor, ancestorId, id) => {
    return upsertEntityWithAncestor('name', data, kind, ancestor, ancestorId, id);
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

const signInGoogleUser = async (tokenId, referrer, source) => {
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

        const entity = await getEntityByIdOrName(userData.id, 'User', GOOGLE);

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

                const validatedUser = await userSchema({
                    firstname: userData.firstname,
                    lastname: userData.lastname,
                    email: userData.email,
                    password: '',
                    confirm: ''
                }, true);

                if (validatedUser.success) {

                    const userId = await upsertEntity(validatedUser.payload, 'User', userData.id);

                } else {
                    responseData.success = validatedUser.success;
                    responseData.message = validatedUser.message;
                }
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

export {
    signInUser,
    signInGoogleUser,
    getEntityByIdOrName,
    getEntityById,
    getEntityByName,
    getKey,
    getEntities,
    upsertEntity,
    upsertEntityWithAncestorId,
    upsertEntityWithAncestorName
};