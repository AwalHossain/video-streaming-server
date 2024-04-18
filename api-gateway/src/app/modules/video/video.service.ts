import { Request } from 'express';
import ApiError from '../../../errors/apiError';
import { IGenericResponse } from '../../../interface/common';
import { apiService } from '../../../shared/axios';

const getAllVideos = async (req: Request) => {
  const result: IGenericResponse = await apiService.get('/videos', {
    params: req.query,
    headers: {
      Authorization: req.headers.authorization,
    },
  });

  console.log('result', result);

  if (result.statusCode !== 200)
    throw new ApiError(500, 'Failed to fetch videos');

  return result;
};

const getMyVideos = async (req: Request) => {
  const result: IGenericResponse = await apiService.get('videos/myvideos', {
    params: req.query,
    headers: {
      Authorization: req.headers.authorization,
    },
  });

  console.log('result', result);

  if (result.statusCode !== 200)
    throw new ApiError(500, 'Failed to fetch videos');

  return result;
};

const updateVideo = async (req: Request) => {
  const result: IGenericResponse = await apiService.put(
    `videos/update/${req.params.id}`,
    req.body,
    {
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );

  console.log('result', result);

  if (result.statusCode !== 200)
    throw new ApiError(500, 'Failed to update video');

  return result;
};

const getVideoById = async (req: Request) => {
  const result: IGenericResponse = await apiService.get(
    `videos/${req.params.id}`,
    {
      headers: {
        Authorization: req.headers.authorization,
      },
    },
  );

  console.log('result', result);

  if (result.statusCode !== 200)
    throw new ApiError(500, 'Failed to fetch video');

  return result;
};

export const VideoService = {
  getAllVideos,
  getMyVideos,
  updateVideo,
  getVideoById,
};
