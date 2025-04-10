import AWS from 'aws-sdk';
import config from '../config';

// Configure S3 client for Digital Ocean Spaces
const s3 = new AWS.S3({
  endpoint: `https://${config.doSpaces.endpoint}`,
  accessKeyId: config.doSpaces.accessKey,
  secretAccessKey: config.doSpaces.secretKey,
  region: config.doSpaces.region || 'us-east-1',
  s3ForcePathStyle: true
});

export default s3;

// Helper function to generate CDN URL for a file
export const getCdnUrl = (key: string): string => {
  const bucketName = config.doSpaces.bucketName;
  const region = config.doSpaces.region || 'sgp1';
  return `https://${bucketName}.${region}.cdn.digitaloceanspaces.com/${key}`;
};

// Helper function to get user folder path
export const getUserFolder = (userId: string, videoId: string): string => {
  return userId 
    ? `uploads/${userId}/videos/${videoId}` 
    : `uploads/anonymous/videos/${videoId}`;
}; 