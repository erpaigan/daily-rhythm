import bcrypt from 'bcrypt';
import { SALTROUNDS } from '../constants/secrets.js';

const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, SALTROUNDS);

    return hashedPassword;
}

const comparePasswords = async (password, hashedPassword) => {
    const isMatch = await bcrypt.compare(password, hashedPassword);

    return isMatch;
}

const removeObjectProps = (objectWithProps, props) => {
    objectWithProps.map(singleObject => {
        props.forEach(prop => {
            delete singleObject[prop];
        });

        return singleObject;
    });
}

export { hashPassword, comparePasswords, removeObjectProps };