import { Datastore } from '@google-cloud/datastore';

import {
    getEntities,
    getEntityByName,
    getEntityById,
    upsertEntityWithAncestorName,
    upsertEntityWithAncestorId,
    removeEntityWithAncestorName,
    removeEntityWithAncestorId
} from '../functions/datastore.js'
import { hashPassword, comparePasswords, removeObjectProps, removeObjectsListProps } from '../functions/utility.js'
import { GOOGLE, NATIVE } from '../constants/constants.js'

const datastore = new Datastore();

// Get a routine
// GET /api/v1/routine/:id
// Private
const getRoutine = async (request, response) => {

    const source = request.headers.source;

    try {

        let responseData;

        if (source === GOOGLE) {
            responseData = await getEntityByName(request.params.id, 'User');
        } else if (source === NATIVE) {
            responseData = await getEntityById(request.params.id, 'User', source);
        }

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while retrieving this user.'
        })
    }
}

// Get all routines
// GET /api/v1/routine
// Private
const getRoutines = async (request, response) => {

    try {
        const responseData = await getEntities(request.query, 'Routine', true);

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while retrieving routines.'
        })
    }
}

// Add routine
// POST /api/v1/routine
// Private
const upsertRoutine = async (request, response) => {

    const source = request.headers.source;
    const userId = request.userId;
    const validatedRoutine = request.validatedRoutine;
    const routineId = request.params?.id;

    try {

        let responseData;

        if (source === GOOGLE) {
            responseData = await upsertEntityWithAncestorName(validatedRoutine, 'Routine', 'User', userId, routineId);
        } else if (source === NATIVE) {
            responseData = await upsertEntityWithAncestorId(validatedRoutine, 'Routine', 'User', userId, routineId);
        }

        if (!routineId) {

            let userResponse;
            let userKey;

            if (source === GOOGLE) {

                userResponse = await getEntityByName(userId, 'User');
                userKey = datastore.key(['User', userId.toString()]);

            } else if (source === NATIVE) {

                userResponse = await getEntityById(userId, 'User');
                userKey = datastore.key(['User', datastore.int(userId)]);
            }

            userResponse.payload.configuration.routinesOrderedList?.push(responseData.payload.id);

            const updatedUser = {
                key: userKey,
                data: userResponse.payload,
            };

            const [newEntity] = await datastore.upsert(updatedUser);
        }

        responseData.message = {
            type: 'SUCCESS'
        }

        if (!routineId) {

            responseData.payload.created = validatedRoutine.created;

            responseData.message.text = 'Routine added successfully.'

        } else {

            responseData.message.text = 'Changes have been applied.'
        }

        responseData.payload.lastModified = validatedRoutine.lastModified;

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while adding the routine.'
        });
    }

}

const reorderRoutines = async (request, response) => {

    const responseData = {
        success: true
    };

    const source = request.headers.source;
    const idOrName = request.userId;
    const payload = request.body.payload;

    const transaction = datastore.transaction();

    try {

        await transaction.run();

        let type;

        if (source === GOOGLE) {

            type = 'name';

        } else if (source === NATIVE) {

            type = 'id';
        }

        const key = datastore.key(['User', type === 'name' ? idOrName.toString() : datastore.int(idOrName)]);

        const [userEntity] = await transaction.get(key);

        const orderRoutinesList = [...userEntity.configuration.routinesOrderedList];
        const [removed] = orderRoutinesList.splice(payload.routineIndexA, 1);

        orderRoutinesList.splice(payload.routineIndexB, 0, removed);

        userEntity.configuration.routinesOrderedList = [...orderRoutinesList];

        transaction.save({
            key,
            data: userEntity,
        });

        await transaction.commit();

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred on user check in.'
        });
    }
}

// Delete routine
// DELETE /api/v1/routine/:id
// Private
const deleteRoutine = async (request, response) => {

    const routineId = request.params.id;
    const source = request.headers.source;
    const userId = request.userId;

    try {

        let responseData;
        let userResponse;
        let userKey;

        if (source === GOOGLE) {

            responseData = await removeEntityWithAncestorName('Routine', 'User', userId, routineId);

            userResponse = await getEntityByName(userId, 'User');
            userKey = datastore.key(['User', userId.toString()]);

        } else if (source === NATIVE) {

            responseData = await removeEntityWithAncestorId('Routine', 'User', userId, routineId);

            userResponse = await getEntityById(userId, 'User');
            userKey = datastore.key(['User', datastore.int(userId)]);
        }

        const routinesOrderedList = userResponse.payload.configuration.routinesOrderedList;

        const index = routinesOrderedList.indexOf(routineId);

        routinesOrderedList.splice(index, 1);

        const updatedUser = {
            key: userKey,
            data: userResponse.payload,
        };

        const [newEntity] = await datastore.upsert(updatedUser);

        responseData.message = {
            text: 'Routine successfully removed.',
            type: 'SUCCESS'
        }

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while deleting routine.'
        });
    }
}

export { getRoutine, getRoutines, upsertRoutine, reorderRoutines, deleteRoutine };