import { Datastore } from '@google-cloud/datastore';

import {
    getEntities,
    upsertEntity,
    removeEntityById,
    removeEntityByName
} from '../functions/datastore.js';
import { hashPassword, comparePasswords, removeObjectProps, removeObjectsListProps } from '../functions/utility.js';
import { GOOGLE, NATIVE } from '../constants/constants.js'

const datastore = new Datastore();

// Get a user
// GET /api/v1/user/:id
// Private
const getUser = async (request, response) => {
    try {
        // const responseData = await getEntity(request.params.id, 'User', source);

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

// Get all users
// GET /api/v1/user
// Private
const getUsers = async (request, response) => {
    try {
        const responseData = await getEntities(request.query, 'User', true);

        // Remove password from users list
        removeObjectsListProps(responseData.payload, ['password']);

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while retrieving users.'
        })
    }
}

// Add user
// POST /api/v1/user
// Private
const upsertUser = async (request, response) => {

    try {
        const responseData = await upsertEntity(request.body, 'User');

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while adding the user.'
        })
    }

}

// Delete user
// DELETE /api/v1/user
// Private
const deleteUser = async (request, response) => {

    const userId = request.params.id;
    const source = request.headers.source;

    try {

        let responseData;

        if (source === GOOGLE) {
            responseData = await removeEntityByName(userId, 'User');
        } else if (source === NATIVE) {
            responseData = await removeEntityById(userId, 'User');
        }

        responseData.message = {
            text: 'User successfully removed.',
            type: 'SUCCESS'
        }

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while deleting user.'
        });
    }
}

const checkInUser = async (request, response) => {

    const responseData = {
        success: true
    };

    const source = request.headers.source;
    const idOrName = request.userId;

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

        userEntity.configuration.hasCheckedIn = true;

        transaction.save({
            key,
            data: userEntity,
        });

        await transaction.commit();

        responseData.message = {
            text: 'Thank you for checking in today!',
            type: 'SUCCESS'
        }

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred on user check in.'
        });
    }
}

export { getUser, getUsers, upsertUser, deleteUser, checkInUser };