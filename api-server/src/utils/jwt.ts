import config from "../config";

import jwt from "jsonwebtoken";

const createToken = (id: any) => {
  const token = jwt.sign({ id }, config.jwtSecret, {
    expiresIn: "7d",
  });

  return token;
};

const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};

export { createToken, verifyToken };
