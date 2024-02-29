import { logger } from '@azure/storage-blob';
import { Request } from 'express';
import { IGenericResponse } from '../../../interface/common';
import { apiService } from '../../../shared/axios';

const registrationUser = async (req: Request): Promise<IGenericResponse> => {
  const response: IGenericResponse = await apiService.post(
    '/auth/register',
    req.body,
    {
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );
  logger.info('User registered successfully', { response });
  return response;
};
const loginUser = async (req: Request): Promise<IGenericResponse> => {
  const response: IGenericResponse = await apiService.post(
    '/auth/login',
    req.body,
    {
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );

  return response;
};

export const AuthService = {
  registrationUser,
  loginUser,
};
