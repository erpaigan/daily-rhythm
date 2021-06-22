import { Datastore } from '@google-cloud/datastore';

import {
    getEntityByIdOrName,
    getEntities,
    upsertEntityWithAncestorName,
    upsertEntityWithAncestorId
} from '../functions/datastore.js'
import { GOOGLE, NATIVE } from '../constants/constants.js'
import { hashPassword, comparePasswords, removeObjectProps, removeObjectsListProps } from '../functions/utility.js'

const datastore = new Datastore();

// Get a routine
// GET /api/v1/routine/:id
// Private
const getRoutine = async (request, response, source) => {
    try {
        const responseData = await getEntityByIdOrName(request.params.id, 'User', source);

        removeObjectProps(responseData.payload, ['password']);

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
        const responseData = await getEntities(request.query, 'User', true);

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

    try {

        let responseData;

        if (source === GOOGLE) {
            responseData = await upsertEntityWithAncestorName(validatedRoutine, 'Routine', 'User', userId);
        } else if (source === NATIVE) {
            responseData = await upsertEntityWithAncestorId(validatedRoutine, 'Routine', 'User', userId);
        }

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while adding a routine.'
        });
    }

}

// Delete routine
// DELETE /api/v1/routine/:id
// Private
const deleteRoutine = async (request, response, next) => {
    try {
        response.send('DELETE user');
    } catch (error) {
        next(error);
    }
}

export { getRoutine, getRoutines, upsertRoutine, deleteRoutine };