import { Request } from 'express';
import ApiError from '../../../errors/apiError';
import { IGenericResponse } from '../../../interface/common';
import { apiService } from '../../../shared/axios';

const getAllVideos = async (req: Request) => {
  const result: IGenericResponse = await apiService.get('/videos', {
    params: req.query,
    headers: {
      Authorization: req.headers.authorization,
      'Content-Type': 'application/json',
    },
  });

  console.log('result', result);

  if (result.statusCode !== 200)
    throw new ApiError(500, 'Failed to fetch videos');

  return result;
};

export const VideoService = {
  getAllVideos,
};
