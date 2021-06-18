import { Datastore } from '@google-cloud/datastore';
import { getEntityById, getEntities, upsertEntity } from '../functions/datastore.js'
import { hashPassword, comparePasswords, removeObjectProps, removeObjectsListProps } from '../functions/utility.js'

const datastore = new Datastore();

// Get a user
// GET /api/v1/user/:id
// Private
const getUser = async (request, response) => {
    try {
        const responseData = await getEntityById(request.params.id, 'User');

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
            error: 'An error has occurred while adding a user.'
        })
    }

}

// Delete user
// DELETE /api/v1/user
// Private
const deleteUser = async (request, response, next) => {
    try {
        response.send('DELETE user');
    } catch (error) {
        next(error);
    }
}

export { getUser, getUsers, upsertUser, deleteUser };