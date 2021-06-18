import Joi from 'joi';

import { hashPassword } from '../functions/utility.js';

const userSchema = async (validateUser) => {

    const user = Joi.object({
        firstname: Joi.string()
            .alphanum()
            .max(30)
            .required(),

        lastname: Joi.string()
            .alphanum()
            .max(30)
            .required(),

        email: Joi.string()
            .email({ minDomainSegments: 2 })
            .required(),

        password: Joi.string()
            .min(8)
            .required(),

        // .ref(password) means it should match value of password
        // repeatPassword: Joi.ref('password'),
    });
    // username must be accompanied by birth_year
    // .with('username', 'birth_year')

    // cannot appear together with access_token
    // .xor('password', 'access_token')

    const { value, error } = user.validate(validateUser);

    const validatedData = {
        success: true
    };

    if (error) {
        console.log(error);

        validatedData.success = false;
        validatedData.message = {
            text: error.details[0].message,
            type: 'WARNING'
        }

    } else {

        // If valid, add aditional properties here
        value.password = await hashPassword(value.password);
        value.created = new Date().toISOString();
        value.role = 'USER';

        validatedData.payload = value;
    }

    return validatedData;
}

export default userSchema;