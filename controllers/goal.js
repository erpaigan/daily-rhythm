import { Datastore } from '@google-cloud/datastore';
import { getEntities, upsertEntity } from '../functions/datastore.js'

const datastore = new Datastore();

// Get a goal
// GET /api/v1/goal/:id
// Private
const getGoal = async (req, res) => {

}

// Get all goals
// GET /api/v1/goal
// Private
const getGoals = async (request, response) => {

}

// Add goal
// POST /api/v1/goal
// Private
const upsertGoal = async (req, res) => {

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