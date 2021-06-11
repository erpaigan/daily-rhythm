import { Datastore } from '@google-cloud/datastore';
import { getEntity, signInUser, upsertEntity } from '../functions/datastore.js'
import { hashPassword } from '../functions/utility.js'

const datastore = new Datastore();

// Get all users
// GET /api/v1/user
// Private
const postSignIn = async (req, res) => {
    const { source } = req.headers;

    if (source === 'NATIVE') {
        const { email, password } = req.body;

        try {
            const response = await signInUser(email, password);

            return res.status(response.code).json(response);
        } catch (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                error: 'An error has occurred while signing in.'
            })
        }
    } else if (source === 'GOOGLE') {
        const data = req.body;

        // const response = await signInGoogleUser(data);

        return res.status(200).json({})
    }

    // To do: Add sign in for google controller
    //        Add middleware for authenticating google or native requests
}

// Add user
// POST /api/v1/user
// Private
const postSignUp = async (req, res) => {
    const user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        role: 'USER',
        email: req.body.email,
        password: await hashPassword(req.body.password),
    };

    try {
        // Check if user already exists
        const response = await upsertEntity(user, 'User');

        return res.status(200).json(response);
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            error: 'An error has occurred while signing up.'
        })
    }
}

export { postSignIn, postSignUp };