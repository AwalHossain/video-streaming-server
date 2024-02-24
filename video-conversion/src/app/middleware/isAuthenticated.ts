// disable eslint for this file

import { NextFunction, Request, Response } from 'express';
import ApiError from '../../errors/apiError';
import { errorLogger, logger } from '../../shared/logger';
import { verifyToken } from '../../utils/jwt';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  logger.info('authHeader', authHeader);

  const token = authHeader.split(' ')[1];
  if (!token) {
    errorLogger.error('Unauthorized' + ' ' + 'Token not found');
    throw new ApiError(401, 'Unauthorized');
  }

  // verify token
  let verifiedUser = null;

  verifiedUser = verifyToken(token);

  req.user = verifiedUser; // add user to req object

  logger.info('req.user', JSON.stringify(req.user));

  // use role as authguard
  next();
};

export default isAuthenticated;
