import routineSchema from '../../schematics/routineSchema.js';

const routineValidation = async (request, response, next) => {

    const routineId = request.params?.id;

    try {

        const validatedRoutine = await routineSchema(request.body.payload, routineId);

        if (validatedRoutine.success) {

            request.validatedRoutine = validatedRoutine.payload;

        } else {

            return response.status(200).json(validatedRoutine);
        }

        next();

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while validating routine.'
        });
    }
}

export { routineValidation }