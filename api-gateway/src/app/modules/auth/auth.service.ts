import { Request } from 'express';
import { IGenericResponse } from '../../../interface/common';
import { apiService } from '../../../shared/axios';

const registrationUser = async (req: Request): Promise<IGenericResponse> => {
  console.log('got making api-server call', req.body);
  const response: IGenericResponse = await apiService.post(
    '/auth/register',
    req.body,
    {
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );
  console.log('User registered successfully', { response });
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

const checkSession = async (req: Request): Promise<IGenericResponse> => {
  const response: IGenericResponse = await apiService.get(
    '/auth/check-session',
    {
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );

  return response;
};

const getUserById = async (req: Request): Promise<IGenericResponse> => {
  const response: IGenericResponse = await apiService.get(
    `/auth/${req.params.id}`,
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
  checkSession,
  getUserById,
};
