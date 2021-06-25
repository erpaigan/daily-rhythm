import { Datastore } from '@google-cloud/datastore';
import jwt from 'jsonwebtoken';

import { NATIVE, GOOGLE } from '../constants/constants.js';
import { JWT_PRIVATE_KEY } from '../constants/secrets.js';
import { comparePasswords, verifyGoogleAuth, isEmpty } from './utility.js';
import userSchema from '../schematics/userSchema.js';
import { response } from 'express';

const datastore = new Datastore();

const getEntity = async (type, idOrName, kind) => {
    const responseData = {
        success: true
    };

    const key = datastore.key([kind, type === 'name' ? idOrName.toString() : datastore.int(idOrName)]);
    const [entity] = await datastore.get(key);

    responseData.payload = entity;

    return responseData;
}

const getEntityById = async (id, kind) => {

    const responseData = await getEntity('id', id, kind);

    return responseData;
}

const getEntityByName = async (name, kind) => {

    const responseData = await getEntity('name', name, kind);

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

            if (entity[datastore.KEY]['id']) {
                entity['id'] = entity[datastore.KEY]['id']
            } else {
                entity['name'] = entity[datastore.KEY]['name']
            }

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

const getEntitiesWithAncestor = async (type, kind, ancestor, ancestorNameId) => {
    const responseData = {
        success: true
    };

    const keyArray = [ancestor, type === 'name' ? ancestorNameId.toString() : datastore.int(ancestorNameId)];

    const key = datastore.key(keyArray);

    const query = datastore
        .createQuery(kind)
        .hasAncestor(key)
        .order('created');

    const [entities, cursor] = await datastore.runQuery(query);

    entities.map(entity => {
        entity['id'] = entity[datastore.KEY]['id']
        return entity
    });

    responseData.payload = entities;

    return responseData;
}

const getEntitiesWithAncestorId = async (kind, ancestor, ancestorId) => {

    const responseData = await getEntitiesWithAncestor('id', kind, ancestor, ancestorId);

    return responseData;
}

const getEntitiesWithAncestorName = async (kind, ancestor, ancestorName) => {

    const responseData = await getEntitiesWithAncestor('name', kind, ancestor, ancestorName);

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
        keyArray.push(datastore.int(id));
    }

    const key = datastore.key(keyArray);

    const entity = {
        key,
        data,
    };

    const [newEntity] = await datastore.upsert(entity);

    responseData.payload = {
        id: key.id
    }

    return responseData;
}

const upsertEntityWithAncestorId = async (data, kind, ancestor, ancestorId, id) => {

    const responseData = await upsertEntityWithAncestor('id', data, kind, ancestor, ancestorId, id);

    return responseData;
}

const upsertEntityWithAncestorName = async (data, kind, ancestor, ancestorName, id) => {

    const responseData = await upsertEntityWithAncestor('name', data, kind, ancestor, ancestorName, id);

    return responseData;
}

const removeEntityByIdOrName = async (type, idOrName, kind) => {
    const responseData = {
        success: true
    };

    const key = datastore.key([kind, type === 'name' ? idOrName.toString() : datastore.int(idOrName)]);

    const [response] = await datastore.delete(key);

    return responseData;
}

const removeEntityById = async (idOrName, kind) => {

    const responseData = await removeEntityByIdOrName('id', idOrName, kind);

    return responseData;
}

const removeEntityByName = async (idOrName, kind) => {

    const responseData = await removeEntityByIdOrName('name', idOrName, kind);

    return responseData;
}

const removeEntityWithAncestor = async (type, kind, ancestor, ancestorNameId, id) => {
    const responseData = {
        success: true
    };

    const keyArray = [
        ancestor,
        type === 'name' ? ancestorNameId.toString() : datastore.int(ancestorNameId),
        kind,
        datastore.int(id)
    ];

    const key = datastore.key(keyArray);

    const [response] = await datastore.delete(key);

    return responseData;
}

const removeEntityWithAncestorId = async (kind, ancestor, ancestorId, id) => {

    const responseData = await removeEntityWithAncestor('id', kind, ancestor, ancestorId, id);

    return responseData;
}

const removeEntityWithAncestorName = async (kind, ancestor, ancestorName, id) => {

    const responseData = await removeEntityWithAncestor('name', kind, ancestor, ancestorName, id);

    return responseData;
}

const signInUser = async (email, password) => {
    const responseData = {
        success: true,
        message: {}
    };

    const userKey = await getKey('User', 'email', '=', email);

    if (userKey.length) {

        const user = await getEntityByKey(userKey);

        if (!user.password) {
            responseData.success = false;
            responseData.message.text = 'Try signing in using the Sign in with Google button.';
            responseData.message.type = 'INFO';

        } else {
            if (await comparePasswords(password, user.password)) {

                const userId = user[datastore.KEY].id;

                const jwtToken = jwt.sign({ email: user.email, id: userId }, JWT_PRIVATE_KEY, { expiresIn: '7d' });

                // Update user's last login time
                const userChange = await dailyUserUpdate('id', user);

                responseData.token = {
                    id: jwtToken,
                    source: NATIVE
                }

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

const signInGoogleUser = async (tokenId) => {
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

        const entity = await getEntityByName(userData.id, 'User');

        if (!entity.payload || isEmpty(entity?.payload)) {

            const userKey = await getKey('User', 'email', '=', userData.email)

            if (userKey.length) {

                const user = await getEntityByKey(userKey);
                const userId = user[datastore.KEY].id;

                const jwtToken = jwt.sign({ email: user.email, id: userId }, JWT_PRIVATE_KEY, { expiresIn: '7d' });

                // Update user's last login time
                const userChange = await dailyUserUpdate('id', user);

                responseData.token = {
                    id: jwtToken,
                    source: NATIVE
                }

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

            // Update user's last login time
            const userChange = await dailyUserUpdate('id', entity.payload);
        }

    } else {

        responseData.success = false;
    }

    return responseData;
}

const dailyUserUpdate = async (type, user) => {
    const responseData = {
        success: true
    };

    const transaction = datastore.transaction();
    await transaction.run();

    let idOrName;

    if (type === 'name') {

        idOrName = user[datastore.KEY].name;

    } else if (type === 'id') {

        idOrName = user[datastore.KEY].id;
    }

    const key = datastore.key(['User', type === 'name' ? idOrName.toString() : datastore.int(idOrName)]);

    const lastLogin = new Date(user.configuration.lastLogin);
    const today = new Date();

    if (lastLogin.getDate() !== today.getDate()) {

        user.configuration.hasCheckedIn = false;

        const query = datastore
            .createQuery('Routine')
            .hasAncestor(key)

        const [routineEntities] = await transaction.runQuery(query);

        if (routineEntities && routineEntities.length) {

            const taskEntitiesList = [];

            routineEntities.forEach(routine => {

                if (routine.isDone) routine.isDone = false;

                routine.checklist.map(checklistItem => {

                    if (checklistItem.isDone) checklistItem.isDone = false;
                });

                taskEntitiesList.push({
                    key: routine[datastore.KEY],
                    data: routine
                });
            });

            transaction.save(taskEntitiesList);
        }
    }

    user.configuration.lastLogin = new Date().toISOString();

    const userEntity = {
        key,
        data: user,
    };

    transaction.save(userEntity);

    await transaction.commit();

    return responseData;
}

export {
    signInUser,
    signInGoogleUser,

    getKey,
    getEntityById,
    getEntityByName,
    getEntities,
    getEntitiesWithAncestorId,
    getEntitiesWithAncestorName,

    upsertEntity,
    upsertEntityWithAncestorId,
    upsertEntityWithAncestorName,

    removeEntityWithAncestorId,
    removeEntityWithAncestorName,
    removeEntityById,
    removeEntityByName
};