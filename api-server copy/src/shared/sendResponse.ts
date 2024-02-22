import { Response } from "express";

type IApiRespoonse<T> = {
    statusCode: number,
    success: boolean,
    message?: string | null,
    data?: T | null,
    meta?: {
        page?: number,
        limit?: number,
        skip?: number,
    }


}


export const sendResponse = <T>(res: Response, data: IApiRespoonse<T>): void => {

    const responseData: IApiRespoonse<T> = {
        statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        data: data.data || null || undefined,
        meta: data.meta || null || undefined,
    }

    res.status(data.statusCode).json(responseData);

}