import userSchema from '../../schematics/userSchema.js';

const userValidation = async (request, response, next) => {

    try {
        const validatedUser = await userSchema(request.body.payload);

        if (validatedUser.success) {

            request.validatedUser = validatedUser.payload;

        } else {

            return response.status(200).json(validatedUser);
        }

        next();

    } catch (error) {
        console.log(error);

        return response.status(500).json({
            success: false,
            error: 'An error has occurred while validating user.'
        });
    }
}

export { userValidation }