import { Datastore } from '@google-cloud/datastore';

import {
    getEntitiesWithAncestorId,
    getEntitiesWithAncestorName,
    getEntityById,
    getEntityByName
} from '../functions/datastore.js';
import { NATIVE, GOOGLE } from '../constants/constants.js';

const datastore = new Datastore();

// Get all goals
// GET /api/v1/goal
// Private
const getGoals = async (request, response) => {

    const responseData = {
        success: true,
        payload: {}
    };

    const { source } = request.headers;

    try {

        const userId = request.userId;

        let routinesResponse;

        let userResponse;

        if (source === NATIVE) {

            userResponse = await getEntityById(userId, 'User');

            routinesResponse = await getEntitiesWithAncestorId('Routine', 'User', userId);

        } else if (source === GOOGLE) {

            userResponse = await getEntityByName(userId, 'User');

            routinesResponse = await getEntitiesWithAncestorName('Routine', 'User', userId);
        }

        let user;

        if (userResponse.success) {

            user = userResponse.payload;

            responseData.payload.userProfile = {

                firstname: user.firstname,
                lastname: user.lastname
            }
            responseData.payload.userConfiguration = user.configuration;
        }

        if (routinesResponse.success) {

            const routinesList = routinesResponse.payload;
            const routinesListPayload = [];

            user.configuration.routinesOrderedList.forEach(routineOrdered => {

                routinesList.forEach(routine => {

                    if (routineOrdered === routine.id) {

                        routinesListPayload.push(routine);
                    }
                });
            });

            responseData.payload.routinesList = routinesListPayload;
        }

        return response.status(200).json(responseData);

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while retrieving goals.'
        })
    }
}

export { getGoals };