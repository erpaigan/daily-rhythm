import Joi from 'joi';

import { hashPassword, removeObjectProps } from '../functions/utility.js';

const userSchema = async (validateUser, isGoogleAccount) => {

    const user = Joi.object({
        firstname: Joi.string()
            .max(30)
            .required(),

        lastname: Joi.string()
            .max(30)
            .required(),

        email: Joi.string()
            .email({ minDomainSegments: 2 })
            .required(),

        password: isGoogleAccount ? Joi.string().allow(null, '') : Joi.string()
            .min(8)
            .required(),

        confirm: Joi.ref('password')

        // .ref(password) means it should match value of password
        // repeatPassword: Joi.ref('password'),
    });
    // username must be accompanied by birth_year
    // .with('username', 'birth_year')

    // cannot appear together with access_token
    // .xor('password', 'access_token')

    // Joi.number()
    //     .integer(),

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
        if (!isGoogleAccount) value.password = await hashPassword(value.password);

        removeObjectProps(value, ['confirm']);

        value.configuration = {
            lastLogin: '',
            hasCheckedIn: false,
        }

        value.configuration.lastLogin = new Date().toISOString();
        value.created = new Date().toISOString();
        value.role = 'USER';
        value.routinesOrderedList = [];

        validatedData.payload = value;
    }

    return validatedData;
}

export default userSchema;