import { Datastore } from '@google-cloud/datastore';
import { getEntity, getEntities, upsertEntity } from '../functions/datastore.js'

const datastore = new Datastore();

// Get a goal
// GET /api/v1/goal/:id
// Private
const getGoal = async (req, res) => {
    try {
        const response = await getEntity(req, 'Goal');

        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: 'An error has occurred while retrieving this goal.'
        })
    }
}

// Get all goals
// GET /api/v1/goal
// Private
const getGoals = async (req, res) => {
    try {
        const response = await getEntities(req, 'Goal', true);

        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: 'An error has occurred while retrieving goals.'
        })
    }
}

// Add goal
// POST /api/v1/goal
// Private
const upsertGoal = async (req, res) => {
    const goal = {
        name: 'Buy Eggs',
        category: 'reminder',
        done: false,
    };

    try {
        const response = await upsertEntity(goal, 'Goal');

        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: 'An error has occurred while adding a goal.'
        })
    }
}

// Delete goal
// DELETE /api/v1/goal
// Private
const deleteGoal = async (req, res, next) => {
    try {
        res.send('DELETE goal');
    } catch (error) {
        next(error);
    }
}

export { getGoal, getGoals, upsertGoal, deleteGoal };