import { Datastore } from '@google-cloud/datastore';
import jwt from 'jsonwebtoken';

import { JWT_PRIVATE_KEY } from '../constants/secrets.js';
import { comparePasswords } from './utility.js'

const datastore = new Datastore();

const signInUser = async (email, password) => {
    const response = {
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
            response.token = jwt.sign({ email: user.email, id: user[datastore.KEY].id }, JWT_PRIVATE_KEY, { expiresIn: '7d' })
            response.message = 'User is legit';
        } else {
            response.success = 'Email or password may be incorrect'
            response.code = 402;
        }

        return response;
    } else {
        response.success = false;
        response.code = 404;
        response.message = 'User does not exist.';

        return response;
    }
}

const signInGoogleUser = async (data) => {
    // To do: Search database if user exists or not. If not, add user to the database
}

const getEntity = async (req, kind) => {
    const response = {
        success: true
    };

    const key = datastore.key([kind, datastore.int(req.params.id)]);
    const [entity] = await datastore.get(key);

    response.data = entity;

    return response;
}

const getEntities = async (req, kind, includeId) => {
    const response = {
        success: true
    };

    const query = datastore.createQuery(kind)

    if (req.query.limit) {
        query.limit(req.query.limit);
    }

    // Set query cursor if available
    if (req.query.cursor) {
        query.start(req.query.cursor);
    }

    const [entities, cursor] = await datastore.runQuery(query);

    // Add Id's to result if specified in includeId
    if (includeId) {
        entities.map(entity => {
            entity['id'] = entity[datastore.KEY]['id']
            return entity
        });
    }

    response.data = entities

    // Check if more results may exist.
    if (cursor.moreResults !== datastore.NO_MORE_RESULTS) {
        response.cursor = cursor.endCursor;
    }

    return response;
}

const upsertEntity = async (data, kind) => {
    const response = {
        success: true
    };

    const key = datastore.key(kind);
    const entity = {
        key,
        data,
    };

    const [newEntity] = await datastore.upsert(entity);

    console.log(newEntity);

    response.data = key.id;

    return response;
}

export { signInUser, signInGoogleUser, getEntity, getEntities, upsertEntity };