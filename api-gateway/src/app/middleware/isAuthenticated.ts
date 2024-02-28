// disable eslint for this file

import { NextFunction, Request, Response } from 'express';
import ApiError from '../../errors/apiError';
import { errorLogger } from '../../shared/logger';
import { verifyToken } from '../../utils/jwt';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      errorLogger.error('Unauthorized' + ' ' + 'No Authorization header');
      throw new ApiError(401, 'Unauthorized');
    }

    const token = authHeader.split(' ')[1];
    console.log('authHeader', token);
    if (!token) {
      errorLogger.error('Unauthorized' + ' ' + 'Token not found');
      throw new ApiError(401, 'Unauthorized');
    }

    // verify token
    let verifiedUser = null;

    verifiedUser = verifyToken(token);
    console.log('verifiedUser', verifiedUser);
    req.user = verifiedUser; // add user to req object

    console.log('req.user', req.user);

    // use role as authguard
    next();
  } catch (error) {
    next(error);
  }
};

export default isAuthenticated;
