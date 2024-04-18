import config from "../config";

import jwt from 'jsonwebtoken';

const createToken = (id: string) => {
    const token = jwt.sign({ id }, config.jwt.secret, {
        expiresIn: "7d",
    });

    return token;
}



const verifyToken = (token:string) => {
    return jwt.verify(token, config.jwt.secret);
}

export { createToken, verifyToken };

