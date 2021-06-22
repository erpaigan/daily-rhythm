import Joi from 'joi';

const routineSchema = async (validateRoutine) => {

    const routine = Joi.object({
        name: Joi.string()
            .max(30)
            .required(),

        details: Joi.alternatives([
            Joi.string()
                .max(50),
            Joi.string().valid('')
        ]),

        isDone: Joi.boolean(),

        timeLastDone: Joi.alternatives([
            Joi.date(),
            Joi.string().valid('')
        ]),

        schedule: Joi.array()
            .items(Joi.string().max(3)),

        lastModified: Joi.alternatives([
            Joi.date(),
            Joi.string().valid('')
        ]),

        checklist: Joi.array()
            .items(Joi.object().keys({
                id: Joi.string(),
                isDone: Joi.boolean(),
                details: Joi.string().max(50),
            })),

        uncheckedList: Joi.array()
            .items(Joi.string().max(50)),

        options: Joi.object().keys({
            isChecklistHidden: Joi.boolean(),
            autoDoneWhenChecklistCompleted: Joi.boolean()
        })

    });

    const { value, error } = routine.validate(validateRoutine);

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

        value.created = new Date().toISOString();

        validatedData.payload = value;
    }

    return validatedData;
}

export default routineSchema;