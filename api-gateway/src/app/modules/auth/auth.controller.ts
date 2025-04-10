/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import sendResponse from '../../../shared/response';
import { AuthService } from './auth.service';

const registrationUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('registrationUser', req.body);
    const response = await AuthService.registrationUser(req);

    sendResponse(res, response);
  } catch (error) {
    next(error);
  }
};
const loginUer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('got req.body', req.body);

    const response = await AuthService.loginUser(req);
    console.log('loginUser', response);

    sendResponse(res, response);
  } catch (error) {
    next(error);
  }
};

const checkSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await AuthService.checkSession(req);

    sendResponse(res, response);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await AuthService.getUserById(req);

    sendResponse(res, response);
  } catch (error) {
    next(error);
  }
};

export const AuthController = {
  registrationUser,
  loginUer,
  checkSession,
  getUserById,
};
