import { Datastore } from '@google-cloud/datastore';
import { getEntity, getEntities, upsertEntity } from '../functions/datastore.js'
import { hashPassword, comparePasswords, removeObjectProps } from '../functions/utility.js'

const datastore = new Datastore();

// Get a user
// GET /api/v1/user/:id
// Private
const getUser = async (req, res) => {
    try {
        const response = await getEntity(req, 'User');

        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: 'An error has occurred while retrieving this user.'
        })
    }
}

// Get all users
// GET /api/v1/user
// Private
const getUsers = async (req, res) => {
    try {
        const response = await getEntities(req, 'User', true);

        // Remove password from users list
        removeObjectProps(response.data, ['password']);

        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: 'An error has occurred while retrieving users.'
        })
    }
}

// Add user
// POST /api/v1/user
// Private
const upsertUser = async (req, res) => {
    const user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        role: 'USER',
        email: req.body.email,
        password: await hashPassword(req.body.password),
    };

    try {
        const response = await upsertEntity(user, 'User');

        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: 'An error has occurred while adding a user.'
        })
    }
}

// Delete user
// DELETE /api/v1/user
// Private
const deleteUser = async (req, res, next) => {
    try {
        res.send('DELETE user');
    } catch (error) {
        next(error);
    }
}

export { getUser, getUsers, upsertUser, deleteUser };