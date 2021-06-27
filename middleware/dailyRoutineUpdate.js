import { Datastore } from '@google-cloud/datastore';

import { GOOGLE, NATIVE } from '../constants/constants.js';

const datastore = new Datastore();

const dailyRoutineUpdate = async (request, response, next) => {

    try {

        const source = request.headers.source;
        const idOrName = request.userId;

        const transaction = datastore.transaction();
        await transaction.run();

        let key;

        if (source === GOOGLE) {

            key = datastore.key(['User', idOrName.toString()]);

        } else if (source === NATIVE) {

            key = datastore.key(['User', datastore.int(idOrName)]);
        }

        const [user] = await transaction.get(key);

        const lastRoutineCheck = new Date(user.configuration.lastRoutineCheck);
        const today = new Date();

        if (lastRoutineCheck.getDate() !== today.getDate()) {

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

        user.configuration.lastRoutineCheck = new Date().toISOString();

        const userEntity = {
            key,
            data: user,
        };

        transaction.save(userEntity);

        await transaction.commit();

    } catch (error) {

        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while authenticating user.'
        });
    }

    next();
}

export default dailyRoutineUpdate;