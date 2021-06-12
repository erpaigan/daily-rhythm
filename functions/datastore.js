import { Datastore } from '@google-cloud/datastore';
import jwt from 'jsonwebtoken';

import { JWT_PRIVATE_KEY } from '../constants/secrets.js';
import { comparePasswords } from './utility.js'

const datastore = new Datastore();

const signInUser = async (email, password) => {
    const payload = {
        success: true,
        code: 200,
    };

    const query = datastore.createQuery('User').select('__key__').filter('email', '=', email).limit(1);
    const [entity] = await datastore.runQuery(query);

    if (entity.length) {
        let [key] = entity;
        key = key[datastore.KEY];

        const [user] = await datastore.get(key);

        if (await comparePasswords(password, user.password)) {
            payload.token = jwt.sign({ email: user.email, id: user[datastore.KEY].id }, JWT_PRIVATE_KEY, { expiresIn: '7d' })
            payload.message = 'User is legit';
        } else {
            payload.success = 'Email or password may be incorrect'
            payload.code = 402;
        }

        return payload;
    } else {
        payload.success = false;
        payload.code = 404;
        payload.message = 'User does not exist.';

        return payload;
    }
}

const signInGoogleUser = async (data) => {
    // To do: Search database if user exists or not. If not, add user to the database

    // user created via google
    // logs in via native

    // user created natively
    // logs in via google
}

const getEntity = async (request, kind) => {
    const payload = {
        success: true
    };

    const key = datastore.key([kind, datastore.int(request.params.id)]);
    const [entity] = await datastore.get(key);

    payload.data = entity;

    return payload;
}

const getEntities = async (request, kind, includeId) => {
    const payload = {
        success: true
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

    payload.data = entities

    // Check if more results may exist.
    if (cursor.moreResults !== datastore.NO_MORE_RESULTS) {
        payload.cursor = cursor.endCursor;
    }

    return payload;
}

const upsertEntity = async (data, kind) => {
    const payload = {
        success: true
    };

    const key = datastore.key(kind);
    const entity = {
        key,
        data,
    };

    const [newEntity] = await datastore.upsert(entity);

    console.log(newEntity);

    payload.data = key.id;

    return payload;
}

export { signInUser, signInGoogleUser, getEntity, getEntities, upsertEntity };