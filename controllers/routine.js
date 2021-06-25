import { Datastore } from '@google-cloud/datastore';

import {
    getEntities,
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

// Delete routine
// DELETE /api/v1/routine/:id
// Private
const deleteRoutine = async (request, response) => {

    const routineId = request.params.id;
    const source = request.headers.source;
    const userId = request.userId;

    try {

        let responseData;

        if (source === GOOGLE) {
            responseData = await removeEntityWithAncestorName('Routine', 'User', userId, routineId);
        } else if (source === NATIVE) {
            responseData = await removeEntityWithAncestorId('Routine', 'User', userId, routineId);
        }

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

export { getRoutine, getRoutines, upsertRoutine, deleteRoutine };