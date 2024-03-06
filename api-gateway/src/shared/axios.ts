import axios, { AxiosInstance } from 'axios';
import config from '../config';

const HttpService = (baseUrl: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return error;
    },
  );

  instance.interceptors.response.use(
    (response) => {
      response.data.statusCode = response.status;
      return response.data;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return instance;
};

const apiService = HttpService(config.services.api);
const videoService = HttpService(config.services.video);

export { HttpService, apiService, videoService };
